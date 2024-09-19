import psycopg2
from psycopg2 import sql

# PostgreSQL connection details
db_config = {
    'dbname': 'CXODashboard_db_dev',
    'user': 'AutoQlik',
    'password': 'AutoClick',
    'host': 'localhost',
    'port': '4432'
}

# List of strings to search
search_strings = ["example_string1", "example_string2", "example_string3"]

# Connect to PostgreSQL
def connect_db():
    try:
        conn = psycopg2.connect(**db_config)
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None

# Function to generate the UPDATE query
def generate_update_query(table_name, column_name, old_value, new_value, primary_key, primary_key_value):
    query = f"UPDATE {table_name} SET {column_name} = REPLACE({column_name}, '{old_value}', '{new_value}') WHERE {primary_key} = {primary_key_value};"
    return query

# Main function to search for strings in all tables
def search_strings_in_db(conn, search_strings):
    try:
        cur = conn.cursor()
        # Query to get all tables
        cur.execute("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
        """)
        tables = cur.fetchall()

        for table in tables:
            table_name = table[0]
            # Query to get all columns for the current table
            cur.execute(sql.SQL("""
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = %s
            """), [table_name])
            columns = cur.fetchall()

            for column in columns:
                column_name = column[0]
                for search_string in search_strings:
                    # Query to check if the column contains the search string
                    cur.execute(sql.SQL("""
                        SELECT {primary_key}, {column_name}
                        FROM {table_name}
                        WHERE {column_name} LIKE %s
                    """).format(
                        table_name=sql.Identifier(table_name),
                        column_name=sql.Identifier(column_name),
                        primary_key=sql.Identifier('id')  # Assuming 'id' as the primary key column, update as needed
                    ), [f'%{search_string}%'])

                    rows = cur.fetchall()
                    if rows:
                        for row in rows:
                            primary_key_value = row[0]  # Assuming 'id' is the first column
                            print(f"Found '{search_string}' in table '{table_name}', column '{column_name}'")

                            # Example: Generating an update query to replace the old string
                            new_string = "new_value"  # Replace with your actual new value
                            update_query = generate_update_query(table_name, column_name, search_string, new_string, 'id', primary_key_value)
                            print(update_query)
    except Exception as e:
        print(f"Error: {e}")
    finally:
        cur.close()

# Run the script
if __name__ == "__main__":
    conn = connect_db()
    if conn:
        search_strings_in_db(conn, search_strings)
        conn.close()