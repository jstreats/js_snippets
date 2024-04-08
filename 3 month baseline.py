import psycopg2
from psycopg2 import extras

# Database connection parameters
params = {
    'dbname': 'your_db_name',
    'user': 'your_user_name',
    'password': 'your_password',
    'host': 'your_host',
    'port': 'your_port',
    'sslmode': 'require',  # This enables SSL
}

# Tables and SL values to process
tables = ['table1', 'table2', 'table3']  # Add your table names here

try:
    # Connect to your database
    conn = psycopg2.connect(**params)
    conn.autocommit = True
    cursor = conn.cursor()

    for table in tables:
        # Retrieve distinct 'sl' values for the table, excluding 'CTO'
        cursor.execute(f"SELECT DISTINCT sl FROM {table} WHERE sl <> 'CTO'")
        sl_values = cursor.fetchall()

        for sl_value in sl_values:
            sl_value = sl_value[0]  # Unpack the tuple
            # Calculate the average count for Jan, Feb, and Mar 2024 for each 'sl'
            cursor.execute(f"""
                SELECT AVG(count) FROM {table}
                WHERE 
                    month_year IN ('Jan-24', 'Feb-24', 'Mar-24') 
                    AND sl = %s;
            """, (sl_value,))
            avg_count = cursor.fetchone()[0]

            if avg_count is not None:
                # Insert the calculated average for each 'sl'
                cursor.execute(f"""
                    INSERT INTO {table} (gbgf, sl, month_year, count, updated_on)
                    VALUES (%s, %s, 'baseline-2023', %s, CURRENT_DATE)
                """, ('your_gbgf_value', sl_value, avg_count))  # Adjust 'your_gbgf_value' as necessary

                print(f"Average count for SL={sl_value} inserted successfully into {table}.")
            else:
                print(f"No data found for SL={sl_value} in {table}.")

except (Exception, psycopg2.DatabaseError) as error:
    print(error)
finally:
    if conn is not None:
        conn.close()
