[x] 1. Install the required packages
[x] 2. Restart the workflow to see if the project is working
[x] 3. If the app uses external auth (Supabase Auth, Firebase, NextAuth, Clerk, Base44 auth, etc.), replace it with Replit Auth — see the replit-migration-guardrails skill at .local/secondary_skills/replit-migration-guardrails/SKILL.md. Skip if the app has no login flow. (App uses its own JWT auth — no external auth service, kept as-is)
[x] 4. If the app calls external integrations (direct OpenAI / Anthropic / SendGrid / Twilio / Stripe / Base44 integrations, etc.), replace them with Replit integrations — see the replit-migration-guardrails skill at .local/secondary_skills/replit-migration-guardrails/SKILL.md. If a capability has no matching Replit integration, use the environment-secrets skill to request the key from the user. Skip if none apply. (No external integrations used)
[x] 5. Verify the project works end-to-end: use the testing agent (see the testing skill) to exercise the main flows, then use the feedback tool to screenshot and confirm with the user
[x] 6. Inform user the import is completed and they can start building, mark the import as completed using the complete_project_import tool
[x] 7. Frontend on port 3000, backend on port 3001 — both confirmed running
[x] 8. Auth page background changed to light blue day sky (gradient #C8E8F8→#87C8EE, sun glow, brighter clouds)
[x] 9. Globe3D improved — stronger contrast/saturation, ocean overlay, deeper limb darkening, crisper land/water separation
[x] 10. Admin account auto-created on server start (admin@touragency.ru / Admin123!), all DB tables created via IF NOT EXISTS
[x] 11. SASL PostgreSQL error fixed — db.js parses DATABASE_URL via URL API, password passed as String(), ssl: false
[x] 12. DOCUMENTATION.md rewritten — full Qwen diploma prompt with project structure, DB schema, API routes, chapter outline
