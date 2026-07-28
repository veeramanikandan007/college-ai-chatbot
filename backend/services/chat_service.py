from typing import List, Optional
from models import Student
from services.llm_service import OllamaLLMService
from services.prompt_service import build_prompt, build_personal_prompt
from services.rag_service import get_relevant_documents, has_documents


class ChatService:
    """Chat pipeline coordinating retrieval and LLM generation."""

    def __init__(self) -> None:
        self.llm_service = OllamaLLMService()

    def ask(self, question: str, student: Optional[Student] = None) -> str:
        """Return a response to the user question using RAG + student data."""
        question_lower = question.lower().strip()

        # ── Personal data queries (from student record) ─────────────────────
        personal_answer = self._handle_personal_query(question_lower, student)
        if personal_answer:
            return personal_answer

        # ── RAG queries (from college documents) ──────────────────────────
        if not has_documents():
            return self._fallback_answer(question)

        documents = get_relevant_documents(question)
        if not documents:
            return self._fallback_answer(question)

        context_chunks: List[str] = [doc.page_content for doc in documents]

        # Include student context in the prompt for personalized RAG
        prompt = build_prompt(question, context_chunks, student)
        try:
            response = self.llm_service.generate(prompt)
            return response.strip() or self._fallback_answer(question)
        except Exception:
            return self._fallback_answer(question)

    def _handle_personal_query(self, question: str, student: Optional[Student]) -> Optional[str]:
        """Handle queries about the student's personal data."""
        if not student:
            return None

        # Attendance
        if any(w in question for w in ['my attendance', 'attendance', 'show my attendance']):
            return self._attendance_answer(student)

        # CGPA
        if any(w in question for w in ['cgpa', 'my gpa', 'grade point', 'my marks', 'my result']):
            return self._cgpa_answer(student)

        # Fees
        if any(w in question for w in ['fee', 'fees', 'paid', 'due', 'payment', 'balance']):
            return self._fees_answer(student)

        # Bus
        if any(w in question for w in ['bus', 'transport', 'route']):
            return self._bus_answer(student)

        # Library
        if any(w in question for w in ['library book', 'my book', 'book issued', 'library']):
            return self._library_answer(student)

        # Timetable
        if any(w in question for w in ['class', 'timetable', 'schedule', 'today\'s class']):
            return self._timetable_answer(student)

        # Certificate
        if any(w in question for w in ['certificate', 'bonafide', 'transfer', 'migration']):
            return self._certificate_answer(student)

        return None

    def _attendance_answer(self, student: Student) -> str:
        return (
            f"### Your Attendance Report\n\n"
            f"**Student:** {student.name} ({student.student_id})\n"
            f"**Department:** {student.department}\n"
            f"**Semester:** {student.semester}\n\n"
            f"**Overall Attendance:** **{student.attendance_percent}%**\n\n"
            f"### College Attendance Rules\n"
            f"- Minimum **75% attendance** is required in each subject to be eligible for semester exams.\n"
            f"- A **10% condonation** may be granted for medical leave with valid documentation.\n"
            f"- Medical certificate must be submitted to the HOD within **3 working days** of returning.\n"
            f"- Students below **65% attendance** are not eligible even with condonation.\n\n"
            f"Your attendance of **{student.attendance_percent}%** is "
            f"{'above' if student.attendance_percent >= 75 else 'below'} the minimum requirement."
        )

    def _cgpa_answer(self, student: Student) -> str:
        return (
            f"### Your Academic Record\n\n"
            f"**Student:** {student.name} ({student.student_id})\n"
            f"**Department:** {student.department}\n"
            f"**Year:** {student.year}\n"
            f"**Semester:** {student.semester}\n\n"
            f"**CGPA:** **{student.cgpa} / 10.0**\n\n"
            f"### Grading Scale\n"
            f"- 9.0 - 10.0: Excellent (O Grade)\n"
            f"- 8.0 - 8.99: Very Good (A+ Grade)\n"
            f"- 7.0 - 7.99: Good (A Grade)\n"
            f"- 6.0 - 6.99: Above Average (B+ Grade)\n"
            f"- 4.0 - 5.99: Pass (B Grade)\n"
            f"- Below 4.0: Fail\n\n"
            f"Your CGPA of **{student.cgpa}** is "
            f"{'Excellent' if student.cgpa >= 9 else 'Very Good' if student.cgpa >= 8 else 'Good'}."
        )

    def _fees_answer(self, student: Student) -> str:
        balance = student.fees_total - student.fees_paid
        status = 'Fully Paid ✅' if balance == 0 else f'Pending: ₹{balance:,}'
        return (
            f"### Semester Fee Details\n\n"
            f"**Student:** {student.name} ({student.student_id})\n"
            f"**Semester:** {student.semester}\n\n"
            f"| Fee Head | Amount |\n|---|---|\n"
            f"| Tuition Fee | ₹42,000 |\n"
            f"| Exam Fee | ₹3,200 |\n"
            f"| Lab Fee | ₹5,500 |\n"
            f"| Development Fee | ₹2,000 |\n"
            f"| **Total** | **₹{student.fees_total:,}** |\n\n"
            f"**Amount Paid:** ₹{student.fees_paid:,}\n"
            f"**Balance:** ₹{balance:,}\n"
            f"**Status:** {status}\n\n"
            f"> 💡 Fees can be paid online via the Student Portal or at the Finance Counter.\n"
            f"> Last date for fee payment: 15th of the current month."
        )

    def _bus_answer(self, student: Student) -> str:
        bus_routes = {
            '1': {'route': 'City Center - Main Campus', 'departure': '7:45 AM', 'return': '5:30 PM'},
            '2': {'route': 'North Campus - Main Campus', 'departure': '7:30 AM', 'return': '5:45 PM'},
            '3': {'route': 'East Zone - Main Campus', 'departure': '7:50 AM', 'return': '5:15 PM'},
            '4': {'route': 'South Bay - Main Campus', 'departure': '7:40 AM', 'return': '5:30 PM'},
            '5': {'route': 'West Side - Main Campus', 'departure': '7:35 AM', 'return': '5:50 PM'},
        }
        route_info = bus_routes.get(student.bus_no, bus_routes['3'])
        return (
            f"### Your Bus Information\n\n"
            f"**Student:** {student.name} ({student.student_id})\n"
            f"**Bus Number:** **{student.bus_no}**\n\n"
            f"| Detail | Information |\n|---|---|\n"
            f"| Route | {route_info['route']} |\n"
            f"| Departure | {route_info['departure']} |\n"
            f"| Return | {route_info['return']} |\n\n"
            f"All buses depart from the **Main Gate**.\n"
            f"Bus passes can be obtained from the Transport Office.\n"
            f"Contact: +1 (555) 019-2834 (Transport Desk)"
        )

    def _library_answer(self, student: Student) -> str:
        books = [b.strip() for b in student.library_books.split(',') if b.strip()] if student.library_books else []
        return (
            f"### Your Library Information\n\n"
            f"**Student:** {student.name} ({student.student_id})\n\n"
            f"**Books Currently Issued:**\n"
            f"{''.join(f'- {b}\n' for b in books) if books else '- No books issued\n'}\n"
            f"**Maximum Books Allowed:** 4\n"
            f"**Issue Period:** 15 days (renewable once)\n\n"
            f"### Library Working Hours\n"
            f"| Day | Hours |\n|---|---|\n"
            f"| Monday - Friday | 8:00 AM - 8:00 PM |\n"
            f"| Saturday | 9:00 AM - 6:00 PM |\n"
            f"| Sunday & Holidays | Closed |\n\n"
            f"**Late Fine:** ₹2 per day per book\n"
            f"**Digital Library:** Accessible via portal.college.edu/library"
        )

    def _timetable_answer(self, student: Student) -> str:
        return (
            f"### Class Timetable — {student.department} {student.semester} Semester\n\n"
            f"**Student:** {student.name} ({student.student_id})\n\n"
            f"| Day | 9:00–10:00 | 10:00–11:00 | 11:15–12:15 | 12:15–1:15 | 2:15–3:15 |\n"
            f"|---|---|---|---|---|---|\n"
            f"| Mon | OS | DBMS | Networks | — | AI Lab |\n"
            f"| Tue | DSA | AI | OS | — | DBMS Lab |\n"
            f"| Wed | DBMS | Networks | OS | — | DSA Lab |\n"
            f"| Thu | AI | DSA | Networks | — | SE |\n"
            f"| Fri | OS | DBMS | AI | — | Mini Project |"
        )

    def _certificate_answer(self, student: Student) -> str:
        return (
            f"### Certificate Application\n\n"
            f"**Student:** {student.name} ({student.student_id})\n"
            f"**Current Certificate Status:** {student.certificate}\n\n"
            f"### How to Apply:\n"
            f"1. Log in to the **Student Portal** → Services → Certificates\n"
            f"2. Select certificate type: *Bonafide / Transfer / Character / Migration*\n"
            f"3. Fill the online form and pay **₹50** (online payment)\n"
            f"4. Certificate will be ready within **3 working days**\n\n"
            f"> Walk-in applications accepted at **Registrar Office** (9 AM – 4 PM, Mon–Fri).\n"
            f"> Your current bonafide certificate is **{student.certificate.split(' - ')[-1] if ' - ' in student.certificate else student.certificate}**."
        )

    def _fallback_answer(self, question: str) -> str:
        """Provide a helpful fallback when RAG or Ollama is unavailable."""
        return (
            f"I searched the CollegeMate knowledge base for **\"{question}\"** but couldn't find a specific answer.\n\n"
            f"Here's what I can help with:\n\n"
            f"- **Attendance**: Show your attendance report and college rules\n"
            f"- **Fees**: View your fee payment details and dues\n"
            f"- **CGPA**: Check your academic record\n"
            f"- **Library**: See your issued books and library hours\n"
            f"- **Bus**: Check your bus route and timings\n"
            f"- **Timetable**: View your class schedule\n"
            f"- **Certificate**: Apply for bonafide or transfer certificates\n"
            f"- **Placement**: View campus placement statistics\n"
            f"- **Hostel**: Check hostel rules and regulations\n"
            f"- **Canteen**: View the canteen menu\n\n"
            f"Try asking: *What is the attendance requirement?*, *Show my CGPA*, *What are the library timings?*"
        )
