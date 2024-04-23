import paramiko
import psycopg2
from psycopg2 import sql

def ssh_connect(hostname, port, username, password):
    """ Create SSH client and connect to the server """
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(hostname, username=username, password=password, port=port)
    return client

def connect_db_via_ssh(ssh_client, db_name, db_user, db_password, db_port=4432):
    """ Use SSH tunnel to connect to the PostgreSQL database """
    # Setting up SSH tunnel for forwarding
    tunnel = ssh_client.get_transport().open_channel(
        'direct-tcpip', ('localhost', db_port), ('127.0.0.1', 22))
    conn = psycopg2.connect(database=db_name, user=db_user, password=db_password, host='localhost', port=db_port, sslmode='disable', options='-c statement_timeout=30000')
    return conn

def update_column_defaults(conn):
    """ Update default values of 'updated_on' columns in all tables """
    cur = conn.cursor()
    try:
        # Retrieve all tables from the database
        cur.execute("""SELECT table_name FROM information_schema.tables WHERE table_schema='public'""")
        tables = cur.fetchall()

        for table in tables:
            table_name = table[0]
            # Check if 'updated_on' column exists
            cur.execute(sql.SQL("""SELECT column_name FROM information_schema.columns WHERE table_name = %s AND column_name = 'updated_on'"""), [table_name])
            result = cur.fetchone()
            if result:
                # Alter default value of 'updated_on' to current timestamp
                cur.execute(sql.SQL("""ALTER TABLE {} ALTER COLUMN updated_on SET DEFAULT CURRENT_TIMESTAMP""").format(sql.Identifier(table_name)))
        conn.commit()
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        cur.close()

def main():
    # SSH connection parameters
    ssh_hostname = 'example.com'
    ssh_port = 22
    ssh_username = 'user'
    ssh_password = 'password'

    # DB connection parameters
    db_name = 'CXODashboard_db_dev'
    db_user = 'AutoQlik'
    db_password = 'AutoClick'

    # Connect to SSH
    ssh_client = ssh_connect(ssh_hostname, ssh_port, ssh_username, ssh_password)
    try:
        # Connect to PostgreSQL through SSH
        db_conn = connect_db_via_ssh(ssh_client, db_name, db_user, db_password)
        # Update default values in tables
        update_column_defaults(db_conn)
    finally:
        db_conn.close()
        ssh_client.close()

if __name__ == "__main__":
    main()
