from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

from backend.models.meeting import MeetingAnalysis

def generate_pdf_report(report_data: MeetingAnalysis, output_path: str) -> str:
    doc = SimpleDocTemplate(output_path, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#1E293B'),
        spaceAfter=12
    )

    h2_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#2563EB'),
        spaceBefore=10,
        spaceAfter=6
    )

    body_style = styles['BodyText']

    story.append(Paragraph(report_data.title, title_style))
    story.append(Spacer(1, 10))

    if report_data.metadata:
        story.append(Paragraph("Meeting Statistics", h2_style))
        meta = report_data.metadata
        meta_lines = []
        if meta.generation_timestamp:
            meta_lines.append(f"Generated: {meta.generation_timestamp}")
        if meta.detected_language:
            meta_lines.append(f"Language: {meta.detected_language}")
        if meta.transcription_engine:
            meta_lines.append(f"Engine: {meta.transcription_engine}")
        if meta.transcript_chunks_count:
            meta_lines.append(f"Chunks: {meta.transcript_chunks_count}")
        story.append(Paragraph("<br/>".join(meta_lines), body_style))
        story.append(Spacer(1, 10))

    sections = [
        ("Executive Summary", report_data.summary),
        ("Key Decisions", report_data.key_decisions),
        ("Action Items", report_data.action_items),
        ("Open Questions", report_data.questions),
    ]

    if report_data.risks:
        sections.append(("Risks", report_data.risks))
    if report_data.next_steps:
        sections.append(("Next Steps", report_data.next_steps))

    for title, content in sections:
        story.append(Paragraph(title, h2_style))
        formatted_content = content.replace("\n", "<br/>")
        story.append(Paragraph(formatted_content, body_style))
        story.append(Spacer(1, 8))

    doc.build(story)
    return output_path
