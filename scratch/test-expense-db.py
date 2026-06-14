import psycopg2

conn_str = "host=postgresql-curtispapa.alwaysdata.net port=5432 dbname=curtispapa_crm user=curtispapa password=!b8Tkx4Zs2_wF!H"

def run_insert():
    conn = psycopg2.connect(conn_str)
    cur = conn.cursor()
    
    # Let's get a valid category ID from vendor-categories table
    cur.execute('SELECT id, name FROM vendor_categories LIMIT 1;')
    cat = cur.fetchone()
    print("Found category:", cat)
    if not cat:
        print("No categories found in vendor_categories!")
        return
    cat_id = cat[0]

    # Let's try inserting with correct PascalCase column names
    print("\nAttempting insert with PascalCase column names...")
    try:
        cur.execute(f"""
            INSERT INTO expenses (
                "Id", 
                "Amount", 
                "Status", 
                "TenantId", 
                "CreatedAt", 
                "UpdatedAt", 
                "CategoryId", 
                "ExpenseDate", 
                "Currency", 
                "Description", 
                "ExpenseNumber"
            ) VALUES (
                'e0000000-0000-0000-0000-000000000009',
                150.00,
                0, -- Status (Draft)
                'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', -- TenantId
                NOW(),
                NOW(),
                '{cat_id}',
                NOW(),
                'GHS',
                'Direct SQL insert test',
                'EXP-TEST-99'
            );
        """)
        conn.commit()
        print("Success! Inserted test expense directly.")
        
        # Let's delete it so we don't pollute the db
        cur.execute('DELETE FROM expenses WHERE "Id" = \'e0000000-0000-0000-0000-000000000009\';')
        conn.commit()
        print("Cleaned up test expense.")
    except Exception as e:
        print("Insert failed with database error:", e)
        conn.rollback()

    cur.close()
    conn.close()

if __name__ == '__main__':
    run_insert()
