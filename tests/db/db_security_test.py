import subprocess, uuid
PSQL = ["/usr/lib/postgresql/16/bin/psql","-X","-h","/tmp/pgsock","-p","5433","-U","postgres","-d","brew","-tA","-q"]
def run(sql, role=None, sub=None):
    pre = ""
    if role: pre += f"set role {role};"
    if sub: pre += f"select set_config('request.jwt.claim.sub','{sub}',false);"
    r = subprocess.run(PSQL+["-c", pre+sql], capture_output=True, text=True)
    return r.returncode, (r.stdout + r.stderr).strip()
passed = failed = 0
def check(name, cond, detail=""):
    global passed, failed
    if cond: passed += 1; print("PASS", name)
    else: failed += 1; print("FAIL", name, "->", detail)
def denied(name, sql, role=None, sub=None, needle=None):
    rc, out = run(sql, role, sub)
    check(name, rc != 0 and (needle is None or needle in out), out[:160])
def ok(name, sql, role=None, sub=None, expect=None):
    rc, out = run(sql, role, sub)
    check(name, rc == 0 and (expect is None or out.splitlines()[-1] == expect), out[:160])

run("truncate reservations, enquiries; delete from auth.users;")
cust, adm = str(uuid.uuid4()), str(uuid.uuid4())
run(f"insert into auth.users(id,email) values ('{cust}','c@x.com'),('{adm}','a@x.com');")

# --- profiles / privilege escalation ---
ok("new users get a profile with role=customer", f"select count(*) from profiles where role='customer' and user_id in ('{cust}','{adm}')", expect="2")
rc,out = run(f"update profiles set role='admin' where user_id='{cust}'; select role from profiles where user_id='{cust}'", "authenticated", cust)
check("customer CANNOT self-promote to admin via update", out.splitlines()[-1] == "customer", out)
denied("customer cannot insert an admin profile", f"insert into profiles(user_id,role) values (gen_random_uuid(),'admin')", "authenticated", cust)
ok("customer sees only their own profile", "select count(*) from profiles", "authenticated", cust, expect="1")
denied("anon cannot read profiles", "select * from profiles", "anon", None, "permission denied")
denied("role check constraint rejects 'superuser'", "update profiles set role='superuser'", None, None, "violates check")

# --- public (anon) access ---
ok("anon sees only AVAILABLE menu items (12 of 13)", "select count(*) from menu_items", "anon", expect="12")
denied("anon cannot insert menu items", "insert into menu_items(name,category,price) values ('x','Tea',1)", "anon", None, "permission denied")
denied("anon cannot update menu items", "update menu_items set price=0", "anon", None, "permission denied")
denied("anon cannot read reservations", "select * from reservations", "anon", None, "permission denied")
denied("anon cannot insert reservations directly", "insert into reservations(customer_name,phone,booking_date,booking_time,party_size) values ('Jo','5551234567','2030-01-01','10:00',2)", "anon", None, "permission denied")
denied("anon cannot read enquiries", "select * from enquiries", "anon", None, "permission denied")

# --- non-admin authenticated user ---
ok("customer sees 12 available menu items only", "select count(*) from menu_items", "authenticated", cust, expect="12")
rc,out = run("insert into menu_items(name,category,price) values ('Hack','Tea',1)", "authenticated", cust)
check("customer cannot create menu items (RLS)", rc != 0 and "row-level security" in out, out)
run("insert into reservations(customer_name,phone,booking_date,booking_time,party_size) values ('Jane Doe','5551234567','2030-01-01','10:00',2)")
ok("customer sees zero reservations", "select count(*) from reservations", "authenticated", cust, expect="0")
denied("customer cannot insert reservations directly (RLS)", "insert into reservations(customer_name,phone,booking_date,booking_time,party_size) values ('Jo','5551234567','2030-02-01','10:00',2)", "authenticated", cust, "row-level security")
ok("customer sees zero enquiries", "select count(*) from enquiries", "authenticated", cust, expect="0")

# --- admin (promoted only by superuser SQL) ---
run(f"update profiles set role='admin' where user_id='{adm}'")
ok("admin sees all 13 menu items incl. unavailable", "select count(*) from menu_items", "authenticated", adm, expect="13")
ok("admin can read reservations", "select count(*) from reservations", "authenticated", adm, expect="1")
ok("admin can create menu items", "insert into menu_items(name,category,price) values ('Mocha','Hot Coffee',4.75)", "authenticated", adm)
ok("admin can update reservation status", "update reservations set status='confirmed' where customer_name='Jane Doe'", "authenticated", adm)
ok("admin can delete menu items", "delete from menu_items where name='Mocha'", "authenticated", adm)

# --- service role (what the Express API uses) ---
ok("service_role bypasses RLS: reads all reservations", "select count(*) from reservations", "service_role", expect="1")

# --- constraints (as superuser to isolate CHECK/UNIQUE from RLS) ---
R = "insert into reservations(customer_name,phone,booking_date,booking_time,party_size,status) values "
denied("reject party size 0", R+"('Jo Bo','5551234567','2031-01-01','10:00',0,'pending')", needle="violates check")
denied("reject party size 21", R+"('Jo Bo','5551234567','2031-01-01','10:00',21,'pending')", needle="violates check")
denied("reject letters in phone", R+"('Jo Bo','abc','2031-01-01','10:00',2,'pending')", needle="violates check")
denied("reject 1-char name", R+"('J','5551234567','2031-01-01','10:00',2,'pending')", needle="violates check")
denied("reject invalid status", R+"('Jo Bo','5551234567','2031-01-01','10:00',2,'approved')", needle="violates check")
denied("reject DUPLICATE phone+date+time", R+"('Jane Doe','5551234567','2030-01-01','10:00',2,'pending')", needle="reservations_no_duplicate")
ok("default status is pending", "insert into reservations(customer_name,phone,booking_date,booking_time,party_size) values ('Pat Lee','5559998888','2031-03-03','11:00',2) returning status", expect="pending")
M = "insert into menu_items(name,category,price,image_url) values "
denied("reject negative price", M+"('x','Tea',-1,null)", needle="violates check")
denied("reject unknown category", M+"('x','Pizza',1,null)", needle="violates check")
denied("reject non-http image url", M+"('x','Tea',1,'javascript:alert(1)')", needle="violates check")
denied("reject price over cap", M+"('x','Tea',999999,null)", needle="violates check")
E = "insert into enquiries(name,email,message) values "
denied("reject bad email", E+"('Sam','nope','hello there')", needle="violates check")
denied("reject too-short message", E+"('Sam','s@x.com','hi')", needle="violates check")
denied("reject >2000 char message", E+f"('Sam','s@x.com','{'x'*2001}')", needle="violates check")
ok("enquiry defaults to status new", E+"('Sam','s@x.com','hello there') returning status", expect="new")

# --- updated_at trigger ---
run("update menu_items set updated_at = now() - interval '1 day' where name='Cold Brew'")
ok("updated_at trigger refreshes on update", "update menu_items set price=5 where name='Cold Brew' returning updated_at > now() - interval '1 minute'", expect="t")

# ---- precise re-check of the 2 ambiguous cases (count affected rows, then verify data as superuser) ----
print("\n-- precise re-check --")
before_price = run("select price from menu_items where name='Cold Brew'")[1]
rc,out = run("with u as (update menu_items set price=0 returning 1) select count(*) from u", "authenticated", cust)
check("customer update on menu_items affects 0 rows", rc == 0 and out.splitlines()[-1] == "0", out)
check("menu price unchanged in DB", run("select price from menu_items where name='Cold Brew'")[1] == before_price)

rc,out = run("with u as (update profiles set role='customer' where user_id=auth.uid() returning 1) select count(*) from u", "authenticated", adm)
check("admin update on own profile via client affects 0 rows", rc == 0 and out.splitlines()[-1] == "0", out)
rc,out = run(f"with u as (update profiles set role='admin' where user_id='{cust}' returning 1) select count(*) from u", "authenticated", cust)
check("customer self-promotion affects 0 rows", rc == 0 and out.splitlines()[-1] == "0", out)
check("roles unchanged in DB (adm=admin, cust=customer)", run(f"select string_agg(role, ',' order by role) from profiles where user_id in ('{adm}','{cust}')")[1] == "admin,customer")
print(f"\n{passed} passed, {failed} failed")
raise SystemExit(1 if failed else 0)
