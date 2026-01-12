import crypto from "crypto";

type Payload = {
  rid: string; // reservation id
  vid: string; // venue id
  exp: number; // unix seconds
};

function b64url(input: Buffer | string) {
  const b = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return b.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function unb64url(s: string) {
  const pad = 4 - (s.length % 4 || 4);
  const base64 = (s + "=".repeat(pad)).replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(base64, "base64").toString("utf8");
}

export function createCheckinToken(payload: Omit<Payload, "exp">, ttlMinutes = 60 * 24) {
  const exp = Math.floor(Date.now() / 1000) + ttlMinutes * 60;
  const full: Payload = { ...payload, exp };
  const secret = process.env.NEXTAUTH_SECRET || "dev-secret";

  const body = b64url(JSON.stringify(full));
  const sig = b64url(crypto.createHmac("sha256", secret).update(body).digest());
  return `${body}.${sig}`;
}

export function verifyCheckinToken(token: string): { ok: true; payload: Payload } | { ok: false; error: string } {
  const secret = process.env.NEXTAUTH_SECRET || "dev-secret";
  const parts = token.split(".");
  if (parts.length !== 2) return { ok: false, error: "FORMAT_INVALID" };

  const [body, sig] = parts;
  const expected = b64url(crypto.createHmac("sha256", secret).update(body).digest());
  if (sig !== expected) return { ok: false, error: "SIGNATURE_INVALID" };

  const payload = JSON.parse(unb64url(body)) as Payload;
  if (!payload?.rid || !payload?.vid || !payload?.exp) return { ok: false, error: "PAYLOAD_INVALID" };

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) return { ok: false, error: "EXPIRED" };

  return { ok: true, payload };
}
