# SignalBrief · 90-second demonstration

## Before presenting

For the live integration demonstration, configure a real Tavily key and a working Bifrost gateway/model. Run a live Microsoft briefing (or another public company) with Demo Mode off, and confirm its persisted activity shows Bifrost planning, Tavily query results/extraction, claim checks and source links. Research can take longer than the speaking slot; have the completed live run open so the real search/inference events can be inspected. Do not label an archived report as a live run.

The included Microsoft snapshot is archived at **April 10, 2025**. Its cited posts are [Microsoft: Your AI Companion](https://blogs.microsoft.com/blog/2025/04/04/your-ai-companion/) and [Microsoft's 50th anniversary](https://blogs.microsoft.com/blog/2025/04/04/celebrating-microsofts-50-years/). Use `/demo` only to show the interface without credentials; it is not proof of live integration.

## Talk track

### 0:00–0:15 · The problem

Open the SignalBrief landing page.

> “Before an important meeting, people need a fast way to understand what changed, where that information came from, and what is still unclear. A generic summary often hides the evidence trail. SignalBrief prepares a source-linked meeting brief from a bounded research window.”

### 0:15–0:30 · Enter meeting context

Open **Create Briefing**. Enter a public company, select company/person, a meeting date/time and timezone, purpose and objective. Leave Demo Mode off. Show the generated 30-day window.

> “The window follows the scheduled meeting date, but it stops at research time if the meeting is in the future. The objective steers the research plan.”

### 0:30–0:55 · Show real research activity

Open the live activity for the prepared live run. Show the Bifrost-created query angles and Tavily search/extract counts. Point to any partial query errors.

> “Bifrost identifies the subject and plans several focused searches. Tavily performs the web searches and extracts selected pages. These are provider calls from this run, and the activity is persisted so we can inspect what happened.”

### 0:55–1:15 · Inspect evidence

Open a development card and its citation. Show publication date, original URL, extraction, the associated claim and status. Mention that undated or out-of-window articles are kept as background, not recent events.

> “The model can only cite URLs in the source set. SignalBrief checks those citations and event dates, and surfaces conflicts or gaps. The status is an evidence assessment, not a guarantee that a publisher is correct.”

### 1:15–1:30 · Meeting value and export

Show one implication and a tailored question, then export the PDF.

> “The brief separates developments from meeting analysis, gives us concrete questions to ask, and exports the saved report to A4. If there is not enough dated evidence, it says so instead of filling the page with guesses.”

## If live credentials are unavailable

Open `/demo`, point out the persistent **Archived Demo Data · Not Live Research** label and the April 2025 dates, inspect a source and PDF. Tell judges directly that this path demonstrates report handling only; the live Tavily/Bifrost calls require configured credentials. Do not use any historical demo output to claim current Microsoft developments.
