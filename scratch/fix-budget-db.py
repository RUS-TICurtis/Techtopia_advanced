import psycopg2

conn_str = "host=postgresql-curtispapa.alwaysdata.net port=5432 dbname=curtispapa_crm user=curtispapa password=!b8Tkx4Zs2_wF!H"

def fix():
    conn = psycopg2.connect(conn_str)
    cur = conn.cursor()

    print("Altering budgets table constraints...")
    try:
        # 1. Add default values for created_at and updated_at
        cur.execute('ALTER TABLE budgets ALTER COLUMN created_at SET DEFAULT NOW();')
        cur.execute('ALTER TABLE budgets ALTER COLUMN updated_at SET DEFAULT NOW();')
        
        # 2. Add default value for tenant_id
        cur.execute("ALTER TABLE budgets ALTER COLUMN tenant_id SET DEFAULT 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid;")
        
        # 3. Add default value for id (generate_random_uuid) if needed
        cur.execute("ALTER TABLE budgets ALTER COLUMN id SET DEFAULT gen_random_uuid();")
        
        conn.commit()
        print("Successfully altered budgets table default values!")
    except Exception as e:
        print("Failed to alter budgets table:", e)
        conn.rollback()

    cur.close()
    conn.close()

if __name__ == '__main__':
    fix()
