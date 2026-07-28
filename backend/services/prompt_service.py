from typing import List, Optional
from models import Student

SYSTEM_PROMPT = (
    "You are CollegeMate AI, a helpful and polite college assistant.\n"
    "Answer only using the provided context and student data.\n"
    "Never invent information.\n"
    "If the answer isn't found in the context say: "
    '"I couldn\'t find this information in the college knowledge base."'
)

CONTEXT_SEPARATOR = "\n---\n"


def build_prompt(question: str, context_chunks: List[str], student: Optional[Student] = None) -> str:
    """Build a complete prompt for the LLM using retrieved context and student data."""
    context_block = CONTEXT_SEPARATOR.join(chunk.strip() for chunk in context_chunks if chunk.strip())
    prompt_sections = [SYSTEM_PROMPT]

    # Add student context for personalized responses
    if student:
        student_context = (
            f"\nStudent Context:\n"
            f"Name: {student.name}\n"
            f"Student ID: {student.student_id}\n"
            f"Department: {student.department}\n"
            f"Year: {student.year}\n"
            f"Semester: {student.semester}\n"
            f"Attendance: {student.attendance_percent}%\n"
            f"CGPA: {student.cgpa}\n"
            f"Fees Paid: ₹{student.fees_paid}\n"
            f"Bus No: {student.bus_no}\n"
            f"Library Books: {student.library_books}\n"
        )
        prompt_sections.append(student_context)

    if context_block:
        prompt_sections.append("Context:")
        prompt_sections.append(context_block)

    prompt_sections.append("Question:")
    prompt_sections.append(question.strip())
    prompt_sections.append(
        "\nAnswer the question using only the context provided above. "
        "If the answer cannot be found, respond with: "
        '"I couldn\'t find this information in the college knowledge base."'
    )

    return "\n\n".join(prompt_sections)


def build_personal_prompt(question: str, student: Student) -> str:
    """Build a prompt for personal data queries using student record."""
    return (
        f"{SYSTEM_PROMPT}\n\n"
        f"Student Data:\n"
        f"Name: {student.name}\n"
        f"Student ID: {student.student_id}\n"
        f"Department: {student.department}\n"
        f"Year: {student.year}\n"
        f"Semester: {student.semester}\n"
        f"Attendance: {student.attendance_percent}%\n"
        f"CGPA: {student.cgpa}\n"
        f"Fees Paid: ₹{student.fees_paid}\n"
        f"Fees Total: ₹{student.fees_total}\n"
        f"Bus No: {student.bus_no}\n"
        f"Library Books: {student.library_books}\n"
        f"Certificate: {student.certificate}\n\n"
        f"Question: {question.strip()}\n\n"
        f"Answer the question using the student data above."
    )
