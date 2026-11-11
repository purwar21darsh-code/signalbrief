"""Create the SignalBrief six-slide hackathon outline as a PowerPoint deck."""
from pathlib import Path

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.util import Inches, Pt


OUT = Path("submission/SignalBrief_PitchDeck.pptx")
BG = RGBColor(13, 20, 34)
CARD = RGBColor(25, 36, 56)
BLUE = RGBColor(90, 150, 255)
MINT = RGBColor(92, 220, 187)
WHITE = RGBColor(244, 247, 252)
MUTED = RGBColor(174, 188, 207)


def textbox(slide, x, y, w, h, text, size, color=WHITE, bold=False):
    shape = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = shape.text_frame
    tf.word_wrap = True
    tf.margin_left = Inches(0.04)
    tf.margin_right = Inches(0.04)
    tf.margin_top = Inches(0.02)
    tf.margin_bottom = Inches(0.02)
    p = tf.paragraphs[0]
    p.text = text
    p.font.name = "Aptos"
    p.font.size = Pt(size)
    p.font.bold = bold
    p.font.color.rgb = color
    return shape


def base_slide(prs, number, tag, title, subtitle=""):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
    bg.fill.solid()
    bg.fill.fore_color.rgb = BG
    bg.line.color.rgb = BG
    textbox(slide, 0.72, 0.38, 11.7, 0.28, tag.upper(), 10, MINT, True)
    textbox(slide, 0.72, 0.82, 11.8, 0.68, title, 26, WHITE, True)
    if subtitle:
        textbox(slide, 0.74, 1.52, 11.7, 0.52, subtitle, 12, MUTED)
    textbox(slide, 12.2, 7.1, 0.5, 0.2, f"{number:02d}", 9, MUTED)
    return slide


def card(slide, x, y, w, h, title, body, accent=BLUE):
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h))
    shape.fill.solid()
    shape.fill.fore_color.rgb = CARD
    shape.line.color.rgb = RGBColor(47, 64, 90)
    shape.text_frame.clear()
    shape.text_frame.word_wrap = True
    shape.text_frame.margin_left = Inches(0.2)
    shape.text_frame.margin_right = Inches(0.2)
    shape.text_frame.margin_top = Inches(0.16)
    p = shape.text_frame.paragraphs[0]
    p.text = title
    p.font.name = "Aptos Display"
    p.font.size = Pt(17)
    p.font.bold = True
    p.font.color.rgb = accent
    p2 = shape.text_frame.add_paragraph()
    p2.text = body
    p2.font.name = "Aptos"
    p2.font.size = Pt(12)
    p2.font.color.rgb = MUTED
    p2.space_before = Pt(9)


def main():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    slide = prs.slides.add_slide(prs.slide_layouts[6])
    bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
    bg.fill.solid(); bg.fill.fore_color.rgb = BG; bg.line.color.rgb = BG
    textbox(slide, 0.95, 1.35, 11.4, 0.35, "GLOBAL AI HACKATHON 2026  ·  PROBLEM STATEMENT 05", 12, MINT, True)
    textbox(slide, 0.92, 2.0, 11.5, 1.05, "SIGNALBRIEF", 48, WHITE, True)
    textbox(slide, 0.98, 3.2, 11.3, 0.55, "Evidence-first meeting intelligence", 24, BLUE, True)
    textbox(slide, 0.98, 4.02, 10.8, 0.6, "Know what matters before you enter the room.", 18, MUTED)
    textbox(slide, 0.98, 5.45, 11.5, 0.6, "Tavily Search + Extract  ·  Bifrost by Maxim AI  ·  Source-backed one-page briefings", 13, WHITE)

    slide = base_slide(prs, 2, "Problem and opportunity", "A meeting starts before everyone enters the room", "Fresh context is scattered; a useful brief must make its evidence easy to inspect.")
    card(slide, 0.75, 2.4, 3.75, 3.7, "Research is fragmented", "People jump between announcements, news, filings and meeting notes, often under time pressure.")
    card(slide, 4.78, 2.4, 3.75, 3.7, "Summaries need provenance", "A fluent summary is hard to trust when dates, sources, uncertainty and interpretation are mixed together.")
    card(slide, 8.8, 2.4, 3.75, 3.7, "The opportunity", "Turn a bounded 30-day research window into a practical briefing with sources, questions and open issues.", MINT)

    slide = base_slide(prs, 3, "Solution and architecture", "A focused workflow with genuine research services", "Next.js + Prisma on the server; external content remains evidence, never instructions.")
    card(slide, 0.75, 2.4, 3.75, 3.7, "1 · Plan with Bifrost", "Resolve the meeting subject and generate 4–8 structured query angles through the configured Bifrost gateway.", BLUE)
    card(slide, 4.78, 2.4, 3.75, 3.7, "2 · Research with Tavily", "Run multi-angle web search, then extract selected pages. Keep dates, original URLs, domains and query context.", MINT)
    card(slide, 8.8, 2.4, 3.75, 3.7, "3 · Save and export", "Validate structured output, persist claims and source links in Prisma, stream actual stage events and render A4 with Playwright.", BLUE)

    slide = base_slide(prs, 4, "Research and verification", "Recent facts, analysis and uncertainty stay distinct", "Application checks constrain what the model can put into the briefing.")
    card(slide, 0.75, 2.4, 3.75, 3.7, "Dated evidence", "The 30-day window follows the meeting date and caps future meetings at research time. Unknown/out-of-window sources stay background.", MINT)
    card(slide, 4.78, 2.4, 3.75, 3.7, "Citation checks", "Generated source URLs must map to Tavily results. Findings without accepted evidence or in-window event dates are dropped.", BLUE)
    card(slide, 8.8, 2.4, 3.75, 3.7, "Open issues", "Conflicts, partial search failures and missing dates remain visible. Relevance heuristics are separate from factual confidence.", MINT)

    slide = base_slide(prs, 5, "Product demonstration", "From meeting context to questions worth asking", "Live demo: show a real Tavily/Bifrost run with Demo Mode off.")
    card(slide, 0.75, 2.4, 3.75, 3.7, "Observe the run", "Inspect Bifrost query planning, Tavily searches/extraction, source counts, saved stages and any partial failures.", BLUE)
    card(slide, 4.78, 2.4, 3.75, 3.7, "Open a citation", "Review the publisher, date, original URL, extracted text and claims associated with the source.", MINT)
    card(slide, 8.8, 2.4, 3.75, 3.7, "Take the brief", "See meeting implications, 4–6 tailored questions, watchlist and downloadable A4 PDF.", BLUE)
    textbox(slide, 0.84, 6.35, 11.6, 0.3, "No credentials? /demo is an archived Microsoft snapshot from April 2025, not live research.", 10, MUTED)

    slide = base_slide(prs, 6, "Impact, reliability and roadmap", "Useful now, with clear next steps for production", "No performance or accuracy figures are claimed without evaluation data.")
    card(slide, 0.75, 2.4, 3.75, 3.7, "Value", "Reduce context switching and enter the conversation with dated findings, source links and concrete questions.", MINT)
    card(slide, 4.78, 2.4, 3.75, 3.7, "Current safeguards", "Zod schemas, bounded repair, URL/date checks, retryable errors, server-side keys and Docker PostgreSQL deployment.", BLUE)
    card(slide, 8.8, 2.4, 3.75, 3.7, "Roadmap", "Add authentication, shared rate limiting, durable job queues, calendar integrations and evidence-quality evaluation.", MINT)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    prs.save(OUT)
    print(f"Saved {OUT} ({len(prs.slides)} slides)")


if __name__ == "__main__":
    main()
