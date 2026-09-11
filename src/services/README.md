Attendance endpoints expected by the client:

- GET /attendance/summary?date=YYYY-MM-DD
- GET /attendance/daily?date=YYYY-MM-DD&search=...
- GET /attendance/monthly?month=YYYY-MM
- GET /attendance/history?from=YYYY-MM-DD&to=YYYY-MM-DD&search=...&status=...
- GET /attendance/biometric?date=YYYY-MM-DD&search=...
- POST /attendance/cutoff with { date }
- POST /attendance/submit with { records }
- GET /attendance/export?from=YYYY-MM-DD&to=YYYY-MM-DD&format=PDF|CSV|Excel
- GET /fees/summary
- GET /fees/pending
- GET /fees/transactions
- GET /exams/hall-tickets
- GET /exams/results
- GET /timetable

Set EXPO_PUBLIC_API_URL to the backend origin. The authenticated access token is sent as a Bearer token when the login flow supplies one.
