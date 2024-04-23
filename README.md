import paramiko
import psycopg2
from psycopg2 import sql

# SSH connection details
ssh_hostname = 'your_server_ip_or_hostname'
ssh_username = 'SVC-QSDEVOPS-DEV'
ssh_password = 'bfNb5C6EqoL491'

# Database connection details
db_name = 'CXODashboard_db_dev'
db_user = 'AutoQlik'
db_password = 'AutoClick'
db_host = 'localhost'  # localhost since we are already connected via SSH
db_port = '4432'

def create_ssh_tunnel():
    # Create an SSH client
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(ssh_hostname, username=ssh_username, password=ssh_password)
    return client

def connect_database():
    conn = psycopg2.connect(
        dbname=db_name,
        user=db_user,
        password=db_password,
        host=db_host,
        port=db_port
    )
    return conn

def update_tables_default(conn):
    with conn.cursor() as cursor:
        cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")
        tables = cursor.fetchall()

        for (table,) in tables:
            cursor.execute(
                sql.SQL("SELECT column_name FROM information_schema.columns WHERE table_name = %s AND column_name = 'updated_on'"),
                [table]
            )
            result = cursor.fetchone()
            if result:
                # Modify the default value of 'updated_on'
                query = sql.SQL("ALTER TABLE {} ALTER COLUMN updated_on SET DEFAULT CURRENT_TIMESTAMP").format(sql.Identifier(table))
                cursor.execute(query)
                print(f"Updated default value for 'updated_on' in {table}")

    conn.commit()

def main():
    client = create_ssh_tunnel()
    print("SSH connection established.")

    try:
        conn = connect_database()
        print("Database connection established.")
        
        update_tables_default(conn)
        print("Tables updated successfully.")

    finally:
        conn.close()
        client.close()

if __name__ == '__main__':
    main()
