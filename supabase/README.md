# Database setup

1. Create a project at https://supabase.com.
2. In **SQL Editor**, run in order: `migrations/0001_init.sql`, `migrations/0002_rls.sql`, then `seed.sql` (fictional demo data only).
3. **Create the first admin securely**
   - Dashboard → Authentication → Users → *Add user* (set email + strong password, tick "Auto confirm").
   - Copy the user's UUID, then in SQL Editor (run by you, the project owner):
     ```sql
     update public.profiles
     set role = 'admin', display_name = 'Owner'
     where user_id = 'PASTE-USER-UUID-HERE';
     ```
   - There is no public endpoint or client policy that can set `role`. In Authentication → Providers → Email, **disable public sign-ups** so strangers can't create accounts at all.
4. Copy Project URL, anon key and service-role key into your env files (see `.env.example`). The service-role key is server-only.
