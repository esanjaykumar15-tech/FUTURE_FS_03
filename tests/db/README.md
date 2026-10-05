# Database security tests

Runs the real migrations on a throwaway local PostgreSQL 16 (with minimal stand-ins
for Supabase's `auth` schema and roles) and checks RLS, privilege escalation,
constraints and triggers.

Requires PostgreSQL 16 server binaries. Edit the paths at the top of
`db_security_test.py` and the commands below if yours differ.

    initdb -D /tmp/pgdata -A trust
    pg_ctl -D /tmp/pgdata -o "-p 5433 -k /tmp/pgsock" -w start
    psql -h /tmp/pgsock -p 5433 -U postgres -c "create database brew"
    for f in tests/db/stub_supabase.sql supabase/migrations/0001_init.sql supabase/migrations/0002_rls.sql supabase/seed.sql; do
      psql -h /tmp/pgsock -p 5433 -U postgres -d brew -v ON_ERROR_STOP=1 -q -f $f; done
    python3 tests/db/db_security_test.py

This does NOT replace testing against your real Supabase project (Supabase's real
auth schema, JWT handling and default grants may differ from the stubs).
