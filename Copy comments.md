UPDATE your_table_name
SET attributes = jsonb_set(attributes, '{title}', 'null', false)
WHERE attributes ? 'title';



import psycopg2
import paramiko
from sshtunnel import SSHTunnelForwarder
import json

# SSH credentials
ssh_host = 'remote_host_ip'
ssh_port = 22
ssh_username = 'your_ssh_username'
ssh_password = 'your_ssh_password'

# PostgreSQL credentials for source database
src_db_host = 'database_host_ip'
src_db_port = 5432
src_db_name = 'source_database_name'
src_db_user = 'source_database_username'
src_db_password = 'source_database_password'
src_table_name = 'source_table_name'

# PostgreSQL credentials for destination database
dest_db_host = 'database_host_ip'
dest_db_port = 5432
dest_db_name = 'destination_database_name'
dest_db_user = 'destination_database_username'
dest_db_password = 'destination_database_password'
dest_table_name = 'destination_table_name'

# Connect to the SSH server
ssh_client = paramiko.SSHClient()
ssh_client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh_client.connect(ssh_host, ssh_port, ssh_username, ssh_password)

# Create an SSH tunnel to the source PostgreSQL server
with SSHTunnelForwarder(
        (ssh_host, ssh_port),
        ssh_username=ssh_username,
        ssh_password=ssh_password,
        remote_bind_address=(src_db_host, src_db_port)
) as src_tunnel:
    # Connect to the source PostgreSQL database via the SSH tunnel
    src_conn = psycopg2.connect(
        database=src_db_name,
        user=src_db_user,
        password=src_db_password,
        host='127.0.0.1',
        port=src_tunnel.local_bind_port
    )

    # Open a cursor to perform database operations on the source database
    src_cursor = src_conn.cursor()

    # Execute a query to fetch all data from the source table
    src_cursor.execute(f'SELECT * FROM {src_table_name};')

    # Fetch all rows from the source table
    rows = src_cursor.fetchall()

    # Close the cursor and connection to the source database
    src_cursor.close()
    src_conn.close()

# Close SSH connection
ssh_client.close()

# Connect to the destination PostgreSQL database
dest_conn = psycopg2.connect(
    database=dest_db_name,
    user=dest_db_user,
    password=dest_db_password,
    host=dest_db_host,
    port=dest_db_port
)

# Open a cursor to perform database operations on the destination database
dest_cursor = dest_conn.cursor()

# Define a function to transform the data
def transform_data(row):
    # Example transformation: Convert specified columns into JSONB format
    transformed_data = {
        'attributes': {
            'column1': row[0],
            'column2': row[1],
            # Add more columns as needed
        }
    }
    return json.dumps(transformed_data)

# Insert transformed data into the destination table
for row in rows:
    transformed_data = transform_data(row)
    dest_cursor.execute(f"INSERT INTO {dest_table_name} (json_column) VALUES (%s)", (transformed_data,))

# Commit the transaction and close cursor and connection to the destination database
dest_conn.commit()
dest_cursor.close()
dest_conn.close()
