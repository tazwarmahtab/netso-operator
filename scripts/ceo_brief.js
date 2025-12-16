/**
 * Daily CEO Brief generator (free, no LLM).
 * Reads ops/priorities.md and produces ops/briefs/YYYY-MM-DD.md
 * Sends an executive summary to Telegram.
 */

const fs = require("fs");
const path = require("path");

async function sendTelegram(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.log("Telegram not configured (missing secrets). Skipping send.");
    return;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const payload = {
    chat_id: chatId,
    text,
    parse_mode: "Markdown",
    disable_web_page_preview: false,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!data.ok) {
    throw new Error(`Telegram send failed: ${JSON.stringify(data)}`);
  }
}

function todayISO() {
  // GitHub runners use UTC. We want Dhaka date.
  // Dhaka is UTC+6. We'll shift time by +6 hours then take YYYY-MM-DD.
  const now = new Date();
  const dhaka = new Date(now.getTime() + 6 * 60 * 60 * 1000);
  return dhaka.toISOString().slice(0, 10);
}

function readFileSafe(p) {
  try {
    return fs.readFileSync(p, "utf8");
  } catch {
    return "";
  }
}

function extractSection(md, heading) {
  // crude but reliable: find "## Heading" and return until next "## "
  const re = new RegExp(`^##\\s+${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "m");
  const m = md.match(re);
  if (!m) return "";
  const start = m.index + m[0].length;
  const rest = md.slice(start);
  const next = rest.search(/^##\s+/m);
  return (next === -1 ? rest : rest.slice(0, next)).trim();
}

function findLatestBrief(briefDir) {
  if (!fs.existsSync(briefDir)) return null;
  const files = fs.readdirSync(briefDir).filter(f => f.endsWith(".md"));
  const dated = files
    .map(f => ({ f, d: f.replace(".md", "") }))
    .filter(x => /^\d{4}-\d{2}-\d{2}$/.test(x.d))
    .sort((a, b) => (a.d < b.d ? 1 : -1));
  return dated.length ? path.join(briefDir, dated[0].f) : null;
}

(async () => {
  const repo = process.env.GITHUB_REPO || "OWNER/REPO";
  const date = todayISO();

  const prioritiesPath = path.join("ops", "priorities.md");
  const briefDir = path.join("ops", "briefs");
  const briefPath = path.join(briefDir, `${date}.md`);

  const priorities = readFileSafe(prioritiesPath);
  if (!priorities) {
    throw new Error("Missing ops/priorities.md — create it first.");
  }

  if (!fs.existsSync(briefDir)) fs.mkdirSync(briefDir, { recursive: true });

  const thisWeek = extractSection(priorities, "This Week Outcomes (measurable)");
  const todayTop = extractSection(priorities, "Today — Top Priorities (in order)");
  const blockers = extractSection(priorities, "Blockers / Risks");
  const decisions = extractSection(priorities, "Decisions Needed");
  const notes = extractSection(priorities, "Notes");

  const latestBriefPath = findLatestBrief(briefDir);
  const yesterdayRef = latestBriefPath ? path.basename(latestBriefPath, ".md") : "N/A";

  const managerReport = `# Daily CEO Brief — Netso
**Date/time:** ${date} — 10:00 (Asia/Dhaka)

## Detailed Manager Report

### 1) Top priorities (in order)
${todayTop || "_(Not set — update ops/priorities.md)_"}  

### 2) Progress since yesterday
- Reference previous brief: **${yesterdayRef}**
- _Update ops/run-log.md with what shipped yesterday so this section becomes factual._

### 3) Blockers / Risks
${blockers || "_None listed_"}  

### 4) Decisions needed
${decisions || "_None listed_"}  

### 5) Docs/checklists to create or update
- ops/priorities.md (update daily)
- ops/run-log.md (log real progress)
- ops/briefs/${date}.md (this report)

## Notes
${notes || "_No notes_"}
`;

  // Write brief to repo
  fs.writeFileSync(briefPath, managerReport, "utf8");

  // Telegram exec summary (short, punchy)
  const briefUrl = `https://github.com/${repo}/blob/main/ops/briefs/${date}.md`;

  const execSummary = `*Netso — CEO Brief (${date})*
*Top priorities:* ${todayTop ? "" : "_(Not set)_"}
${todayTop ? todayTop.split("\n").slice(0, 6).join("\n") : ""}

*Blockers:* ${blockers ? blockers.split("\n").slice(0, 4).join("\n") : "_None listed_"}
*Decisions:* ${decisions ? decisions.split("\n").slice(0, 4).join("\n") : "_None listed_"}
*Full report:* ${briefUrl}`;

  // Telegram has message limits; keep it compact.
  await sendTelegram(execSummary);

  console.log(`Wrote brief: ${briefPath}`);
  console.log(`Telegram sent (if secrets set).`);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
