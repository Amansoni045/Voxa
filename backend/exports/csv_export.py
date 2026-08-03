import csv
import io

def generate_action_items_csv(action_items_text: str) -> str:
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Task", "Owner", "Deadline", "Status"])

    lines = [line.strip() for line in action_items_text.split("\n") if line.strip()]
    current_task = ""
    owner = "Not specified"
    deadline = "Not specified"

    for line in lines:
        if line.lower().startswith(("- task:", "task:", "-")):
            if current_task:
                writer.writerow([current_task, owner, deadline, "Pending"])
            current_task = line.lstrip("- ").replace("Task:", "").strip()
            owner = "Not specified"
            deadline = "Not specified"
        elif "owner:" in line.lower():
            owner = line.split(":", 1)[-1].strip()
        elif "deadline:" in line.lower():
            deadline = line.split(":", 1)[-1].strip()
        else:
            if not current_task:
                current_task = line
            else:
                current_task += " " + line

    if current_task and current_task.lower() != "no action items found.":
        writer.writerow([current_task, owner, deadline, "Pending"])

    return output.getvalue()
