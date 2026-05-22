const baseUrl = process.env.LAMBDAIDX_BASE_URL || "http://127.0.0.1:3000";
const internalApiKey = process.env.INTERNAL_API_KEY || "";
const query = process.env.SMOKE_QUERY || "introduction";

const headers = {};
if (internalApiKey) {
  headers["x-internal-key"] = internalApiKey;
}

async function requestJson(url, init) {
  const response = await fetch(url, init);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(`${url} failed with ${response.status}: ${JSON.stringify(payload)}`);
  }

  return payload;
}

async function main() {
  console.log(`Smoke test target: ${baseUrl}`);

  const health = await requestJson(`${baseUrl}/api/health`);
  console.log("Health OK");
  console.log(JSON.stringify(health, null, 2));

  const reindex = await requestJson(`${baseUrl}/api/search/reindex`, {
    method: "POST",
    headers,
  });
  console.log("Reindex OK");
  console.log(JSON.stringify(reindex, null, 2));

  const search = await requestJson(
    `${baseUrl}/api/search?q=${encodeURIComponent(query)}&limit=5`
  );
  console.log("Search OK");
  console.log(JSON.stringify(search, null, 2));
}

main().catch((error) => {
  console.error("Smoke test failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
