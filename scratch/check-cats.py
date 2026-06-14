import psycopg2

conn_str = "host=postgresql-curtispapa.alwaysdata.net port=5432 dbname=curtispapa_crm user=curtispapa password=!b8Tkx4Zs2_wF!H"

def check():
    conn = psycopg2.connect(conn_str)
    cur = conn.cursor()

    # 1. Query expense_categories columns and rows
    print("=== expense_categories Columns ===")
    cur.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'expense_categories';")
    for r in cur.fetchall():
        print(f"Col: {r[0]:20} | Type: {r[1]}")

    print("\n=== expense_categories Rows ===")
    cur.execute('SELECT * FROM "expense_categories";')
    rows = cur.fetchall()
    for row in rows:
        print(row)

    # 2. Query vendor_categories rows
    print("\n=== vendor_categories Rows ===")
    cur.execute('SELECT id, name FROM "vendor_categories";')
    rows = cur.fetchall()
    for row in rows:
        print(row)

    cur.close()
    conn.close()

if __name__ == '__main__':
    check()
