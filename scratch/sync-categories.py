import psycopg2

conn_str = "host=postgresql-curtispapa.alwaysdata.net port=5432 dbname=curtispapa_crm user=curtispapa password=!b8Tkx4Zs2_wF!H"

def sync():
    conn = psycopg2.connect(conn_str)
    cur = conn.cursor()

    # 1. Print vendor_categories columns
    print("=== vendor_categories Columns ===")
    cur.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'vendor_categories';")
    for r in cur.fetchall():
        print(f"Col: {r[0]:20} | Type: {r[1]}")

    # 2. Fetch all rows from vendor_categories
    cur.execute('SELECT id, name, description, is_active, tenant_id FROM vendor_categories;')
    v_cats = cur.fetchall()
    print(f"\nFetched {len(v_cats)} categories from vendor_categories.")

    # 3. Insert them into expense_categories
    print("\nSyncing categories to expense_categories...")
    synced = 0
    for vc in v_cats:
        v_id, v_name, v_desc, v_active, v_tenant = vc
        
        # Check if already exists in expense_categories
        cur.execute('SELECT 1 FROM expense_categories WHERE "Id" = %s;', (v_id,))
        exists = cur.fetchone()
        
        if not exists:
            cur.execute("""
                INSERT INTO expense_categories ("Id", "Name", "Description", "IsActive", "TenantId")
                VALUES (%s, %s, %s, %s, %s);
            """, (v_id, v_name, v_desc or '', v_active if v_active is not None else True, v_tenant or 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'))
            synced += 1
            
    conn.commit()
    print(f"Successfully synced {synced} new categories to expense_categories.")

    # Print final rows in expense_categories
    print("\n=== Current expense_categories Rows ===")
    cur.execute('SELECT "Id", "Name" FROM expense_categories;')
    for r in cur.fetchall():
        print(r)

    cur.close()
    conn.close()

if __name__ == '__main__':
    sync()
