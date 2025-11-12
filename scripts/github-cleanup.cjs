const https = require("https");
const KEEP = process.env.KEEP_REPO || process.argv[2];
const OWNER = process.env.GITHUB_OWNER || process.argv[3];
const TOKEN = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
const DELETE = process.env.DELETE === "1";
if (!KEEP || !OWNER || !TOKEN) {
  console.error("Usage: KEEP_REPO=<repo> GITHUB_OWNER=<owner> GH_TOKEN=<token> [DELETE=1] node scripts/github-cleanup.cjs");
  process.exit(1);
}
function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: "api.github.com",
      path,
      method,
      headers: {
        "Authorization": `Bearer ${TOKEN}`,
        "User-Agent": "repo-cleanup",
        "Accept": "application/vnd.github+json",
        "Content-Type": "application/json",
        "Content-Length": data ? Buffer.byteLength(data) : 0,
      },
    }, (res) => {
      let chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        const txt = Buffer.concat(chunks).toString("utf8");
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(txt ? JSON.parse(txt) : null);
        } else {
          reject(new Error(`${res.statusCode} ${txt}`));
        }
      });
    });
    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
}
async function listRepos() {
  let page = 1;
  const repos = [];
  while (true) {
    const r = await request("GET", `/user/repos?per_page=100&page=${page}`);
    if (!Array.isArray(r) || r.length === 0) break;
    repos.push(...r);
    page++;
  }
  return repos.filter((repo) => repo.owner && repo.owner.login === OWNER);
}
async function run() {
  const repos = await listRepos();
  const targets = repos.filter((r) => r.name !== KEEP);
  for (const repo of targets) {
    const path = `/repos/${OWNER}/${repo.name}`;
    if (DELETE) {
      await request("DELETE", path);
      console.log(`deleted ${repo.name}`);
    } else {
      await request("PATCH", path, { archived: true });
      console.log(`archived ${repo.name}`);
    }
  }
  console.log(`kept ${KEEP}`);
}
run().catch((e) => {
  console.error(e.message || String(e));
  process.exit(1);
});
