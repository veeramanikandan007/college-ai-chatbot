import os
from pathlib import Path
from app.rag.rag_service import RAGService

DOCUMENTS_DIR = Path("./documents")
DOCUMENTS_DIR.mkdir(exist_ok=True)

documents_data = {
    "college_rules.txt": """MOUNT ZION COLLEGE OF ENGINEERING AND TECHNOLOGY - GENERAL CODE OF CONDUCT & RULES
1. Identity Cards: All students must wear their official ID cards around their necks at all times inside the campus and on college transport.
2. Dress Code: Students are required to dress in formal, decent attire. Wearing t-shirts without collars, ripped jeans, or informal footwear is strictly prohibited.
3. Mobile Phone Policy: Mobile phone usage inside classrooms, laboratories, and examination halls is prohibited. Violators will have their devices confiscated.
4. Campus Cleanliness: Littering is strictly forbidden. Trash must be disposed of in designated bins.
5. Punctuality: Students must arrive at their respective classrooms at least 5 minutes before the bell rings. Latecomers will not be admitted without a permission slip from the HOD.
6. Discipline: Any form of vandalism, substance abuse, or disruptive behavior will lead to immediate suspension and disciplinary inquiry.""",

    "attendance_policy.txt": """MOUNT ZION COLLEGE OF ENGINEERING AND TECHNOLOGY - ATTENDANCE & CONDONATION RULES
1. Minimum Requirement: Students must maintain a minimum of 75% attendance in each course during the semester to be eligible to appear for Anna University End Semester Examinations.
2. Condonation Range (65% - 74%): If attendance is between 65% and 74% due to valid medical reasons or official college representation, condonation may be granted upon approval by the Principal and payment of a condonation fee.
3. Detention (<65%): Students securing less than 65% attendance will be detained, declared ineligible for exams, and must repeat the semester in the subsequent academic year.
4. On-Duty (OD) Leave: OD is granted for attending inter-college competitions, sports events, and official industrial visits. OD applications must be submitted 2 days prior to the event.
5. Medical Leave Procedure: Medical certificates along with hospital records must be submitted to the HOD within 3 days of resuming classes after illness.""",

    "library_rules.txt": """MOUNT ZION COLLEGE OF ENGINEERING AND TECHNOLOGY - CENTRAL LIBRARY REGULATIONS
1. Working Hours: Monday to Saturday from 8:00 AM to 7:00 PM. Digital Library is accessible 24/7 online.
2. Book Borrowing Limits: Undergraduate students can borrow up to 4 books for 14 days. Postgraduate students can borrow 6 books for 21 days.
3. Late Return Fines: Overdue books attract a fine of Rs 5 per day per book.
4. Loss of Books: If a borrowed book is lost, the borrower must replace it with a new copy of the same edition or pay twice the current market cost.
5. Digital Resources: The library subscribes to IEEE, ScienceDirect, NPTEL, and Delnet online databases accessible via college Wi-Fi.
6. Quiet Zone: Strict silence must be maintained in reading rooms. Eating and drinking are prohibited in the library.""",

    "hostel_rules.txt": """MOUNT ZION COLLEGE OF ENGINEERING AND TECHNOLOGY - HOSTEL RULES & REGULATIONS
1. Gate Timings: Boys Hostel curfew is 8:30 PM. Girls Hostel curfew is 6:30 PM. No hosteller is allowed out after curfew without written warden permission.
2. Outing Permits: Weekend outings require prior approval from parents via SMS/call to the Residential Warden.
3. Mess Timings: Breakfast: 7:30 AM - 8:30 AM | Lunch: 12:30 PM - 1:30 PM | Evening Snacks: 5:00 PM - 5:45 PM | Dinner: 7:30 PM - 8:30 PM.
4. Electrical Appliances: High-power appliances such as heaters, irons, and induction stoves are strictly forbidden in hostel rooms.
5. Visitor Policy: Parents and authorized guardians are permitted in the visitor lobby only on Sundays between 10:00 AM and 5:00 PM.""",

    "transport_details.txt": """MOUNT ZION COLLEGE OF ENGINEERING AND TECHNOLOGY - TRANSPORTATION & BUS ROUTES
1. Fleet Overview: The institution operates a fleet of 35 deluxe buses connecting Pudukkottai, Trichy, Tanjore, Aranthangi, Karaikudi, and surrounding rural areas.
2. Bus Passes: Transport passes are issued at the beginning of each academic year and must be displayed when boarding.
3. Key Bus Routes:
   - Route 1: Trichy Central Bus Stand -> Viralimalai -> College (Departs 7:00 AM)
   - Route 2: Tanjore Old Bus Stand -> Gandarvakottai -> College (Departs 7:15 AM)
   - Route 3: Karaikudi New Bus Stand -> Thirumayam -> College (Departs 7:10 AM)
   - Route 4: Local Pudukkottai Town Shuttle (Departs 8:00 AM every 15 minutes)
4. Safety Standards: All buses are equipped with GPS tracking, speed governors, first aid kits, and emergency exit doors.""",

    "placement_cell.txt": """MOUNT ZION COLLEGE OF ENGINEERING AND TECHNOLOGY - TRAINING & PLACEMENT CELL
1. Placement Highlights: Over 85% eligible students placed annually across IT, Core Engineering, and Management sectors.
2. Top Recruiters: Tata Consultancy Services (TCS), Infosys, Wipro, Cognizant, HCL, Zoho, Larsen & Toubro, Hyundai, and Quest Global.
3. Salary Statistics: Highest Package: Rs 12.5 LPA | Average Package: Rs 4.8 LPA | Minimum Package: Rs 3.2 LPA.
4. Skill Enhancement Programs: Training in Quantitative Aptitude, Technical Coding (Python/Java), Soft Skills, Mock Interviews, and Resume Building starting from 3rd semester.
5. Placement Eligibility: Students must maintain a minimum CGPA of 6.0 without active backlogs to participate in campus recruitment drives.""",

    "scholarships_info.txt": """MOUNT ZION COLLEGE OF ENGINEERING AND TECHNOLOGY - SCHOLARSHIPS & FINANCIAL AID
1. Government Scholarships:
   - BC / MBC / DNC Welfare Scholarship for students with annual family income below Rs 2.5 Lakhs.
   - SC / ST Post-Matric Scholarship for eligible students covering full tuition and maintenance allowance.
   - First Graduate Concession: State tuition waiver of Rs 20,000/year for first-generation graduates.
2. Institutional Merit Scholarships:
   - 100% Tuition Fee Waiver for students scoring above 190 Cutoff in Higher Secondary Exams.
   - 50% Tuition Fee Waiver for cutoff between 180 and 189.9.
3. Sports Scholarships: Full fee exemption for national and state-level sports medalists.""",

    "fee_structure.txt": """MOUNT ZION COLLEGE OF ENGINEERING AND TECHNOLOGY - TUITION & HOSTEL FEE STRUCTURE
1. B.E. / B.Tech Annual Tuition Fee (Government Quota): Rs 55,000 per annum (as per State Fee Committee norms).
2. B.E. / B.Tech Annual Tuition Fee (Management Quota): Rs 85,000 per annum.
3. Hostel & Mess Fee: Rs 58,000 per annum (includes accommodation, 4 meals daily, laundry, Wi-Fi, and 24/7 power backup).
4. Transport Fee: Ranges between Rs 12,000 and Rs 22,000 per year based on distance and route.
5. Mode of Payment: Fees must be paid online through the official College Portal or via DD drawn in favor of 'Mount Zion College of Engineering and Technology'.""",

    "exam_regulations.txt": """MOUNT ZION COLLEGE OF ENGINEERING AND TECHNOLOGY - EXAMINATIONS & EVALUATION
1. Affiliation: Affiliated to Anna University, Chennai. Follows Choice Based Credit System (CBCS).
2. Continuous Internal Assessment (CIA): 40% weightage evaluated through 3 Internal Assessment Tests (IAT), assignments, and seminar presentations.
3. End Semester Examination: 60% weightage conducted by Anna University at the end of each semester.
4. Passing Criteria: Minimum 45% in End Semester Exam and overall 50% aggregate (Internal + External) per course.
5. Revaluation & Photocopy: Students can apply for answer script photocopy and revaluation within 10 days of Anna University results declaration.""",

    "departments_overview.txt": """MOUNT ZION COLLEGE OF ENGINEERING AND TECHNOLOGY - ACADEMIC DEPARTMENTS
1. Computer Science and Engineering (CSE): Intake 120. Focus on AI, Cloud Computing, Cybersecurity, and Software Engineering.
2. Artificial Intelligence and Data Science (AI & DS): Intake 60. Specializing in Machine Learning, Deep Learning, Big Data Analytics.
3. Electronics and Communication Engineering (ECE): Intake 120. Specializing in VLSI, Embedded Systems, IoT, and Telecom.
4. Electrical and Electronics Engineering (EEE): Intake 60. Focusing on Renewable Energy, Smart Grids, Power Systems.
5. Mechanical Engineering: Intake 60. Specializing in CAD/CAM, Robotics, Thermal Engineering, Automotive Design.
6. Civil Engineering: Intake 60. Specializing in Structural Design, Surveying, Environmental Engineering.""",

    "faculty_directory.txt": """MOUNT ZION COLLEGE OF ENGINEERING AND TECHNOLOGY - KEY FACULTY & ADMINISTRATION DIRECTORY
1. Principal: Dr. P. Balamurugan, M.E., Ph.D. (principal@mountzion.ac.in)
2. Vice Principal: Dr. A. Rajesh, M.E., Ph.D.
3. HOD - Computer Science & Engineering: Dr. K. Sundararajan, Ph.D. (hodcse@mountzion.ac.in)
4. HOD - AI & Data Science: Dr. S. Kavitha, Ph.D.
5. HOD - Electronics & Communication: Dr. M. Senthamilselvan, Ph.D.
6. HOD - Mechanical Engineering: Dr. R. Subramanian, Ph.D.
7. Training & Placement Officer: Prof. T. Vijayakumar (placement@mountzion.ac.in)""",

    "campus_facilities.txt": """MOUNT ZION COLLEGE OF ENGINEERING AND TECHNOLOGY - CAMPUS INFRASTRUCTURE & FACILITIES
1. High-Speed Internet: 1 Gbps leased line campus-wide Wi-Fi for all registered staff and students.
2. Central Computing Centre: 12 air-conditioned labs equipped with over 800 high-performance Intel i7 computers.
3. Main Auditorium: Fully air-conditioned 1500-seat auditorium with advanced AV surround sound system.
4. Cafeteria & Food Court: Hygienic multi-cuisine cafeteria offering healthy meals, beverages, and snacks.
5. ATM & Banking: 24/7 Indian Overseas Bank ATM situated near the main campus entrance.""",

    "academic_calendar.txt": """MOUNT ZION COLLEGE OF ENGINEERING AND TECHNOLOGY - ACADEMIC CALENDAR 2025-2026
1. Odd Semester (Semester I, III, V, VII):
   - Commencement of Classes: July 15, 2025
   - Internal Assessment Test 1: August 25 - August 30, 2025
   - Internal Assessment Test 2: September 29 - October 4, 2025
   - Internal Assessment Test 3: November 3 - November 8, 2025
   - Practical Examinations: November 17 - November 22, 2025
   - University Theory Exams: December 1, 2025 onwards
2. Even Semester (Semester II, IV, VI, VIII):
   - Classes Resume: January 12, 2026
   - University Theory Exams: May 15, 2026 onwards""",

    "events_workshops.txt": """MOUNT ZION COLLEGE OF ENGINEERING AND TECHNOLOGY - EVENTS, SYMPOSIUMS & FESTIVALS
1. ZionFest (Annual Cultural Fest): 2-day extravaganza showcasing music, dance, drama, art, and fashion competitions.
2. ZIONICS (National Level Technical Symposium): Organised annually by CSE & AI-DS departments featuring Hackathons, Paper Presentations, and Coding Battles.
3. Workshops & Guest Lectures: Over 40 industry workshops conducted annually featuring speakers from Google, TCS, IBM, and Anna University.""",

    "timetable_schedule.txt": """MOUNT ZION COLLEGE OF ENGINEERING AND TECHNOLOGY - DAILY TIMETABLE STRUCTURE
1. Morning Bell: 8:55 AM | Assembly / Morning Prayer: 8:55 AM - 9:00 AM
2. Period 1: 9:00 AM - 9:50 AM
3. Period 2: 9:50 AM - 10:40 AM
4. Morning Refreshment Break: 10:40 AM - 10:55 AM
5. Period 3: 10:55 AM - 11:45 AM
6. Period 4: 11:45 AM - 12:35 PM
7. Lunch Break: 12:35 PM - 1:30 PM
8. Period 5: 1:30 PM - 2:20 PM
9. Period 6: 2:20 PM - 3:10 PM
10. Period 7 (Sports / Library / Remedial): 3:10 PM - 4:10 PM""",

    "sports_facilities.txt": """MOUNT ZION COLLEGE OF ENGINEERING AND TECHNOLOGY - SPORTS & PHYSICAL EDUCATION
1. Indoor Sports Complex: Table Tennis, Badminton Courts, Chess, Carrom, and Fully Equipped Gym.
2. Outdoor Sports Grounds: Standard 400m Athletics Track, Full-size Cricket Ground, Football Pitch, Volleyball Courts, and Basketball Court with Floodlights.
3. Achievements: Winners of Anna University Zone-16 Volleyball and Cricket Championships.
4. Annual Sports Meet: Conducted every February with inter-departmental trophies for Men and Women.""",

    "nss_wing.txt": """MOUNT ZION COLLEGE OF ENGINEERING AND TECHNOLOGY - NATIONAL SERVICE SCHEME (NSS)
1. NSS Units: 2 active units under Anna University NSS Cell comprising 200 student volunteers.
2. Key Initiatives: Annual 7-day Special Rural Camp in adopted villages, Blood Donation Drives, Tree Plantation Drives, and Swachh Bharat Cleanliness Drives.
3. Special Recognition: Best NSS Unit Award recipient for rural literacy and health awareness programs.""",

    "ncc_unit.txt": """MOUNT ZION COLLEGE OF ENGINEERING AND TECHNOLOGY - NATIONAL CADET CORPS (NCC)
1. Affiliation: 4(TN) BN NCC Army Wing.
2. Parade Schedule: Saturdays 7:00 AM - 11:00 AM on college parade grounds.
3. Certificate Examinations: Cadets undergo training for NCC 'B' and 'C' Certificate exams, offering preference in Defence Forces (CDS/SSB interviews).
4. Camps: Participation in Republic Day Parade (RDC), Combined Annual Training Camps (CATC), and Trekking Camps.""",

    "anti_ragging_policy.txt": """MOUNT ZION COLLEGE OF ENGINEERING AND TECHNOLOGY - ZERO TOLERANCE ANTI-RAGGING POLICY
1. Zero Tolerance: Ragging in any form (physical, verbal, mental, or electronic) inside or outside the campus is strictly illegal.
2. Legal Action: Offenders will be immediately expelled from the college, and an FIR will be lodged with the Tamil Nadu Police under the Anti-Ragging Act.
3. Anti-Ragging Helpline: Toll-Free 1800-180-5522 | College Helpline: 04322-242025.
4. Anti-Ragging Committee: Headed by Principal with representatives from Police, Media, NGO, Faculty, and Parents.""",

    "grievance_redressal.txt": """MOUNT ZION COLLEGE OF ENGINEERING AND TECHNOLOGY - GRIEVANCE REDRESSAL & OBUDSMAN
1. Student Grievance Cell: Provides a platform for students to voice concerns regarding academics, infrastructure, examinations, or hostel facilities.
2. Online Portal: Students can register confidential complaints via the College Portal under Student Login.
3. Resolution Committee: Meets weekly to review complaints and resolve them within 5 working days.""",

    "internships_policy.txt": """MOUNT ZION COLLEGE OF ENGINEERING AND TECHNOLOGY - INTERNSHIP & INDUSTRIAL TRAINING
1. Mandatory Internship: Every B.E. / B.Tech student must undergo a minimum 2 to 4 weeks industrial internship during 4th and 6th semester vacations.
2. Credits & Assessment: Internship reports carry credits in the 7th semester curriculum.
3. Corporate Partners: Partnerships with BSNL, NLC, TNSDC, L&T, BHEL, and regional software technology parks.""",

    "projects_guidelines.txt": """MOUNT ZION COLLEGE OF ENGINEERING AND TECHNOLOGY - PROJECT GUIDELINES
1. Mini Project: Executed during 5th and 6th semesters in teams of up to 4 students.
2. Major Final Year Project: Carried out in 7th & 8th semesters under faculty guides. Projects involving industrial problems, patents, or high-impact IEEE paper publications are given special funding grants.
3. Funding Support: College provides seed funding up to Rs 25,000 for innovative student startup projects.""",

    "admissions_info.txt": """MOUNT ZION COLLEGE OF ENGINEERING AND TECHNOLOGY - ADMISSIONS & ELIGIBILITY
1. Admission Channels:
   - TNEA Counselling (Single Window System based on 10+2 marks in Physics, Chemistry, Mathematics).
   - Management Quota Entrance / Merit Selection.
   - Lateral Entry B.E. / B.Tech (Direct 2nd Year for Diploma holders and B.Sc graduates).
2. Eligibility: Passed 10+2 with minimum 45% aggregate in PCM (40% for reserved categories BC/MBC/SC/ST).
3. Contact Admission Cell: Phone: 04322-242025 | Email: admissions@mountzion.ac.in""",

    "certificates_process.txt": """MOUNT ZION COLLEGE OF ENGINEERING AND TECHNOLOGY - CERTIFICATES & OFFICIAL DOCUMENTS
1. Bonafide Certificate: Issued within 24 hours of applying online via Student Portal for Bank Loans, Bus Passes, Passport applications, and Competitions.
2. Transfer & Conduct Certificates: Issued upon completion of course or official clearance of all dues.
3. Transcript & Mark Sheets: Official Anna University grade sheets and provisional certificates distributed through the Academic Cell.""",

    "medical_facilities.txt": """MOUNT ZION COLLEGE OF ENGINEERING AND TECHNOLOGY - HEALTHCARE & MEDICAL SERVICES
1. Health Centre: On-campus medical clinic staffed by a full-time resident doctor and qualified staff nurse.
2. Operating Hours: 8:30 AM to 6:00 PM daily. 24/7 emergency care for hostel residents.
3. Emergency Transport: Dedicated 24/7 college ambulance available on campus. Tie-ups with Pudukkottai Government Medical College Hospital for advanced care.""",

    "leave_rules.txt": """MOUNT ZION COLLEGE OF ENGINEERING AND TECHNOLOGY - LEAVE APPLICATION & OD RULES
1. Casual Leave: Students must apply for casual leave 1 day prior with parent signature. Maximum 3 days per semester.
2. Medical Leave: For absences exceeding 2 days, a valid registered doctor's medical certificate and prescription must be produced.
3. On-Duty (OD) Leave: Maximum 10 days OD per semester for sports, paper presentations, and university events."""
}

print("Creating sample knowledge base files in ./documents/...")
for filename, text in documents_data.items():
    file_path = DOCUMENTS_DIR / filename
    file_path.write_text(text.strip(), encoding="utf-8")
    print(f"  - Wrote {filename} ({len(text)} chars)")

print("\nRebuilding ChromaDB vector store embeddings for all documents...")
rag = RAGService()
total = rag.build_index(reset=True)
print(f"[OK] Indexed {total} vector chunks into ChromaDB from {len(documents_data)} knowledge base documents!")
