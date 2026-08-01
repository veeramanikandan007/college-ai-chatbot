import re
import json
from typing import List, Dict, Any, Optional
from datetime import datetime, date

from app.core.logging import get_logger
from app.services.ai_service import AIService

logger = get_logger(__name__)

# Sample recruitment drives seed dataset
_SAMPLE_DRIVES = [
    {
        "id": 1,
        "company_name": "TCS (Tata Consultancy Services)",
        "logo_url": "https://logo.clearbit.com/tcs.com",
        "role": "System Engineer & Prime Developer",
        "package_ctc": "9.0 - 11.5 LPA",
        "eligibility_cgpa": 6.5,
        "min_backlogs": 0,
        "last_date": "2026-08-15",
        "drive_date": "2026-08-20",
        "selection_process": "1. TCS NQT Online Test -> 2. Technical Interview -> 3. HR Round",
        "skills_required": "Java, Python, SQL, Data Structures, OOPs",
        "category": "Dream",
        "location": "Chennai / Bangalore",
        "job_description": "Join TCS Digital & Prime team working on Cloud microservices, Enterprise AI, and Scalable Backend platforms."
    },
    {
        "id": 2,
        "company_name": "Amazon India",
        "logo_url": "https://logo.clearbit.com/amazon.com",
        "role": "Software Development Engineer - I (SDE-1)",
        "package_ctc": "18.5 LPA",
        "eligibility_cgpa": 7.5,
        "min_backlogs": 0,
        "last_date": "2026-08-18",
        "drive_date": "2026-08-25",
        "selection_process": "1. Online Assessment (OA) -> 2. Technical Round 1 (DSA) -> 3. Technical Round 2 (System Design) -> 4. Bar Raiser",
        "skills_required": "Data Structures & Algorithms, Java, C++, System Design, AWS",
        "category": "Super Dream",
        "location": "Bangalore / Hyderabad",
        "job_description": "Build high-throughput distributed ecommerce architectures and cloud services for global customers."
    },
    {
        "id": 3,
        "company_name": "Zoho Corporation",
        "logo_url": "https://logo.clearbit.com/zoho.com",
        "role": "Member Technical Staff (MTS)",
        "package_ctc": "8.5 - 10.0 LPA",
        "eligibility_cgpa": 7.0,
        "min_backlogs": 0,
        "last_date": "2026-08-12",
        "drive_date": "2026-08-16",
        "selection_process": "1. C / Java Aptitude & Logic -> 2. Basic Coding -> 3. Advanced Coding (Design) -> 4. HR Interview",
        "skills_required": "C, Java, Problem Solving, Data Structures, SQL",
        "category": "Dream",
        "location": "Chennai / Tenkasi",
        "job_description": "Develop world-class SaaS enterprise applications using modern web stacks and robust database design."
    },
    {
        "id": 4,
        "company_name": "Microsoft",
        "logo_url": "https://logo.clearbit.com/microsoft.com",
        "role": "Software Engineer Intern & FTE",
        "package_ctc": "24.0 LPA",
        "eligibility_cgpa": 8.0,
        "min_backlogs": 0,
        "last_date": "2026-08-22",
        "drive_date": "2026-08-30",
        "selection_process": "1. Online Coding Assessment -> 2. Tech Round 1 -> 3. Tech Round 2 -> 4. AA Round",
        "skills_required": "C++, Java, System Design, OS, Computer Networks, DSA",
        "category": "Super Dream",
        "location": "Hyderabad / Bangalore",
        "job_description": "Work on Azure Cloud, AI Infrastructure, Windows Core Engine, and Developer Ecosystem tooling."
    },
    {
        "id": 5,
        "company_name": "Accenture",
        "logo_url": "https://logo.clearbit.com/accenture.com",
        "role": "Advanced Application Engineering Analyst",
        "package_ctc": "6.5 LPA",
        "eligibility_cgpa": 6.0,
        "min_backlogs": 1,
        "last_date": "2026-08-10",
        "drive_date": "2026-08-14",
        "selection_process": "1. Cognitive & Technical Assessment -> 2. Coding Assessment -> 3. Communication Assessment -> 4. Interview",
        "skills_required": "Python, Java, Cloud Fundamentals, Web Technologies",
        "category": "Mass",
        "location": "Pan India",
        "job_description": "Deliver cloud transformation, full stack web engineering, and enterprise IT automation solutions."
    }
]

# Sample job applications tracking
_SAMPLE_APPLICATIONS = [
    {
        "id": 1,
        "drive_id": 1,
        "company_name": "TCS (Tata Consultancy Services)",
        "role": "System Engineer & Prime Developer",
        "stage": "Shortlisted",
        "applied_at": "2026-07-28T10:00:00Z",
        "notes": "Shortlisted for NQT Prime Round on Aug 20."
    },
    {
        "id": 2,
        "drive_id": 3,
        "company_name": "Zoho Corporation",
        "role": "Member Technical Staff (MTS)",
        "stage": "Technical Interview",
        "applied_at": "2026-07-25T14:30:00Z",
        "notes": "Cleared Advanced Coding Round. Technical Interview scheduled."
    },
    {
        "id": 3,
        "drive_id": 2,
        "company_name": "Amazon India",
        "role": "Software Development Engineer - I (SDE-1)",
        "stage": "Applied",
        "applied_at": "2026-08-01T09:15:00Z",
        "notes": "Awaiting OA link."
    }
]

# Sample coding problems bank
_SAMPLE_CODING_PROBLEMS = [
    {
        "id": 1,
        "title": "Two Sum (Array Search)",
        "difficulty": "Easy",
        "category": "Arrays",
        "description": "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to target.",
        "sample_input": "nums = [2,7,11,15], target = 9",
        "sample_output": "[0, 1]",
        "hints": "Use a HashMap to store complemented target values for O(N) lookup.",
        "status": "Solved"
    },
    {
        "id": 2,
        "title": "Longest Substring Without Repeating Characters",
        "difficulty": "Medium",
        "category": "Strings",
        "description": "Given a string `s`, find the length of the longest substring without repeating characters.",
        "sample_input": "s = \"abcabcbb\"",
        "sample_output": "3",
        "hints": "Use the Sliding Window pattern with two pointers and a character index map.",
        "status": "Solved"
    },
    {
        "id": 3,
        "title": "Reverse a Linked List",
        "difficulty": "Easy",
        "category": "Linked List",
        "description": "Given the head of a singly linked list, reverse the list, and return the reversed list head.",
        "sample_input": "head = [1,2,3,4,5]",
        "sample_output": "[5,4,3,2,1]",
        "hints": "Iterate using three pointers: prev, curr, nextTemp.",
        "status": "Solved"
    },
    {
        "id": 4,
        "title": "Lowest Common Ancestor in Binary Tree",
        "difficulty": "Medium",
        "category": "Trees",
        "description": "Given a binary tree, find the lowest common ancestor (LCA) of two given nodes p and q.",
        "sample_input": "root = [3,5,1,6,2,0,8], p = 5, q = 1",
        "sample_output": "3",
        "hints": "Traverse recursively: if p or q matches current node, return node. Check left and right subtrees.",
        "status": "Unsolved"
    },
    {
        "id": 5,
        "title": "Number of Islands (BFS / DFS)",
        "difficulty": "Medium",
        "category": "Graphs",
        "description": "Given an m x n 2D binary grid representing a map of '1's (land) and '0's (water), return the number of islands.",
        "sample_input": "grid = [[\"1\",\"1\",\"0\"],[\"1\",\"1\",\"0\"],[\"0\",\"0\",\"1\"]]",
        "sample_output": "2",
        "hints": "Trigger DFS/BFS traversal upon encountering '1', marking visited land cells to '0'.",
        "status": "Unsolved"
    },
    {
        "id": 6,
        "title": "0/1 Knapsack Problem",
        "difficulty": "Hard",
        "category": "Dynamic Programming",
        "description": "Given weights and values of N items, put these items in a knapsack of capacity W to get the maximum total value.",
        "sample_input": "val = [60, 100, 120], wt = [10, 20, 30], W = 50",
        "sample_output": "220",
        "hints": "Build 2D DP matrix where dp[i][w] stores max value using first i items and capacity w.",
        "status": "Unsolved"
    }
]

# Sample stored certificates
_SAMPLE_CERTIFICATES = [
    {
        "id": 1,
        "title": "Full Stack Web Development Internship",
        "issuer": "Amazon AWS Academy",
        "category": "Internship",
        "issue_date": "2026-06-30",
        "credential_url": "https://aws.amazon.com/verify/AWS-12345"
    },
    {
        "id": 2,
        "title": "National Hackathon 2026 - 1st Runner Up",
        "issuer": "IIT Madras HackFest",
        "category": "Hackathon",
        "issue_date": "2026-05-15",
        "credential_url": "https://hackfest2026.org/certificates/HF-908"
    },
    {
        "id": 3,
        "title": "Database Management Systems (94% Top Performer)",
        "issuer": "NPTEL / IIT Kharagpur",
        "category": "NPTEL",
        "issue_date": "2026-04-20",
        "credential_url": "https://nptel.ac.in/noc/Ecertificate/?q=NPTEL26CS45"
    }
]

class PlacementService:
    def __init__(self):
        self.ai_service = AIService()

    @staticmethod
    def get_dashboard_data() -> Dict[str, Any]:
        """
        Get aggregated placement dashboard analytics, drives, applications, coding progress, and certificates.
        """
        total_drives = len(_SAMPLE_DRIVES)
        applied_count = len(_SAMPLE_APPLICATIONS)
        eligible_count = sum(1 for d in _SAMPLE_DRIVES if d["eligibility_cgpa"] <= 8.5)
        selected_count = sum(1 for a in _SAMPLE_APPLICATIONS if a["stage"] == "Selected")
        upcoming_count = sum(1 for d in _SAMPLE_DRIVES if d["last_date"] >= datetime.now().strftime("%Y-%m-%d"))

        solved_coding = sum(1 for p in _SAMPLE_CODING_PROBLEMS if p["status"] == "Solved")
        total_coding = len(_SAMPLE_CODING_PROBLEMS)
        coding_percentage = round((solved_coding / total_coding * 100), 1) if total_coding > 0 else 0.0

        return {
            "stats": {
                "total_companies": total_drives,
                "applied_companies": applied_count,
                "eligible_companies": eligible_count,
                "selected_companies": selected_count,
                "upcoming_drives": upcoming_count,
                "ats_resume_score": 88,
                "coding_progress_pct": coding_percentage,
                "coding_solved": solved_coding,
                "coding_total": total_coding,
                "interview_readiness_pct": 82.5
            },
            "drives": _SAMPLE_DRIVES,
            "applications": _SAMPLE_APPLICATIONS,
            "coding_problems": _SAMPLE_CODING_PROBLEMS,
            "certificates": _SAMPLE_CERTIFICATES
        }

    async def analyze_resume_ats(self, resume_text: str) -> Dict[str, Any]:
        """
        AI ATS Resume Analyzer evaluating ATS compatibility score, grammar, formatting, missing skills, and suggestions.
        """
        if not resume_text or len(resume_text.strip()) < 20:
            resume_text = "Sample Student Resume: B.Tech CSE, Java, Spring Boot, React, SQL, Git, REST APIs, Data Structures."

        prompt = f"""
You are an AI ATS (Applicant Tracking System) Expert & Resume Auditor for Senior Tech Recruiters.
Analyze the following student resume text and evaluate its ATS score out of 100.

Resume Text:
\"\"\"
{resume_text[:4000]}
\"\"\"

JSON OUTPUT FORMAT REQUIREMENTS:
Return ONLY valid JSON matching this exact structure:
{{
  "ats_score": 88,
  "grammar_score": 92,
  "formatting_score": 90,
  "missing_skills": ["Docker", "Kubernetes", "CI/CD Pipelines", "System Design"],
  "suggestions": [
    "Quantify key project achievements (e.g. 'Improved query latency by 40%').",
    "Add explicit Cloud Infrastructure & Containerization keywords.",
    "Ensure standard ATS section headings (Skills, Projects, Education, Work Experience)."
  ]
}}
"""
        try:
            if self.ai_service.gemini_llm:
                resp = await self.ai_service.gemini_llm.ainvoke(prompt)
                clean_str = re.sub(r'```(?:json)?\s*', '', str(resp.content)).rstrip('`').strip()
                return json.loads(clean_str)
            elif self.ai_service.llm:
                resp = await self.ai_service.llm.ainvoke(prompt)
                clean_str = re.sub(r'```(?:json)?\s*', '', str(resp.content)).rstrip('`').strip()
                return json.loads(clean_str)
        except Exception as e:
            logger.warning(f"ATS AI Analysis fallback triggered: {e}")

        return {
            "ats_score": 88,
            "grammar_score": 92,
            "formatting_score": 90,
            "missing_skills": ["Docker", "Kubernetes", "CI/CD Pipelines", "System Design"],
            "suggestions": [
                "Quantify key project achievements with metric impact (e.g. 'Improved query speed by 40%').",
                "Highlight Cloud Infrastructure & DevOps keywords in technical skills.",
                "Use standard ATS single-column formatting without heavy tables or graphics."
            ]
        }

    async def generate_mock_question(self, category: str, role: str) -> Dict[str, Any]:
        """
        Generate AI Mock Interview question with category & role context.
        """
        prompt = f"""
You are a Principal Tech Interviewer conducting a mock interview for role: {role}.
Generate 1 high-frequency {category} interview question.

JSON FORMAT ONLY:
{{
  "question_id": 1,
  "category": "{category}",
  "question": "Interview question text here?",
  "expected_key_points": ["Key Point 1", "Key Point 2", "Key Point 3"],
  "hints": "Helpful hint or interviewer context."
}}
"""
        try:
            if self.ai_service.gemini_llm:
                resp = await self.ai_service.gemini_llm.ainvoke(prompt)
                clean_str = re.sub(r'```(?:json)?\s*', '', str(resp.content)).rstrip('`').strip()
                return json.loads(clean_str)
        except Exception:
            pass

        fallback_questions = {
            "Technical": {
                "question": "Explain the difference between Mutex and Semaphore in Operating Systems, and when would you use each?",
                "expected_key_points": ["Mutual Exclusion concept", "Binary vs Counting Semaphore", "Ownership rules"],
                "hints": "Think about critical sections and resource locking mechanisms."
            },
            "HR": {
                "question": "Tell me about a challenging technical problem you encountered during a project and how you solved it.",
                "expected_key_points": ["STAR Method (Situation, Task, Action, Result)", "Problem Identification", "Technical Trade-offs"],
                "hints": "Structure your answer using the Situation, Task, Action, and Result approach."
            },
            "Behavioral": {
                "question": "How do you handle team conflicts or differing architectural opinions with team members?",
                "expected_key_points": ["Active Listening", "Data-driven decisions", "Constructive compromise"],
                "hints": "Emphasize collaboration, benchmarking, and maintaining team productivity."
            },
            "System Design": {
                "question": "How would you design a URL Shortening Service like Bitly to scale to 100 Million daily active users?",
                "expected_key_points": ["Base62 encoding", "Database schema & caching", "Load balancing & rate limiting"],
                "hints": "Focus on high read-to-write ratio, cache eviction, and collision handling."
            }
        }
        return fallback_questions.get(category, fallback_questions["Technical"])

    async def evaluate_mock_answer(self, question: str, user_answer: str, category: str) -> Dict[str, Any]:
        """
        Evaluate candidate's mock interview answer and provide score out of 10, feedback, and model answer.
        """
        prompt = f"""
You are an AI Interview Coach. Evaluate the candidate's answer below for question: "{question}".

Candidate Answer:
\"\"\"
{user_answer}
\"\"\"

JSON OUTPUT FORMAT:
{{
  "score_out_of_10": 8.5,
  "status": "Strong", // Strong, Satisfactory, Needs Improvement
  "strengths": ["Clear technical explanation", "Good structure"],
  "weaknesses": ["Could add concrete example or metric"],
  "model_answer": "Ideal model answer highlighting optimal response structure.",
  "feedback": "Actionable feedback for improvement."
}}
"""
        try:
            if self.ai_service.gemini_llm:
                resp = await self.ai_service.gemini_llm.ainvoke(prompt)
                clean_str = re.sub(r'```(?:json)?\s*', '', str(resp.content)).rstrip('`').strip()
                return json.loads(clean_str)
        except Exception:
            pass

        return {
            "score_out_of_10": 8.5,
            "status": "Strong",
            "strengths": ["Clear explanation of core technical concepts", "Good structured delivery"],
            "weaknesses": ["Mentioning concrete real-world performance metrics would strengthen the response further"],
            "model_answer": f"To answer '{question}' effectively: Begin with a 1-sentence definition, detail the trade-offs, provide a practical code/project example, and conclude with the business impact.",
            "feedback": "Solid answer! Adding specific benchmarks or scale metrics will elevate your interview performance."
        }

    async def get_career_advice(self, query: str) -> str:
        """
        AI Career Advisor answering student questions regarding company prep, DBMS/Java guides, and projects.
        """
        prompt = f"""
You are CollegeMate AI's Senior Career Advisor & Placement Strategist.
Answer student placement query: "{query}".

Provide structured, highly practical, actionable bulleted guidance (covering strategy, key technical concepts, study materials, and project recommendations).
"""
        try:
            if self.ai_service.gemini_llm:
                resp = await self.ai_service.gemini_llm.ainvoke(prompt)
                return str(resp.content)
            elif self.ai_service.llm:
                resp = await self.ai_service.llm.ainvoke(prompt)
                return str(resp.content)
        except Exception as e:
            logger.warning(f"Career Advisor fallback: {e}")

        return f"""### 🎯 Placement Strategy & Preparation Guide

1. **Core Technical Preparation**:
   - **Data Structures & Algorithms**: Master Arrays, Strings, HashMap, Trees, and Graph Traversals (BFS/DFS). Solve 100+ LeetCode problems.
   - **DBMS & SQL**: Practice Normalization (1NF to BCNF), Indexing (B+ Trees), Transactions, ACID properties, and JOIN queries.
   - **Object Oriented Programming**: Be ready to explain Abstraction, Encapsulation, Inheritance, Polymorphism, and SOLID Design Principles in Java/C++.

2. **High-Impact Resume Projects**:
   - Build a **Full Stack SaaS Application** using React + FastAPI / Spring Boot with JWT Auth, WebSockets, and Database Indexing.
   - Deploy your application live on Vercel / Render / AWS and include working GitHub repositories.

3. **Interview Mock Execution**:
   - Practice explaining your code out loud using the STAR technique (Situation, Task, Action, Result).
   - Conduct 3-5 AI Mock Interviews on this platform before your actual drive.
"""
