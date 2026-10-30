/**
 * MQA+ Orali Security Worker — isolated staging foundation.
 * NOT DEPLOYED. Read-only event intake only; no AI privileges or destructive actions.
 * Bindings required: SECURITY_EVENTS (D1), INTAKE_HMAC_KEY (secret).
 * Provider adapters must validate their own vendor signature before forwarding events
 * signed by our trusted integration gateway.
 */
const encoder = new TextEncoder();
const json = (obj, status = 200) => new Response(JSON.stringify(obj), {
  status,
  headers: {"content-type":"application/json; charset=utf-8","cache-control":"no-store",
    "x-content-type-options":"nosniff","referrer-policy":"no-referrer"}
});
const hex = bytes => [...new Uint8Array(bytes)].map(n=>n.toString(16).padStart(2,"0")).join("");
const safeEqual = (a,b) => {
  if (a.length !== b.length) return false;
  let v=0; for(let i=0;i<a.length;i++) v |= a.charCodeAt(i)^b.charCodeAt(i); return v===0;
};
async function validSignature(secret, time, raw, signature) {
  if (!/^v1=[0-9a-f]{64}$/.test(signature ?? "")) return false;
  const k = await crypto.subtle.importKey("raw", encoder.encode(secret), {name:"HMAC",hash:"SHA-256"},false,["sign"]);
  const mac = hex(await crypto.subtle.sign("HMAC", k, encoder.encode(time+"."+raw)));
  return safeEqual("v1="+mac, signature);
}
const allowedTypes = new Set(["suspicious_login","malware_detected","policy_violation","deployment_warning","network_outage","other"]);
const allowedSeverities = new Set(["low","medium","high","critical"]);
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/health" && request.method === "GET") return json({service:"mqa-security-worker",status:"running"});
    if (url.pathname !== "/internal/events" || request.method !== "POST") return json({error:"not_found"},404);
    if (!env.INTAKE_HMAC_KEY || !env.SECURITY_EVENTS) return json({error:"not_configured"},503);
    if (request.headers.get("content-type")?.split(";")[0]?.trim() !== "application/json") return json({error:"unsupported_media_type"},415);
    const time=request.headers.get("x-mqa-timestamp") ?? "";
    const signature=request.headers.get("x-mqa-signature") ?? "";
    if (!/^\d{10,13}$/.test(time) || Math.abs(Date.now()-Number(time)) > 5*60*1000) return json({error:"unauthorized"},401);
    const raw=await request.text();
    if (raw.length > 16384) return json({error:"payload_too_large"},413);
    if (!(await validSignature(env.INTAKE_HMAC_KEY,time,raw,signature))) return json({error:"unauthorized"},401);
    let event; try { event=JSON.parse(raw); } catch { return json({error:"invalid_json"},400); }
    if (!event || typeof event!=="object" || Array.isArray(event)) return json({error:"invalid_event"},400);
    const {event_id,source,type,severity,observed_at,summary}=event;
    if (!/^[a-zA-Z0-9_-]{8,128}$/.test(event_id??"") ||
        !["cloudflare","microsoft","github","network","test"].includes(source) ||
        !allowedTypes.has(type) || !allowedSeverities.has(severity) ||
        typeof observed_at !== "string" || !Number.isFinite(Date.parse(observed_at)) ||
        typeof summary !== "string" || summary.length > 280) return json({error:"invalid_event"},400);
    try {
      const result=await env.SECURITY_EVENTS.prepare(
        "INSERT OR IGNORE INTO security_events (event_id,source,type,severity,observed_at,summary,received_at) VALUES (?,?,?,?,?,?,?)"
      ).bind(event_id,source,type,severity,observed_at,summary,new Date().toISOString()).run();
      return json({accepted:Boolean(result.meta?.changes),event_id},202);
    } catch { return json({error:"storage_unavailable"},503); }
  }
};
