import crypto from "crypto";

const TW_API_KEY    = "dPkI6MtIj8IlFRn4diMbMlk6M";
const TW_API_SECRET = "bmLJhngn20NpPWJdUHjdnBqlDSFQ4fiy7kZEAMuumZgn2OtuIz";
const TW_TOKEN      = "1814208431051743232-gIm3fLxNn4YycLtByoOp9y5QiLYAWf";
const TW_TOKEN_SEC  = "VYfDrFVXluT4duBLWT7uFrHwsKPByy90qQKUdfZWbCBz7";

function buildOAuthHeader(method, url) {
  const p = {
    oauth_consumer_key:     TW_API_KEY,
    oauth_nonce:            crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp:        Math.floor(Date.now() / 1000).toString(),
    oauth_token:            TW_TOKEN,
    oauth_version:          "1.0",
  };
  const paramStr = Object.keys(p).sort()
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(p[k])}`).join("&");
  const base = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(paramStr)}`;
  const key  = `${encodeURIComponent(TW_API_SECRET)}&${encodeURIComponent(TW_TOKEN_SEC)}`;
  p.oauth_signature = crypto.createHmac("sha1", key).update(base).digest("base64");
  return "OAuth " + Object.keys(p).sort()
    .map(k => `${encodeURIComponent(k)}="${encodeURIComponent(p[k])}"`)
    .join(", ");
}

// v2 ile dene
console.log("🐦 v2 deneniyor...");
const v2url = "https://api.twitter.com/2/tweets";
const v2res = await fetch(v2url, {
  method: "POST",
  headers: { Authorization: buildOAuthHeader("POST", v2url), "Content-Type": "application/json" },
  body: JSON.stringify({ text: "🤖 Serik Haberleri botu aktif! https://www.serikhaberleri.com #Serik" }),
});
const v2data = await v2res.json();
console.log("v2 HTTP:", v2res.status, JSON.stringify(v2data));

// v1.1 ile dene
console.log("\n🐦 v1.1 deneniyor...");
const v1url  = "https://api.twitter.com/1.1/statuses/update.json";
const body   = { status: "🤖 Serik Haberleri botu aktif! https://www.serikhaberleri.com #Serik" };

function buildOAuth11(method, url, bodyParams) {
  const p = {
    oauth_consumer_key:     TW_API_KEY,
    oauth_nonce:            crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp:        Math.floor(Date.now() / 1000).toString(),
    oauth_token:            TW_TOKEN,
    oauth_version:          "1.0",
  };
  const allParams = { ...p, ...bodyParams };
  const paramStr = Object.keys(allParams).sort()
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(allParams[k])}`).join("&");
  const base = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(paramStr)}`;
  const key  = `${encodeURIComponent(TW_API_SECRET)}&${encodeURIComponent(TW_TOKEN_SEC)}`;
  p.oauth_signature = crypto.createHmac("sha1", key).update(base).digest("base64");
  return "OAuth " + Object.keys(p).sort()
    .map(k => `${encodeURIComponent(k)}="${encodeURIComponent(p[k])}"`)
    .join(", ");
}

const v1res  = await fetch(v1url, {
  method: "POST",
  headers: { Authorization: buildOAuth11("POST", v1url, body), "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams(body),
});
const v1data = await v1res.json();
console.log("v1.1 HTTP:", v1res.status, JSON.stringify(v1data));
