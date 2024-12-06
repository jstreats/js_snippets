import os
import psycopg2
from psycopg2 import sql
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Retrieve environment variables
PG_HOST = os.getenv("PG_HOST")
PG_PORT = os.getenv("PG_PORT")
PG_DATABASE = os.getenv("PG_DATABASE")
PG_USER = os.getenv("PG_USER")
PG_PASSWORD = os.getenv("PG_PASSWORD")

# List of tables to export
TABLES = ["table1", "table2", "table3"]  # Replace with your table names

def get_table_columns(cur, table_name):
    """
    Retrieves column names, types, and nullability for the given table 
    using PostgreSQL information_schema.
    """
    query = """
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = %s
    ORDER BY ordinal_position;
    """
    cur.execute(query, (table_name,))
    return cur.fetchall()

def generate_create_table_statement(table_name, columns_info):
    """
    Generate a CREATE TABLE IF NOT EXISTS statement based on the columns retrieved.
    Note: This is a simplified version and may need adjustments for complex types (e.g. arrays, enums).
    """
    cols_definitions = []
    for col_name, data_type, is_nullable in columns_info:
        # Map generic data types if necessary.
        # The data_type from information_schema is more descriptive (e.g. "integer", "character varying", etc.)
        # For a direct copy, we'll trust the data_type as returned.
        
        # Handle nullability
        null_clause = "NOT NULL" if is_nullable == "NO" else ""
        
        # In a real scenario, you may also want to retrieve default values and primary keys constraints.
        # For simplicity, this only handles the bare schema.
        cols_definitions.append(f'"{col_name}" {data_type} {null_clause}'.strip())
        
    cols_str = ",\n    ".join(cols_definitions)
    create_stmt = f'CREATE TABLE IF NOT EXISTS "{table_name}" (\n    {cols_str}\n);\n\n'
    return create_stmt

def get_table_data(cur, table_name):
    """
    Fetch all rows from the given table.
    """
    cur.execute(sql.SQL("SELECT * FROM {}").format(sql.Identifier('public', table_name)))
    rows = cur.fetchall()
    colnames = [desc[0] for desc in cur.description]
    return colnames, rows

def generate_insert_statements(table_name, colnames, rows):
    """
    Given column names and rows, generate INSERT statements.
    Properly quote strings and handle NULL values.
    """
    inserts = []
    for row in rows:
        values_list = []
        for val in row:
            if val is None:
                values_list.append("NULL")
            elif isinstance(val, str):
                # Escape single quotes in strings
                safe_val = val.replace("'", "''")
                values_list.append(f"'{safe_val}'")
            else:
                # For numeric or boolean or other primitive types
                values_list.append(str(val))
                
        values_str = ", ".join(values_list)
        colnames_str = ", ".join(f'"{col}"' for col in colnames)
        insert_stmt = f'INSERT INTO "{table_name}" ({colnames_str}) VALUES ({values_str});\n'
        inserts.append(insert_stmt)
    return inserts

def main():
    # Connect to the database
    conn = psycopg2.connect(
        host=PG_HOST,
        port=PG_PORT,
        dbname=PG_DATABASE,
        user=PG_USER,
        password=PG_PASSWORD
    )
    cur = conn.cursor()

    # Open the file for writing SQL
    with open("output.sql", "w", encoding="utf-8") as f:
        for table_name in TABLES:
            # Get schema info
            columns_info = get_table_columns(cur, table_name)
            create_stmt = generate_create_table_statement(table_name, columns_info)
            f.write(create_stmt)

            # Get data from source
            colnames, rows = get_table_data(cur, table_name)
            insert_stmts = generate_insert_statements(table_name, colnames, rows)
            for stmt in insert_stmts:
                f.write(stmt)
            f.write("\n")

    cur.close()
    conn.close()

if __name__ == "__main__":
    main()
