const baseUrl = process.env.LAMBDAIDX_BASE_URL || "http://127.0.0.1:3000";
const internalApiKey = process.env.INTERNAL_API_KEY;

if (!internalApiKey) {
  console.error("INTERNAL_API_KEY is required to run the reindex script.");
  process.exit(1);
}

const headers = {
  "x-internal-key": internalApiKey,
};

const response = await fetch(`${baseUrl}/api/search/reindex`, {
  method: "POST",
  headers,
});

const payload = await response.json().catch(() => ({}));

if (!response.ok) {
  console.error("Reindex request failed.");
  console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

console.log("Reindex completed.");
console.log(JSON.stringify(payload, null, 2));
