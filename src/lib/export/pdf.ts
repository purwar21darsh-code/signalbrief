import { chromium } from "playwright";
import { BriefingFull } from "@/types";
import { formatDateSafe, normalizeSourceUrl } from "@/lib/utils";

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character] || character));
}

/** Render the executive report through Chromium and Playwright as one A4 page. */
export async function generateBriefingPdf(briefing: BriefingFull): Promise<Buffer> {
  const sourceNumbers = new Map(briefing.sources.map((source, index) => [source.id, index + 1]));
  const citations = (ids: string[]) => ids.map((id) => sourceNumbers.get(id)).filter(Boolean).map((number) => `<sup>[${number}]</sup>`).join(" ");
  const developments = briefing.developments.map((item) => `<article class="finding">
    <div class="finding-top"><strong>${escapeHtml(item.headline)}</strong><span>${escapeHtml(item.eventDate || "Date unknown")}</span></div>
    <p>${escapeHtml(item.whatHappened)}</p><p class="why"><b>Why it matters:</b> ${escapeHtml(item.whyItMatters)} ${citations(item.sourceIds)}</p>
    <span class="status">${escapeHtml(item.verificationStatus)} · ${escapeHtml(item.confidence)} confidence</span>
  </article>`).join("") || `<p class="empty">No recent development was confirmed from dated evidence in this research window.</p>`;
  const implications = briefing.implications.map((item) => `<li><b>${escapeHtml(item.area)} · Analysis</b><br>${escapeHtml(item.implication)}</li>`).join("") || `<li>No evidence-backed strategic implication was available.</li>`;
  const questions = briefing.questions.map((item) => `<li>${escapeHtml(item.question)}</li>`).join("");
  const watchlist = briefing.watchlist.map((item) => `<li><b>${escapeHtml(item.topic)}:</b> ${escapeHtml(item.concern)}</li>`).join("") || `<li>No additional uncertainty recorded.</li>`;
  const sources = briefing.sources.map((source, index) => {
    const safeUrl = normalizeSourceUrl(source.url);
    const title = escapeHtml(source.title);
    const link = safeUrl ? `<a href="${escapeHtml(safeUrl)}">${title}</a>` : title;
    return `<li><span>[${index + 1}]</span> ${link} · ${escapeHtml(source.domain)} · ${escapeHtml(source.publicationDate || "Date unknown")}</li>`;
  }).join("");
  const meetingTime = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short", timeZone: briefing.meeting.timezone }).format(new Date(briefing.meeting.meetingDateTime));
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; color: #18243a; font-family: Arial, Helvetica, sans-serif; }
    .sheet { width: 210mm; height: 297mm; overflow: hidden; padding: 9mm 11mm 8mm; display: flex; flex-direction: column; gap: 5px; }
    header { background: #111c32; color: #fff; padding: 10px 13px; display: flex; align-items: center; justify-content: space-between; border-radius: 5px; }
    header h1 { margin: 0; font-size: 17px; letter-spacing: .08em; }
    header p { margin: 3px 0 0; font-size: 8px; color: #c5d4ec; }
    .mode { font-size: 7px; font-weight: 700; border: 1px solid #8299bf; border-radius: 99px; padding: 5px 7px; text-align: center; }
    .entity { border-bottom: 1px solid #dbe2ed; padding: 5px 0 7px; }
    .entity h2 { font-size: 14px; margin: 0 0 3px; }
    .meta { font-size: 7.5px; color: #52627a; }
    .snapshot { background: #f3f6fa; border-left: 3px solid #3869b2; padding: 7px 9px; font-size: 8px; line-height: 1.35; }
    .snapshot h3, section h3 { font-size: 8px; letter-spacing: .08em; text-transform: uppercase; margin: 0 0 4px; color: #2e4f80; }
    .snapshot p { margin: 0; }
    .columns { display: grid; grid-template-columns: 1.1fr .9fr; gap: 10px; min-height: 0; }
    section { min-width: 0; }
    .finding { padding: 5px 0; border-bottom: 1px solid #e1e6ef; font-size: 7.6px; line-height: 1.28; }
    .finding-top { display: flex; justify-content: space-between; align-items: baseline; gap: 5px; }
    .finding-top strong { font-size: 8px; }
    .finding-top span, .status { color: #607088; font-size: 6.5px; white-space: nowrap; }
    .finding p { margin: 2px 0; }
    .why { color: #43536a; }
    sup { color: #255aa7; font-weight: 700; }
    ul { padding-left: 13px; margin: 2px 0 7px; }
    li { font-size: 7.4px; line-height: 1.3; margin: 2px 0; }
    .empty { color: #596981; font-size: 8px; padding: 8px 0; }
    .sources { border-top: 1px solid #cfd8e5; padding-top: 5px; }
    .sources li { font-size: 6.5px; line-height: 1.2; overflow-wrap: anywhere; }
    a { color: #235ca8; text-decoration: none; }
    footer { margin-top: auto; display: flex; justify-content: space-between; color: #66768d; font-size: 6px; }
    body.compact .sheet { gap: 3px; padding-top: 7mm; padding-bottom: 6mm; }
    body.compact .finding, body.compact li { font-size: 6.8px; }
    body.compact .snapshot, body.compact .finding { line-height: 1.2; }
    body.compact header { padding: 7px 10px; }
  </style></head><body><main class="sheet">
    <header><div><h1>SIGNALBRIEF</h1><p>Evidence-first meeting intelligence · ${briefing.isDemo ? "archived demo data · not live research" : "live Tavily + Bifrost research"}</p></div><span class="mode">${briefing.isDemo ? "ARCHIVED DEMO" : "LIVE RESEARCH"}</span></header>
    <div class="entity"><h2>${escapeHtml(briefing.meeting.entityName)} <span class="meta">· ${escapeHtml(briefing.meeting.entityType)}</span></h2><div class="meta">Meeting ${escapeHtml(meetingTime)} (${escapeHtml(briefing.meeting.timezone)}) · ${escapeHtml(briefing.meeting.meetingPurpose.replaceAll("_", " "))} · Generated ${escapeHtml(formatDateSafe(briefing.generatedAt, "MMM d, yyyy HH:mm"))} · Window ${escapeHtml(formatDateSafe(briefing.researchWindowStart))}–${escapeHtml(formatDateSafe(briefing.researchWindowEnd))}</div></div>
    <div class="snapshot"><h3>Executive snapshot</h3><p>${escapeHtml(briefing.executiveSummary || "No executive summary available.")}</p></div>
    <div class="columns"><section><h3>What changed in the last 30 days</h3>${developments}<h3>Strategic implications · analysis</h3><ul>${implications}</ul></section><section><h3>Questions to ask</h3><ul>${questions}</ul><h3>Watchlist</h3><ul>${watchlist}</ul></section></div>
    <section class="sources"><h3>Sources</h3><ol>${sources}</ol></section>
    <footer><span>Source dates are shown as reported; unknown dates are not treated as recent evidence.</span><span>${briefing.sources.length} sources · ${briefing.wordCount || 0} words</span></footer>
  </main></body></html>`;

  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
  try {
    const page = await browser.newPage({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: "load" });
    for (let attempt = 0; attempt < 3; attempt++) {
      const overflows = await page.evaluate(() => {
        const sheet = document.querySelector(".sheet") as HTMLElement;
        return sheet.scrollHeight > sheet.clientHeight + 1;
      });
      if (!overflows) break;
      if (attempt === 2) throw new Error("The briefing exceeds the one-page A4 PDF layout. Shorten the report and retry export.");
      await page.evaluate(() => document.body.classList.add("compact"));
    }
    const pdf = await page.pdf({ format: "A4", printBackground: true, preferCSSPageSize: true, margin: { top: "0", right: "0", bottom: "0", left: "0" } });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
