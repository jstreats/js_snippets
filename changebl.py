import paramiko
from sshtunnel import SSHTunnelForwarder
import psycopg2

# SSH and database configuration settings
SSH_HOST = 'your.ssh.host'
SSH_USERNAME = 'your_ssh_username'
SSH_PASSWORD = 'your_ssh_password'
DB_USER = 'your_db_user'
DB_PASSWORD = 'your_db_password'
DB_NAME = 'your_db_name'

# Set up SSH tunnel
def create_ssh_tunnel():
    try:
        tunnel = SSHTunnelForwarder(
            (SSH_HOST, 22),
            ssh_username=SSH_USERNAME,
            ssh_password=SSH_PASSWORD,
            remote_bind_address=('localhost', 5432)
        )
        tunnel.start()
        return tunnel
    except Exception as e:
        print(f"Error creating SSH tunnel: {e}")
        return None

# Connect to the PostgreSQL database
def connect_db(tunnel):
    try:
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host='localhost',
            port=tunnel.local_bind_port
        )
        return conn
    except psycopg2.Error as e:
        print(f"Error connecting to PostgreSQL: {e}")
        return None

# Execute SQL commands
def execute_sql_commands(conn):
    try:
        with conn.cursor() as cur:
            # Delete rows with 'baseline-2023' except 'CTO'
            cur.execute("""
                DELETE FROM your_table_name
                WHERE month_year = 'baseline-2023' AND sl != 'CTO'
            """)
            conn.commit()

            # Get counts for each 'sl' where 'month_year' is 'Mar-2024'
            cur.execute("""
                SELECT sl, COUNT(*)
                FROM your_table_name
                WHERE month_year = 'Mar-2024'
                GROUP BY sl
            """)
            counts = cur.fetchall()

            # Insert counts into the database with 'baseline-2024'
            for sl, count in counts:
                cur.execute("""
                    INSERT INTO your_table_name (sl, month_year, count)
                    VALUES (%s, 'baseline-2024', %s)
                """, (sl, count))
            conn.commit()

    except psycopg2.Error as e:
        print(f"Error executing SQL commands: {e}")

def main():
    tunnel = create_ssh_tunnel()
    if tunnel:
        conn = connect_db(tunnel)
        if conn:
            execute_sql_commands(conn)
            conn.close()
        tunnel.stop()

if __name__ == '__main__':
    main()
