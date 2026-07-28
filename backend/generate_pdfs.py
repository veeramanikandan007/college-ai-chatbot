"""
Generate all 10 demo PDF documents for CollegeMate AI.
Run: python generate_pdfs.py
"""
import os
from pathlib import Path
from fpdf import FPDF

DOCUMENTS_DIR = Path(__file__).resolve().parent / 'documents'
DOCUMENTS_DIR.mkdir(parents=True, exist_ok=True)

# Use HelveticaSans which supports Unicode (including ₹)
FONT_DIR = Path(__file__).resolve().parent / 'fonts'
FONT_DIR.mkdir(parents=True, exist_ok=True)


class CollegePDF(FPDF):
    """Custom PDF class with college branding and Unicode support."""

    def header(self):
        self.set_font('Helvetica', 'B', 10)
        self.set_text_color(10, 42, 106)
        self.cell(0, 8, 'CollegeMate AI - Knowledge Base', border='B', new_x='LMARGIN', new_y='NEXT')
        self.ln(3)

    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 7)
        self.set_text_color(100, 116, 128)
        self.cell(0, 10, f'Page {self.page_no()}', align='C')

    def add_title(self, title):
        self.set_font('Helvetica', 'B', 18)
        self.set_text_color(10, 42, 106)
        self.multi_cell(0, 12, title)
        self.ln(4)

    def add_subtitle(self, subtitle):
        self.set_font('Helvetica', 'B', 13)
        self.set_text_color(22, 61, 140)
        self.multi_cell(0, 8, subtitle)
        self.ln(2)

    def add_body(self, text, size=10, style=''):
        self.set_font('Helvetica', style, size)
        self.set_text_color(31, 41, 51)
        self.multi_cell(0, 6, text)
        self.ln(1)

    def add_bullet(self, text, size=10):
        self.set_font('Helvetica', '', size)
        self.set_text_color(31, 41, 51)
        self.multi_cell(0, 6, f'  - {text}')
        self.ln(0.5)

    def add_table(self, headers, rows):
        self.set_font('Helvetica', 'B', 9)
        self.set_text_color(10, 42, 106)
        col_width = 190 / len(headers)
        for h in headers:
            self.cell(col_width, 7, h, border=1, align='C', new_x='LMARGIN', new_y='TOP')
        self.ln(7)
        self.set_font('Helvetica', '', 9)
        self.set_text_color(31, 41, 51)
        for row in rows:
            for cell in row:
                self.cell(col_width, 7, str(cell), border=1, align='C', new_x='LMARGIN', new_y='TOP')
            self.ln(7)
        self.ln(2)


def setup_fonts(pdf):
    """No-op: using default Helvetica font (all Unicode chars replaced with Rs.)."""
    pass


def create_attendance_pdf():
    pdf = CollegePDF()
    setup_fonts(pdf)
    pdf.add_page()
    pdf.add_title('Attendance Rules & Regulations')
    pdf.add_subtitle('Metropolitan Institute of Technology')
    pdf.add_body('Effective: Academic Year 2024-25')
    pdf.ln(2)

    pdf.add_subtitle('1. General Attendance Policy')
    pdf.add_body(
        'A minimum of 75% attendance is mandatory in each subject to be eligible '
        'to sit for semester examinations. This applies to all theory, practical, '
        'and lab classes.'
    )

    pdf.add_subtitle('2. Condonation Policy')
    pdf.add_bullet('Medical leave with valid certificate: up to 10% condonation')
    pdf.add_bullet('Certificate must be submitted to HOD within 3 working days of returning')
    pdf.add_bullet('Students below 65% attendance are NOT eligible even with medical condonation')
    pdf.add_bullet('Sports leave condonation: up to 5% with valid sports body certificate')

    pdf.add_subtitle('3. Attendance Calculation')
    pdf.add_body(
        'Attendance Percentage = (Total Classes Attended / Total Classes Conducted) x 100'
    )

    pdf.add_subtitle('4. Consequences of Low Attendance')
    pdf.add_bullet('Below 75% but above 65%: Eligible with condonation (medical only)')
    pdf.add_bullet('Below 65%: Not eligible for exams, must repeat semester')
    pdf.add_bullet('Below 50%: Academic probation, may be asked to withdraw')

    pdf.add_subtitle('5. Attendance Report Format')
    pdf.add_table(
        ['Subject', 'Code', 'Attended', 'Total', 'Percentage'],
        [
            ['Operating Systems', 'CSE301', '42', '48', '87.5%'],
            ['DBMS', 'CSE302', '38', '44', '86.4%'],
            ['Networks', 'CSE303', '40', '45', '88.9%'],
            ['DSA', 'CSE304', '44', '50', '88.0%'],
            ['AI', 'CSE305', '36', '42', '85.7%'],
        ]
    )

    pdf.add_subtitle('6. Important Dates')
    pdf.add_bullet('Attendance report published: Every Friday')
    pdf.add_bullet('Condonation application deadline: 5 working days before exam')
    pdf.add_bullet('Final attendance eligibility list: 1 week before exams')

    pdf.output(DOCUMENTS_DIR / 'attendance.pdf')
    print('Created: attendance.pdf')


def create_fees_pdf():
    pdf = CollegePDF()
    setup_fonts(pdf)
    pdf.add_page()
    pdf.add_title('Fee Structure & Payment Policy')
    pdf.add_subtitle('Metropolitan Institute of Technology')
    pdf.add_body('Academic Year 2024-25 | Semester 5')
    pdf.ln(2)

    pdf.add_subtitle('1. Semester Fee Structure')
    pdf.add_table(
        ['Fee Head', 'Amount (Rs.)', 'Frequency'],
        [
            ['Tuition Fee', '42,000', 'Per Semester'],
            ['Exam Fee', '3,200', 'Per Semester'],
            ['Lab Fee', '5,500', 'Per Semester'],
            ['Development Fee', '2,000', 'Per Semester'],
            ['Library Fee', '1,500', 'Per Semester'],
            ['Sports & Activities', '1,500', 'Per Semester'],
            ['Total', '55,700', 'Per Semester'],
        ]
    )

    pdf.add_subtitle('2. Payment Methods')
    pdf.add_bullet('Online: Net Banking, Credit/Debit Card, UPI via Student Portal')
    pdf.add_bullet('Offline: Demand Draft / Cash at Finance Counter')
    pdf.add_bullet('Installment Plan: Available for 3rd year and above (3 months)')

    pdf.add_subtitle('3. Due Dates')
    pdf.add_table(
        ['Semester', 'Due Date', 'Late Fee'],
        [
            ['Semester 1', 'June 15', 'Rs.500/day'],
            ['Semester 2', 'December 15', 'Rs.500/day'],
            ['Semester 3', 'June 15', 'Rs.500/day'],
            ['Semester 4', 'December 15', 'Rs.500/day'],
            ['Semester 5', 'June 15', 'Rs.500/day'],
            ['Semester 6', 'December 15', 'Rs.500/day'],
        ]
    )

    pdf.add_subtitle('4. Scholarship & Concession')
    pdf.add_bullet('Merit Scholarship: Up to 50% tuition fee waiver (CGPA >= 9.0)')
    pdf.add_bullet('Means Scholarship: Up to 75% fee waiver (family income < Rs.2 lakhs)')
    pdf.add_bullet('Sports Scholarship: Up to 40% tuition fee waiver')
    pdf.add_bullet('Sibling Concession: 15% for second child, 25% for third child')

    pdf.add_subtitle('5. Refund Policy')
    pdf.add_body(
        'Full refund if admission is cancelled before the start of classes. '
        '50% refund if cancelled within 2 weeks of classes starting. '
        'No refund after 2 weeks.'
    )

    pdf.output(DOCUMENTS_DIR / 'fees.pdf')
    print('Created: fees.pdf')


def create_library_pdf():
    pdf = CollegePDF()
    setup_fonts(pdf)
    pdf.add_page()
    pdf.add_title('Library Rules & Services')
    pdf.add_subtitle('Central Library - MIT')
    pdf.ln(2)

    pdf.add_subtitle('1. Working Hours')
    pdf.add_table(
        ['Day', 'Hours'],
        [
            ['Monday - Friday', '8:00 AM - 8:00 PM'],
            ['Saturday', '9:00 AM - 6:00 PM'],
            ['Sunday', 'Closed'],
            ['Public Holidays', 'Closed'],
        ]
    )

    pdf.add_subtitle('2. Book Issue Policy')
    pdf.add_bullet('Maximum 4 books per student at a time')
    pdf.add_bullet('Issue period: 15 days (renewable once)')
    pdf.add_bullet('Renewal: Online via portal or at circulation desk')
    pdf.add_bullet('Late fine: Rs.2 per day per book')
    pdf.add_bullet('Lost book: Pay full cost + Rs.100 processing fee')

    pdf.add_subtitle('3. Digital Resources')
    pdf.add_bullet('IEEE Xplore, ACM Digital Library, SpringerLink')
    pdf.add_bullet('NPTEL Video Lectures')
    pdf.add_bullet('Digital Theses Repository')
    pdf.add_bullet('E-books: Over 5,000 titles available')

    pdf.add_subtitle('4. Study Facilities')
    pdf.add_bullet('Reading halls: 200 seats (silence zone)')
    pdf.add_bullet('Group study rooms: 10 rooms (booking required)')
    pdf.add_bullet('Computer lab: 50 systems with internet')
    pdf.add_bullet('Wi-Fi: Free campus-wide access')

    pdf.add_subtitle('5. Library Card')
    pdf.add_body(
        'All enrolled students receive a library card at the start of the academic year. '
        'Report lost cards immediately to the circulation desk (Rs.50 replacement fee).'
    )

    pdf.add_subtitle('6. Inter-Library Loan')
    pdf.add_body(
        'Books not available in our library can be borrowed from partner institutions '
        'via inter-library loan. Processing time: 7-10 working days. '
        'A nominal fee of Rs.20 per request applies.'
    )

    pdf.output(DOCUMENTS_DIR / 'library.pdf')
    print('Created: library.pdf')


def create_bus_timing_pdf():
    pdf = CollegePDF()
    setup_fonts(pdf)
    pdf.add_page()
    pdf.add_title('Bus Routes & Timings')
    pdf.add_subtitle('Transport Department')
    pdf.ln(2)

    pdf.add_subtitle('1. Bus Routes')
    pdf.add_table(
        ['Route No', 'Route Name', 'Departure', 'Return', 'Stops'],
        [
            ['1', 'City Center', '7:45 AM', '5:30 PM', '12 stops'],
            ['2', 'North Campus', '7:30 AM', '5:45 PM', '8 stops'],
            ['3', 'East Zone', '7:50 AM', '5:15 PM', '10 stops'],
            ['4', 'South Bay', '7:40 AM', '5:30 PM', '9 stops'],
            ['5', 'West Side', '7:35 AM', '5:50 PM', '7 stops'],
        ]
    )

    pdf.add_subtitle('2. Important Notes')
    pdf.add_bullet('All buses depart from the Main Gate')
    pdf.add_bullet('Bus pass is mandatory for all students')
    pdf.add_bullet('Monthly pass: Rs.300 | Semester pass: Rs.900')
    pdf.add_bullet('Bus schedule may change during holidays')
    pdf.add_bullet('Contact Transport Office: +1 (555) 019-2834')

    pdf.add_subtitle('3. Route 3 - East Zone (Detailed)')
    pdf.add_bullet('Stop 1: Main Gate (Departure: 7:50 AM)')
    pdf.add_bullet('Stop 2: Sector 5 Crossroads')
    pdf.add_bullet('Stop 3: Green Park')
    pdf.add_bullet('Stop 4: City Mall')
    pdf.add_bullet('Stop 5: Railway Station')
    pdf.add_bullet('Stop 6: Bus Stand')
    pdf.add_bullet('Stop 7: College Campus (Arrival: 8:20 AM)')
    pdf.add_bullet('Return: 5:15 PM from Main Gate')

    pdf.add_subtitle('4. Emergency Contact')
    pdf.add_body(
        'Transport In-charge: +1 (555) 019-2835\n'
        'Bus Driver (Route 3): +1 (555) 019-2836\n'
        '24x7 Helpline: +1 (555) 019-2834'
    )

    pdf.output(DOCUMENTS_DIR / 'bus_timing.pdf')
    print('Created: bus_timing.pdf')


def create_exam_schedule_pdf():
    pdf = CollegePDF()
    setup_fonts(pdf)
    pdf.add_page()
    pdf.add_title('Examination Schedule')
    pdf.add_subtitle('Semester 5 - End Term Examinations')
    pdf.add_body('Academic Year 2024-25')
    pdf.ln(2)

    pdf.add_subtitle('1. Exam Schedule')
    pdf.add_table(
        ['Date', 'Day', 'Subject', 'Time', 'Venue'],
        [
            ['May 10', 'Saturday', 'Operating Systems', '9:00 AM - 12:00 PM', 'Block A - Labs 1-3'],
            ['May 12', 'Monday', 'Database Management Systems', '2:00 PM - 5:00 PM', 'Block B - Rooms 101-105'],
            ['May 14', 'Wednesday', 'Computer Networks', '9:00 AM - 12:00 PM', 'Block A - Rooms 201-205'],
            ['May 16', 'Friday', 'Data Structures & Algorithms', '2:00 PM - 5:00 PM', 'Block C - Hall'],
            ['May 18', 'Sunday', 'Artificial Intelligence', '9:00 AM - 12:00 PM', 'Block B - Labs 4-6'],
            ['May 20', 'Tuesday', 'Software Engineering', '2:00 PM - 5:00 PM', 'Block A - Rooms 201-205'],
        ]
    )

    pdf.add_subtitle('2. Exam Instructions')
    pdf.add_bullet('Report 30 minutes before the exam starts')
    pdf.add_bullet('Carry college ID card and admit card')
    pdf.add_bullet('No electronic devices allowed inside exam hall')
    pdf.add_bullet('Use of unfair means will result in immediate failure')
    pdf.add_bullet('Answer booklet must be signed by invigilator')

    pdf.add_subtitle('3. Internal Assessment')
    pdf.add_body(
        'Best 2 out of 3 internal assessments are considered for final grade.\n'
        'Internal Assessment weightage: 30%\n'
        'End Term Examination weightage: 70%'
    )

    pdf.add_subtitle('4. Grade Distribution')
    pdf.add_table(
        ['Grade', 'Range', 'Points'],
        [
            ['O', '90-100', '10'],
            ['A+', '80-89', '9'],
            ['A', '70-79', '8'],
            ['B+', '60-69', '7'],
            ['B', '50-59', '6'],
            ['C', '40-49', '5'],
            ['F', 'Below 40', '0'],
        ]
    )

    pdf.add_subtitle('5. Important Dates')
    pdf.add_bullet('Exam registration deadline: May 1')
    pdf.add_bullet('Hall ticket download: April 25 - May 5')
    pdf.add_bullet('Result declaration: June 15')
    pdf.add_bullet('Grade card distribution: June 20')

    pdf.output(DOCUMENTS_DIR / 'exam_schedule.pdf')
    print('Created: exam_schedule.pdf')


def create_placement_pdf():
    pdf = CollegePDF()
    setup_fonts(pdf)
    pdf.add_page()
    pdf.add_title('Campus Placement Statistics')
    pdf.add_subtitle('Career Services - Academic Year 2023-24')
    pdf.ln(2)

    pdf.add_subtitle('1. Overall Statistics')
    pdf.add_table(
        ['Metric', 'Value'],
        [
            ['Placement Rate', '92.4%'],
            ['Total Students', '480'],
            ['Students Placed', '444'],
            ['Companies Visited', '87'],
            ['Highest Package', 'Rs.42 LPA (Google)'],
            ['Average Package', 'Rs.8.6 LPA'],
            ['Median Package', 'Rs.7.2 LPA'],
            ['Top Location', 'Bangalore (45%)'],
        ]
    )

    pdf.add_subtitle('2. Top Recruiters')
    pdf.add_table(
        ['Company', 'Role', 'Package (LPA)'],
        [
            ['Google', 'SDE Intern', '42'],
            ['Amazon', 'SDE', '28'],
            ['Microsoft', 'SDE', '26'],
            ['TCS', 'Graduate Engineer', '7.5'],
            ['Infosys', 'Systems Engineer', '8.0'],
            ['Wipro', 'Junior Engineer', '7.0'],
            ['Accenture', 'Analyst', '9.0'],
            ['Zoho', 'Developer', '12'],
            ['Capgemini', 'Consultant', '8.5'],
            ['Cognizant', 'Programmer', '7.8'],
        ]
    )

    pdf.add_subtitle('3. Placement Process')
    pdf.add_bullet('Step 1: Register on the Career Portal (September)')
    pdf.add_bullet('Step 2: Resume building workshop (October)')
    pdf.add_bullet('Step 3: Aptitude and technical test (November)')
    pdf.add_bullet('Step 4: Group discussion (December)')
    pdf.add_bullet('Step 5: Technical and HR interviews (January)')
    pdf.add_bullet('Step 6: Offer acceptance (February)')

    pdf.add_subtitle('4. Eligibility Criteria')
    pdf.add_bullet('Minimum 7.0 CGPA (no active backlogs)')
    pdf.add_bullet('Minimum 75% attendance in all subjects')
    pdf.add_bullet('No disciplinary actions pending')
    pdf.add_bullet('Completed 6th semester (for final year students)')

    pdf.add_subtitle('5. Internship Opportunities')
    pdf.add_body(
        'Summer internships available with top companies.\n'
        'Duration: 8-12 weeks (May - July)\n'
        'Stipend: Rs.25,000 - Rs.1,00,000 per month\n'
        'Application deadline: March 15'
    )

    pdf.output(DOCUMENTS_DIR / 'placement.pdf')
    print('Created: placement.pdf')


def create_hostel_rules_pdf():
    pdf = CollegePDF()
    setup_fonts(pdf)
    pdf.add_page()
    pdf.add_title('Hostel Rules & Regulations')
    pdf.add_subtitle('Student Accommodation Services')
    pdf.ln(2)

    pdf.add_subtitle('1. General Rules')
    pdf.add_bullet('Hostel allotment is based on first-come-first-served basis')
    pdf.add_bullet('Only day scholars can apply for hostel accommodation in 2nd year onwards')
    pdf.add_bullet('Hostel fee: Rs.45,000 per annum (includes mess charges)')
    pdf.add_bullet('Security deposit: Rs.5,000 (refundable on checkout)')

    pdf.add_subtitle('2. Curfew Timings')
    pdf.add_table(
        ['Day', 'In Time', 'Out Time'],
        [
            ['Monday - Friday', '6:00 AM', '9:30 PM'],
            ['Saturday', '6:00 AM', '10:00 PM'],
            ['Sunday', '6:00 AM', '8:00 PM'],
            ['Public Holidays', '6:00 AM', '10:00 PM'],
        ]
    )

    pdf.add_subtitle('3. Visitor Policy')
    pdf.add_bullet('Visitors allowed only in the visitor lobby')
    pdf.add_bullet('Weekdays: 4:00 PM - 7:00 PM')
    pdf.add_bullet('Weekends: 10:00 AM - 6:00 PM')
    pdf.add_bullet('Overnight stays not permitted')
    pdf.add_bullet('Guardian meeting requires prior permission from Warden')

    pdf.add_subtitle('4. Mess Facilities')
    pdf.add_bullet('Breakfast: 7:00 AM - 9:30 AM')
    pdf.add_bullet('Lunch: 12:00 PM - 2:00 PM')
    pdf.add_bullet('Dinner: 7:00 PM - 9:00 PM')
    pdf.add_bullet('Special diet: Notify mess incharge 2 days in advance')

    pdf.add_subtitle('5. Disciplinary Actions')
    pdf.add_bullet('First offense: Warning + parent meeting')
    pdf.add_bullet('Second offense: Fine Rs.500 + 1 week restriction')
    pdf.add_bullet('Third offense: Hostel allotment cancelled')
    pdf.add_bullet('Ragging: Immediate expulsion + legal action')

    pdf.add_subtitle('6. Contact Information')
    pdf.add_body(
        'Chief Warden: +1 (555) 019-2840 (Extension 402)\n'
        'Hostel Office: Room 101, Hostel Block A\n'
        'Emergency Contact: +1 (555) 019-2841'
    )

    pdf.output(DOCUMENTS_DIR / 'hostel_rules.pdf')
    print('Created: hostel_rules.pdf')


def create_college_rules_pdf():
    pdf = CollegePDF()
    setup_fonts(pdf)
    pdf.add_page()
    pdf.add_title('College Rules & Regulations')
    pdf.add_subtitle('Student Handbook - Academic Year 2024-25')
    pdf.ln(2)

    pdf.add_subtitle('1. Academic Conduct')
    pdf.add_bullet('Attendance: Minimum 75% required in each subject')
    pdf.add_bullet('Late assignment submission: 10% penalty per day')
    pdf.add_bullet('Plagiarism: Zero tolerance - immediate fail')
    pdf.add_bullet('Mobile phones: Not allowed in classrooms and labs')

    pdf.add_subtitle('2. Dress Code')
    pdf.add_bullet('Boys: Formal shirt, trousers, closed shoes')
    pdf.add_bullet('Girls: Salwar kameez or formal attire, closed shoes')
    pdf.add_bullet('ID card must be worn at all times on campus')
    pdf.add_bullet('No shorts, sleeveless tops, or ripped jeans')

    pdf.add_subtitle('3. Campus Facilities')
    pdf.add_bullet('Wi-Fi: Free campus-wide access (login with student ID)')
    pdf.add_bullet('Library: Open 8 AM - 8 PM (Mon-Fri), 9 AM - 6 PM (Sat)')
    pdf.add_bullet('Cafeteria: 7:30 AM - 6:00 PM')
    pdf.add_bullet('Gym: 6:00 AM - 10:00 PM (free for all students)')

    pdf.add_subtitle('4. Code of Conduct')
    pdf.add_bullet('Respect faculty, staff, and fellow students')
    pdf.add_bullet('No ragging or harassment of any kind')
    pdf.add_bullet('No smoking, alcohol, or drugs on campus')
    pdf.add_bullet('Maintain cleanliness in all areas')
    pdf.add_bullet('Follow all safety protocols during emergencies')

    pdf.add_subtitle('5. Grievance Redressal')
    pdf.add_bullet('Level 1: Class Advisor (within 3 working days)')
    pdf.add_bullet('Level 2: HOD (within 5 working days)')
    pdf.add_bullet('Level 3: Dean Student Welfare (within 7 working days)')
    pdf.add_bullet('Level 4: Director (within 10 working days)')

    pdf.add_subtitle('6. Important Contacts')
    pdf.add_table(
        ['Department', 'Contact'],
        [
            ['Student Welfare', '+1 (555) 019-2850'],
            ['Library', '+1 (555) 019-2851'],
            ['Transport', '+1 (555) 019-2834'],
            ['Hostel', '+1 (555) 019-2840'],
            ['Medical', '+1 (555) 019-2855'],
            ['Security', '+1 (555) 019-2800'],
        ]
    )

    pdf.output(DOCUMENTS_DIR / 'college_rules.pdf')
    print('Created: college_rules.pdf')


def create_canteen_menu_pdf():
    pdf = CollegePDF()
    setup_fonts(pdf)
    pdf.add_page()
    pdf.add_title('Canteen Menu')
    pdf.add_subtitle('Campus Cafeteria')
    pdf.add_body('Weekly Menu | Academic Year 2024-25')
    pdf.ln(2)

    pdf.add_subtitle('1. Breakfast (7:30 AM - 10:30 AM)')
    pdf.add_table(
        ['Item', 'Price (Rs.)'],
        [
            ['Idli (3 pcs)', '25'],
            ['Dosa', '35'],
            ['Poha', '20'],
            ['Paratha + Curd', '30'],
            ['Poha + Thepla', '25'],
            ['Tea/Coffee', '15'],
            ['Fresh Juice', '35'],
        ]
    )

    pdf.add_subtitle('2. Lunch (12:00 PM - 2:30 PM)')
    pdf.add_table(
        ['Item', 'Price (Rs.)'],
        [
            ['Rice + Dal + Veg Curry', '60'],
            ['Roti + Dal + Veg Curry', '55'],
            ['Paneer Butter Masala + Roti', '75'],
            ['Chicken Curry + Rice', '90'],
            ['Veg Thali', '70'],
            ['Non-Veg Thali', '100'],
            ['Salad', '20'],
        ]
    )

    pdf.add_subtitle('3. Snacks (2:30 PM - 5:00 PM)')
    pdf.add_table(
        ['Item', 'Price (Rs.)'],
        [
            ['Samosa (2 pcs)', '25'],
            ['Sandwich', '35'],
            ['Pasta', '45'],
            ['Burger', '50'],
            ['Pizza (Personal)', '75'],
            ['Maggi', '30'],
            ['Ice Cream', '25'],
        ]
    )

    pdf.add_subtitle('4. Dinner (7:00 PM - 9:00 PM)')
    pdf.add_table(
        ['Item', 'Price (Rs.)'],
        [
            ['Roti + Dal + Veg', '55'],
            ['Fried Rice + Manchurian', '70'],
            ['Noodles + Veg', '65'],
            ['Paneer Wrap', '60'],
            ['Chicken Sandwich', '75'],
            ['Soup of the Day', '35'],
        ]
    )

    pdf.add_subtitle('5. Weekly Specials')
    pdf.add_bullet('Monday: North Indian Thali')
    pdf.add_bullet('Tuesday: South Indian Meal')
    pdf.add_bullet('Wednesday: Chinese Night')
    pdf.add_bullet('Thursday: Punjabi Special')
    pdf.add_bullet('Friday: Fast Food Day')
    pdf.add_bullet('Saturday: Continental Breakfast')
    pdf.add_bullet('Sunday: Family Meal Combo')

    pdf.add_subtitle('6. Payment')
    pdf.add_body(
        'Cash and card payments accepted.\n'
        'Student ID card required for all purchases.\n'
        'No outside food allowed in campus dining areas.'
    )

    pdf.output(DOCUMENTS_DIR / 'canteen_menu.pdf')
    print('Created: canteen_menu.pdf')


def create_scholarship_pdf():
    pdf = CollegePDF()
    setup_fonts(pdf)
    pdf.add_page()
    pdf.add_title('Scholarship Programs')
    pdf.add_subtitle('Financial Aid & Merit Scholarships')
    pdf.ln(2)

    pdf.add_subtitle('1. Merit-Based Scholarships')
    pdf.add_table(
        ['Scholarship', 'Eligibility', 'Benefit'],
        [
            ['University Gold Medal', 'CGPA >= 9.5, no backlogs', 'Full tuition waiver + Rs.10,000'],
            ["Dean's Scholarship", 'CGPA >= 9.0, no backlogs', '50% tuition waiver'],
            ['Merit Scholarship', 'CGPA >= 8.5, no backlogs', '30% tuition waiver'],
            ['Department Topper', 'Top in department, CGPA >= 8.0', '20% tuition waiver'],
        ]
    )

    pdf.add_subtitle('2. Means-Based Scholarships')
    pdf.add_table(
        ['Scheme', 'Family Income', 'Benefit'],
        [
            ['National Means', '< Rs.1.5 lakhs/year', '75% tuition waiver'],
            ['State Merit', 'Rs.1.5 - 3 lakhs/year', '50% tuition waiver'],
            ['Minority Aid', '< Rs.2 lakhs/year', 'Full tuition + Rs.5,000'],
            ['SC/ST Scholarship', 'As per government norms', 'Full tuition + Rs.10,000'],
        ]
    )

    pdf.add_subtitle('3. Sports Scholarships')
    pdf.add_bullet('National Level Players: Full tuition waiver + Rs.15,000')
    pdf.add_bullet('State Level Players: 50% tuition waiver + Rs.7,500')
    pdf.add_bullet('University Team Players: 30% tuition waiver + Rs.5,000')
    pdf.add_bullet('College Team Players: 20% tuition waiver')

    pdf.add_subtitle('4. Other Scholarships')
    pdf.add_bullet('NRI Quota: 15% seats (fees as per NRI quota)')
    pdf.add_bullet('Sibling Concession: 15% for 2nd child, 25% for 3rd child')
    pdf.add_bullet('Faculty Ward: 25% tuition waiver')
    pdf.add_bullet('Alumni Dependent: 10% tuition waiver')

    pdf.add_subtitle('5. Application Process')
    pdf.add_bullet('Step 1: Download application form from college portal')
    pdf.add_bullet('Step 2: Submit required documents (income certificate, marksheet, etc.)')
    pdf.add_bullet('Step 3: Application deadline: June 1 (for odd semester)')
    pdf.add_bullet('Step 4: December 1 (for even semester)')
    pdf.add_bullet('Step 5: Results announced within 2 weeks of deadline')

    pdf.add_subtitle('6. Required Documents')
    pdf.add_bullet('Mark sheets of previous semesters')
    pdf.add_bullet('Income certificate (for means-based)')
    pdf.add_bullet('Community certificate (if applicable)')
    pdf.add_bullet('Sports certificate (for sports scholarship)')
    pdf.add_bullet('Passport size photographs (4 copies)')

    pdf.output(DOCUMENTS_DIR / 'scholarship.pdf')
    print('Created: scholarship.pdf')


def main():
    print('Generating demo PDF documents...')
    print(f'Output directory: {DOCUMENTS_DIR}')
    print()

    create_attendance_pdf()
    create_fees_pdf()
    create_library_pdf()
    create_bus_timing_pdf()
    create_exam_schedule_pdf()
    create_placement_pdf()
    create_hostel_rules_pdf()
    create_college_rules_pdf()
    create_canteen_menu_pdf()
    create_scholarship_pdf()

    print()
    print('All 10 PDF documents generated successfully!')
    print(f'Total files: {len(list(DOCUMENTS_DIR.glob("*.pdf")))}')


if __name__ == '__main__':
    main()
