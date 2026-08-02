# Production RAG Architecture & Quality Report - CollegeMate AI

## Executive Summary
This document provides a detailed breakdown of the Retrieval-Augmented Generation (RAG) system built for **CollegeMate AI** at Mount Zion College of Engineering and Technology.

---

## 1. Quality Enhancements & Synthesis Improvements

### ChatGPT-Level Natural Synthesis
- **Single Natural Answer**: Gemini synthesizes all top retrieved context chunks into ONE clear, well-structured response with Markdown headings, bullet lists, or tables.
- **No Text Dumping**: Eliminates raw chunk copies, context IDs, or raw filenames from the main response body.
- **Reranking & Deduplication**: Vector store retrieves top relevant chunks, filters duplicate content, and ranks context by cosine similarity.
- **Anti-Hallucination Guardrails**: If no relevant context matches the query (distance > 1.2), the system returns the exact fallback:
  > `"I couldn't find this information in the college knowledge base."`

---

## 2. Professional Source Citations Display

Instead of raw filename dumps (e.g., `sample.txt`, `rules.pdf`), sources are displayed as structured document badges with title and page number:

```
Sources
📄 Academic Calendar 2025-2026 (Page 4)
📄 Attendance Regulations (Page 2)
📄 Student Handbook (Page 11)
```

- **Document Name**: Human-readable title derived from document metadata.
- **Page Number**: Extracted for PDF pages.
- **Relevance Scoring**: Cosine similarity distance metric evaluated before context assembly.

---

## 3. Pipeline Technical Specifications

| Stage | Technology / Component | Parameters |
| :--- | :--- | :--- |
| **Document Loaders** | PyMuPDF (`fitz`), `python-docx`, Plain Text | Support `.pdf`, `.docx`, `.txt` |
| **Text Splitter** | `RecursiveCharacterTextSplitter` | `chunk_size = 1000`, `chunk_overlap = 200` |
| **Embeddings** | `sentence-transformers/all-MiniLM-L6-v2` | 384-dimensional dense vectors |
| **Vector Store** | ChromaDB (`vector_db/`) | Cosine similarity search (`hnsw:space: cosine`) |
| **LLM Provider** | Google Gemini (`gemini-2.0-flash`) | Integrated via `langchain-google-genai` |
| **Retrieval Top-K** | Top 5 similarity search | Cosine distance threshold: `< 1.2` |

---

## 4. Indexed Knowledge Base Scope

26 comprehensive campus documents auto-indexed across 30 vector chunks:
1. `admissions_info.txt` - Admissions & Eligibility
2. `attendance_policy.txt` - Attendance Regulations
3. `exam_regulations.txt` - Anna University Exam Regulations
4. `hostel_rules.txt` - Hostel Rules & Regulations
5. `transport_details.txt` - Transportation & Bus Routes
6. `library_rules.txt` - Central Library Regulations
7. `placement_cell.txt` - Placement & Training Cell
8. `fee_structure.txt` - Tuition & Hostel Fee Structure
9. `scholarships_info.txt` - Scholarships & Financial Aid
10. `departments_overview.txt` - Academic Departments Overview
11. `faculty_directory.txt` - Faculty & Staff Directory
12. `leave_rules.txt` - Leave Application Rules
13. `certificates_process.txt` - Certificates & Official Documents
14. `anti_ragging_policy.txt` - Anti-Ragging Policy
15. `medical_facilities.txt` - Healthcare & Medical Services
16. `college_rules.txt` - College Rules & Code of Conduct
17. `events_workshops.txt` - Events & Cultural Symposiums
18. `sports_facilities.txt` - Sports & Physical Education
19. `nss_wing.txt` - National Service Scheme (NSS)
20. `ncc_unit.txt` - National Cadet Corps (NCC)
21. `academic_calendar.txt` - Academic Calendar 2025-2026
22. `timetable_schedule.txt` - Daily Timetable Schedule
23. `grievance_redressal.txt` - Grievance Redressal Cell
24. `internships_policy.txt` - Internship Guidelines
25. `projects_guidelines.txt` - Student Project Guidelines
26. `campus_facilities.txt` - Campus Infrastructure & Facilities
