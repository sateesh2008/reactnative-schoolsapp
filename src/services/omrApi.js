const initialSession = {
  id: 'omr-session-1',
  name: 'My Exam (JEE)',
  code: 'NEET',
  pattern: 'JEE Pattern',
  scope: 'All Classes & Sections',
  questions: 180,
  positiveMarks: 4,
  negativeMarks: 1,
  evaluated: 1,
  keys: 1,
  status: 'Draft',
  createdDate: '18/09/2026',
};

const initialAnswerKey = Array.from({ length: 10 }, (_, index) => ({ question: index + 1, answer: ['A', 'B', 'C', 'D'][index % 4] }));
const initialResults = [
  { id: 'omr-result-1', student: 'Aarav Sharma', rollNo: '01', exam: 'My Exam (JEE)', correct: 42, incorrect: 6, unanswered: 2, score: 162, percentage: 81, rank: 1 },
  { id: 'omr-result-2', student: 'Diya Nair', rollNo: '02', exam: 'My Exam (JEE)', correct: 38, incorrect: 9, unanswered: 3, score: 143, percentage: 71.5, rank: 2 },
];

let sessions = [initialSession];
let answerKeys = { [initialSession.id]: initialAnswerKey };
let results = initialResults;

const clone = (value) => JSON.parse(JSON.stringify(value));

export const omrApi = {
  async fetchOMRDashboard() { return { sessions: clone(sessions), results: clone(results) }; },
  async fetchOMRSessions() { return clone(sessions); },
  async createOMRSession(input) {
    const session = { ...input, id: `omr-session-${Date.now()}`, status: input.status || 'Draft', createdDate: new Date().toLocaleDateString('en-GB'), evaluated: 0, keys: 0 };
    sessions = [session, ...sessions];
    return clone(session);
  },
  async fetchAnswerKeys(examId) { return clone(answerKeys[examId] || []); },
  async saveAnswerKey(examId, key) { answerKeys[examId] = clone(key); return clone(key); },
  async scanOMRSheet(input) { return { ...clone(input), scanned: true, detectedAnswers: input.detectedAnswers || 10 }; },
  async evaluateOMRSheet(input) { return { ...clone(input), evaluated: true, score: 162, percentage: 81 }; },
  async fetchOMRResults() { return clone(results); },
  async publishOMRResults(examId) {
    sessions = sessions.map((session) => session.id === examId ? { ...session, status: 'Published' } : session);
    return clone(sessions.find((session) => session.id === examId));
  },
};
