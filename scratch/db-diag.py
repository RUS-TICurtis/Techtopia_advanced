import psycopg2

conn_str = "host=postgresql-curtispapa.alwaysdata.net port=5432 dbname=curtispapa_crm user=curtispapa password=!b8Tkx4Zs2_wF!H"

def check():
    conn = psycopg2.connect(conn_str)
    cur = conn.cursor()
    
    # 1. Query columns and constraints of the budgets table
    print("=== Budgets Table Columns ===")
    cur.execute("""
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'budgets';
    """)
    cols = cur.fetchall()
    for col in cols:
        print(f"Column: {col[0]:25} | Type: {col[1]:15} | Nullable: {col[2]:5} | Default: {col[3]}")

    # 2. Try to insert a budget directly using psycopg2 to see what constraint is failing
    print("\n=== Direct Insert Attempt ===")
    try:
        cur.execute("""
            INSERT INTO budgets (
                id, name, description, type, start_date, end_date,
                total_amount, allocated_amount, consumed_amount, remaining_amount,
                status, tenant_id, created_at, updated_at
            ) VALUES (
                'b0000000-0000-0000-0000-000000000001',
                'Diagnostic Budget Q3',
                'Direct SQL insert test',
                'Quarterly', -- Type
                NOW(),
                NOW(),
                50000.00,
                0, -- allocated_amount
                0, -- consumed_amount
                50000.00, -- remaining_amount
                'Draft', -- status
                'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', -- tenant_id
                NOW(),
                NOW()
            )
        """)
        conn.commit()
        print("Insert succeeded direct!")
        
        # Cleanup
        cur.execute("DELETE FROM budgets WHERE id = 'b0000000-0000-0000-0000-000000000001';")
        conn.commit()
        print("Cleaned up test budget.")
    except Exception as e:
        print("Insert failed with error:", e)
        conn.rollback()

    cur.close()
    conn.close()

if __name__ == '__main__':
    check()
