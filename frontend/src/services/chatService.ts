const API_BASE_URL = 'http://127.0.0.1:8000';

export interface SendMessagePayload {
  message: string;
  chatId?: number;
}

export interface ChatResponse {
  reply: string;
  sources?: string[];
  chat_id?: number;
}

// ─── Knowledge-base answers (used when backend is offline) ───────────────────
const MOCK_ANSWERS: Record<string, string> = {
  attendance:
    '### Attendance Rules & Regulations\n\n' +
    '**Minimum Requirement:** 75% attendance is mandatory in each subject to be eligible for semester exams.\n\n' +
    '### Condonation Policy\n' +
    '- Medical leave with valid certificate: up to 10% condonation\n' +
    '- Certificate must be submitted to HOD within 3 working days of returning\n' +
    '- Students below 65% are NOT eligible even with medical condonation\n' +
    '- Sports leave condonation: up to 5% with valid sports body certificate\n\n' +
    '### Attendance Calculation\n' +
    'Attendance % = (Total Classes Attended / Total Classes Conducted) × 100\n\n' +
    '### Consequences\n' +
    '- Below 75% but above 65%: Eligible with condonation (medical only)\n' +
    '- Below 65%: Not eligible for exams, must repeat semester\n' +
    '- Below 50%: Academic probation, may be asked to withdraw',

  fees:
    '### Semester Fee Details (5th Semester)\n\n' +
    '| Fee Head | Amount |\n|---|---|\n' +
    '| Tuition Fee | ₹42,000 |\n' +
    '| Exam Fee | ₹3,200 |\n' +
    '| Lab Fee | ₹5,500 |\n' +
    '| Development Fee | ₹2,000 |\n' +
    '| Library Fee | ₹1,500 |\n' +
    '| Sports & Activities | ₹1,500 |\n' +
    '| **Total** | **₹55,700** |\n\n' +
    '> 💡 **Payment Status:** Fees can be paid online via Student Portal or at Finance Counter.\n' +
    '> Last date for fee payment: 15th of the current month.\n' +
    '> Late fee: ₹500 per day after due date.',

  library:
    '### Library Working Hours\n\n' +
    '| Day | Hours |\n|---|---|\n' +
    '| Monday - Friday | 8:00 AM - 8:00 PM |\n' +
    '| Saturday | 9:00 AM - 6:00 PM |\n' +
    '| Sunday & Holidays | Closed |\n\n' +
    '### Book Issue Policy\n' +
    '- Maximum 4 books per student at once\n' +
    '- Issue period: 15 days (renewable once)\n' +
    '- Late fine: ₹2 per day per book\n' +
    '- Lost book: Pay full cost + ₹100 processing fee\n\n' +
    '### Digital Resources\n' +
    '- IEEE Xplore, ACM Digital Library, SpringerLink\n' +
    '- NPTEL Video Lectures\n' +
    '- E-books: Over 5,000 titles available',

  bus:
    '### College Bus Routes & Timings\n\n' +
    '| Route | Route Name | Departure | Return |\n|---|---|---|---|\n' +
    '| Route 1 | City Center | 7:45 AM | 5:30 PM |\n' +
    '| Route 2 | North Campus | 7:30 AM | 5:45 PM |\n' +
    '| Route 3 | East Zone | 7:50 AM | 5:15 PM |\n' +
    '| Route 4 | South Bay | 7:40 AM | 5:30 PM |\n' +
    '| Route 5 | West Side | 7:35 AM | 5:50 PM |\n\n' +
    '> All buses depart from the **Main Gate**.\n' +
    '> Bus pass: Monthly ₹300 | Semester ₹900\n' +
    '> Contact: +1 (555) 019-2834 (Transport Desk)',

  certificate:
    '### Certificate Application Process\n\n' +
    '1. Log in to the **Student Portal** → Services → Certificates\n' +
    '2. Select certificate type: *Bonafide / Transfer / Character / Migration*\n' +
    '3. Fill the online form and pay **₹50** (online payment)\n' +
    '4. Certificate will be ready within **3 working days**\n\n' +
    '> Walk-in applications accepted at **Registrar Office** (9 AM – 4 PM, Mon–Fri).\n' +
    '> Available certificates: Bonafide, Transfer, Character, Migration, Course Completion.',

  timetable:
    '### Class Timetable — CSE 5th Semester\n\n' +
    '| Day | 9:00–10:00 | 10:00–11:00 | 11:15–12:15 | 12:15–1:15 | 2:15–3:15 |\n' +
    '|---|---|---|---|---|---|\n' +
    '| Mon | OS | DBMS | Networks | — | AI Lab |\n' +
    '| Tue | DSA | AI | OS | — | DBMS Lab |\n' +
    '| Wed | DBMS | Networks | OS | — | DSA Lab |\n' +
    '| Thu | AI | DSA | Networks | — | SE |\n' +
    '| Fri | OS | DBMS | AI | — | Mini Project |',

  placement:
    '### Campus Placement Statistics (2023–24)\n\n' +
    '- 📊 **Placement Rate**: 92.4%\n' +
    '- 💼 **Companies Visited**: 87\n' +
    '- 💰 **Highest Package**: ₹42 LPA (Google)\n' +
    '- 📈 **Average Package**: ₹8.6 LPA\n' +
    '- 📊 **Median Package**: ₹7.2 LPA\n\n' +
    '**Top Recruiters**: Google, Amazon, Microsoft, TCS, Infosys, Wipro, Accenture, Zoho, Capgemini, Cognizant\n\n' +
    '### Eligibility Criteria\n' +
    '- Minimum 7.0 CGPA (no active backlogs)\n' +
    '- Minimum 75% attendance in all subjects\n' +
    '- No disciplinary actions pending',

  hostel:
    '### Hostel Rules & Regulations\n\n' +
    '**Curfew Timings:**\n' +
    '| Day | In Time | Out Time |\n|---|---|---|\n' +
    '| Mon-Fri | 6:00 AM | 9:30 PM |\n' +
    '| Saturday | 6:00 AM | 10:00 PM |\n' +
    '| Sunday | 6:00 AM | 8:00 PM |\n\n' +
    '**Visitor Policy:**\n' +
    '- Weekdays: 4:00 PM - 7:00 PM\n' +
    '- Weekends: 10:00 AM - 6:00 PM\n' +
    '- Overnight stays not permitted\n\n' +
    '**Mess Hours:**\n' +
    '- Breakfast: 7:00 AM - 9:30 AM\n' +
    '- Lunch: 12:00 PM - 2:00 PM\n' +
    '- Dinner: 7:00 PM - 9:00 PM',

  canteen:
    '### Campus Cafeteria Menu\n\n' +
    '**Breakfast (7:30 AM - 10:30 AM)**\n' +
    '| Item | Price |\n|---|---|\n' +
    '| Idli (3 pcs) | ₹25 |\n' +
    '| Dosa | ₹35 |\n' +
    '| Poha | ₹20 |\n' +
    '| Paratha + Curd | ₹30 |\n' +
    '| Tea/Coffee | ₹15 |\n\n' +
    '**Lunch (12:00 PM - 2:30 PM)**\n' +
    '| Item | Price |\n|---|---|\n' +
    '| Rice + Dal + Veg | ₹60 |\n' +
    '| Roti + Dal + Veg | ₹55 |\n' +
    '| Paneer Butter Masala | ₹75 |\n' +
    '| Chicken Curry + Rice | ₹90 |\n' +
    '| Veg Thali | ₹70 |\n\n' +
    '**Weekly Specials:**\n' +
    '- Monday: North Indian Thali\n' +
    '- Tuesday: South Indian Meal\n' +
    '- Wednesday: Chinese Night\n' +
    '- Thursday: Punjabi Special\n' +
    '- Friday: Fast Food Day',

  scholarship:
    '### Scholarship Programs\n\n' +
    '**Merit-Based Scholarships:**\n' +
    '| Scholarship | Eligibility | Benefit |\n|---|---|---|\n' +
    '| University Gold Medal | CGPA >= 9.5 | Full waiver + ₹10,000 |\n' +
    "| Dean's Scholarship | CGPA >= 9.0 | 50% waiver |\n" +
    '| Merit Scholarship | CGPA >= 8.5 | 30% waiver |\n' +
    '| Department Topper | CGPA >= 8.0 | 20% waiver |\n\n' +
    '**Means-Based Scholarships:**\n' +
    '- National Means: < ₹1.5 lakhs/year → 75% waiver\n' +
    '- State Merit: ₹1.5-3 lakhs/year → 50% waiver\n' +
    '- Minority Aid: < ₹2 lakhs/year → Full waiver + ₹5,000\n\n' +
    '**Application Deadline:** June 1 (odd sem) / December 1 (even sem)',

  cgpa:
    '### Your Academic Record\n\n' +
    '**CGPA:** 8.52 / 10.0\n\n' +
    '### Grading Scale\n' +
    '- 9.0 - 10.0: Excellent (O Grade)\n' +
    '- 8.0 - 8.99: Very Good (A+ Grade)\n' +
    '- 7.0 - 7.99: Good (A Grade)\n' +
    '- 6.0 - 6.99: Above Average (B+ Grade)\n' +
    '- 4.0 - 5.99: Pass (B Grade)\n' +
    '- Below 4.0: Fail\n\n' +
    'Your CGPA of 8.52 is Very Good.',

  bonafide:
    '### Bonafide Certificate Application\n\n' +
    '1. Log in to the **Student Portal** → Services → Certificates\n' +
    '2. Select "Bonafide Certificate"\n' +
    '3. Fill the online form and pay **₹50** (online payment)\n' +
    '4. Certificate will be ready within **3 working days**\n\n' +
    '> Your current bonafide certificate status: **Available**\n' +
    '> Walk-in applications accepted at **Registrar Office** (9 AM – 4 PM, Mon–Fri).',
};

function getMockAnswer(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('attendance')) return MOCK_ANSWERS.attendance;
  if (lower.includes('fee') || lower.includes('due') || lower.includes('payment') || lower.includes('balance')) return MOCK_ANSWERS.fees;
  if (lower.includes('library') || lower.includes('book')) return MOCK_ANSWERS.library;
  if (lower.includes('bus') || lower.includes('route') || lower.includes('transport')) return MOCK_ANSWERS.bus;
  if (lower.includes('certificate') || lower.includes('bonafide') || lower.includes('transfer')) return MOCK_ANSWERS.certificate;
  if (lower.includes('timetable') || lower.includes('schedule') || lower.includes('class') || lower.includes('today')) return MOCK_ANSWERS.timetable;
  if (lower.includes('placement') || lower.includes('job') || lower.includes('company')) return MOCK_ANSWERS.placement;
  if (lower.includes('hostel') || lower.includes('curfew')) return MOCK_ANSWERS.hostel;
  if (lower.includes('canteen') || lower.includes('menu') || lower.includes('food')) return MOCK_ANSWERS.canteen;
  if (lower.includes('scholarship')) return MOCK_ANSWERS.scholarship;
  if (lower.includes('cgpa') || lower.includes('gpa') || lower.includes('grade')) return MOCK_ANSWERS.cgpa;
  if (lower.includes('exam') || lower.includes('exam schedule') || lower.includes('when')) return MOCK_ANSWERS.timetable;
  if (lower.includes('start') || lower.includes('college start') || lower.includes('timing')) return MOCK_ANSWERS.library;

  return (
    `I searched the CollegeMate knowledge base for **"${message}"**.\n\n` +
    `Here is what I found:\n\n` +
    `- The college operates under standard academic regulations.\n` +
    `- For specific queries, visit the **Student Affairs Office** or contact your **Department HOD**.\n` +
    `- You can also raise a service ticket through the **Student Portal**.\n\n` +
    `> 💡 Try asking about: *attendance*, *fees*, *library hours*, *bus timings*, *certificates*, or *placement statistics*`
  );
}

export async function sendChatMessage(payload: SendMessagePayload): Promise<ChatResponse> {
  // ─── Try real backend first ───────────────────────────────────────────────
  try {
    const token = localStorage.getItem('collegemate_token');
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ message: payload.message, chat_id: payload.chatId }),
      signal: AbortSignal.timeout(15000),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.reply) return { reply: data.reply, sources: data.sources, chat_id: data.chat_id };
    }
  } catch {
    // ─── Backend not available — use mock knowledge-base answers ────────────
  }

  // Offline fallback
  return { reply: getMockAnswer(payload.message) };
}

// ─── Chat session management ─────────────────────────────────────────────────
export async function getChatSessions(): Promise<any[]> {
  try {
    const token = localStorage.getItem('collegemate_token');
    const response = await fetch(`${API_BASE_URL}/sessions`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch {
    // Return empty array for demo mode
  }
  return [];
}

export async function createChatSession(): Promise<any> {
  try {
    const token = localStorage.getItem('collegemate_token');
    const response = await fetch(`${API_BASE_URL}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch {
    // Return mock session for demo mode
  }
  return { id: Date.now(), title: 'New Conversation' };
}

export async function getSessionMessages(sessionId: number): Promise<any[]> {
  try {
    const token = localStorage.getItem('collegemate_token');
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/messages`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch {
    // Return empty array for demo mode
  }
  return [];
}

export async function deleteChatSession(sessionId: number): Promise<boolean> {
  try {
    const token = localStorage.getItem('collegemate_token');
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal: AbortSignal.timeout(5000),
    });

    return response.ok;
  } catch {
    return true; // Assume success in demo mode
  }
}

export async function pinChatSession(sessionId: number): Promise<any> {
  try {
    const token = localStorage.getItem('collegemate_token');
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/pin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) return await response.json();
  } catch {}
  return { pinned: true };
}

export async function favoriteChatSession(sessionId: number): Promise<any> {
  try {
    const token = localStorage.getItem('collegemate_token');
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/favorite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) return await response.json();
  } catch {}
  return { favorite: true };
}
