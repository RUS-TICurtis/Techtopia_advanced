import psycopg2

conn_str = "host=postgresql-curtispapa.alwaysdata.net port=5432 dbname=curtispapa_crm user=curtispapa password=!b8Tkx4Zs2_wF!H"

def check():
    conn = psycopg2.connect(conn_str)
    cur = conn.cursor()

    # 1. Query all indexes on the budgets table
    print("=== Budgets Table Indexes ===")
    cur.execute("""
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename = 'budgets';
    """)
    for r in cur.fetchall():
        print(f"Index: {r[0]:25} | Def: {r[1]}")

    # 2. Query any existing rows in the budgets table
    print("\n=== Existing Budgets ===")
    cur.execute('SELECT id, name, budget_code, total_amount FROM budgets;')
    for r in cur.fetchall():
        print(r)

    cur.close()
    conn.close()

if __name__ == '__main__':
    check()
