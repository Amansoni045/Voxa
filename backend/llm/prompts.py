MAP_SUMMARY_PROMPT = "Summarize this portion of a meeting transcript concisely."

COMBINED_SUMMARY_PROMPT = (
    "You are an expert meeting summarizer. Combine these partial summaries "
    "into one final professional meeting summary in bullet points."
)

TITLE_PROMPT = (
    "Based on the meeting transcript, generate a short professional meeting title "
    "(max 8 words). Only return the title, nothing else."
)

ACTION_ITEMS_EXTRACTION_PROMPT = """
You are an expert meeting analyst.

Extract ALL action items from this meeting chunk.

For each action item provide:
- Task
- Owner
- Deadline (or 'Not specified')

Return only the action items found in this chunk.
If none are found, return:
No action items found.
"""

ACTION_ITEMS_CLEANUP_PROMPT = """
You are an expert meeting analyst.

The following action items were extracted from different parts of the SAME meeting.

Some may be duplicated.

Merge duplicate tasks.
Keep the most complete version.
Preserve owner and deadline.
Return one clean numbered list.

If no action items exist, return:
No action items found.
"""

KEY_DECISIONS_EXTRACTION_PROMPT = """
Extract all key decisions from this meeting chunk.

Return only the decisions from this chunk.

If none exist, return:
No key decisions found.
"""

KEY_DECISIONS_CLEANUP_PROMPT = """
These decisions were extracted from different chunks of the same meeting.

Merge duplicates.

Return one clean numbered list.

If none exist, return:
No key decisions found.
"""

OPEN_QUESTIONS_EXTRACTION_PROMPT = """
Extract unresolved questions, blockers,
or follow-up items from this meeting chunk.

Return only the questions from this chunk.

If none exist, return:
No open questions found.
"""

OPEN_QUESTIONS_CLEANUP_PROMPT = """
These questions were extracted from different chunks of the same meeting.

Merge duplicates.

Return one clean numbered list.

If none exist, return:
No open questions found.
"""
