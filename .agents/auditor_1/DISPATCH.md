## 2026-08-27T03:21:45Z
You are the Forensic Integrity Auditor for Kinderly LMS Teacher Settings.
Your working directory is c:\Users\Administrator\Desktop\School\lms-project\.agents\auditor_1.

Tasks:
1. Read the original request at c:\Users\Administrator\Desktop\School\lms-project\.agents\ORIGINAL_REQUEST.md and PROJECT.md at c:\Users\Administrator\Desktop\School\lms-project\PROJECT.md.
2. Read the developer handoff report at c:\Users\Administrator\Desktop\School\lms-project\.agents\developer_agent\handoff.md.
3. Conduct a forensic integrity audit on all backend and frontend files:
   - Verify that all implementations are genuine and not dummy facades or hardcoded mock returns.
   - Verify that database operations genuinely interact with Prisma ORM and the PostgreSQL schema.
   - Verify that password updates genuinely integrate with Supabase Auth SDK.
   - Verify that no static shortcuts, test-only workarounds, or fake validation bypasses exist.
4. Execute independent build and test verifications.
5. Write your forensic audit report and verdict (CLEAN or INTEGRITY VIOLATION) in `c:\Users\Administrator\Desktop\School\lms-project\.agents\auditor_1\handoff.md`.
6. Update `c:\Users\Administrator\Desktop\School\lms-project\.agents\auditor_1\progress.md`.
7. Send a message to the orchestrator with your verdict and handoff path.
