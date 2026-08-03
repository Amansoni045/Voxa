from backend.models.meeting import MeetingAnalysis

def generate_markdown_report(report_data: MeetingAnalysis) -> str:
    md = []
    md.append(f"# {report_data.title}\n")

    if report_data.metadata:
        meta = report_data.metadata
        md.append("## Meeting Metadata")
        if meta.generation_timestamp:
            md.append(f"- **Generated At:** {meta.generation_timestamp}")
        if meta.detected_language:
            md.append(f"- **Detected Language:** {meta.detected_language}")
        if meta.transcription_engine:
            md.append(f"- **Engine Used:** {meta.transcription_engine}")
        if meta.transcript_chunks_count is not None:
            md.append(f"- **Transcript Chunks:** {meta.transcript_chunks_count}")
        if meta.duration_seconds is not None:
            md.append(f"- **Duration:** {meta.duration_seconds:.1f}s")
        if meta.processing_time_seconds is not None:
            md.append(f"- **Processing Time:** {meta.processing_time_seconds:.1f}s")
        md.append("")

    md.append("## Executive Summary")
    md.append(report_data.summary)
    md.append("")

    md.append("## Key Decisions")
    md.append(report_data.key_decisions)
    md.append("")

    md.append("## Action Items")
    md.append(report_data.action_items)
    md.append("")

    md.append("## Open Questions")
    md.append(report_data.questions)
    md.append("")

    if report_data.risks:
        md.append("## Risks")
        md.append(report_data.risks)
        md.append("")

    if report_data.next_steps:
        md.append("## Next Steps")
        md.append(report_data.next_steps)
        md.append("")

    return "\n".join(md)
