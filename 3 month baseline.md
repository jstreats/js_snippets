import paramiko
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def run_ssh_command(ssh_client, command):
    stdin, stdout, stderr = ssh_client.exec_command(command)
    return stdout.read().decode('utf-8'), stderr.read().decode('utf-8')

def connect_to_db(host, database, user, password):
    conn_str = f"dbname='{database}' user='{user}' host='{host}' password='{password}'"
    conn = psycopg2.connect(conn_str)
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    return conn

def export_db(ssh_client, db_name, export_file_path):
    command = f"pg_dump {db_name} > {export_file_path}"
    stdout, stderr = run_ssh_command(ssh_client, command)
    if stderr:
        raise Exception(f"Error exporting database: {stderr}")
    print(f"Database {db_name} exported to {export_file_path}")

def import_db(ssh_client, db_name, file_path, target_host, target_port, target_user, target_password):
    # If importing to a database on a different server, establish a new SSH connection
    if target_host != 'localhost':
        target_ssh_client = paramiko.SSHClient()
        target_ssh_client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        target_ssh_client.connect(target_host, port=target_port, username=target_user, password=target_password)
    else:
        target_ssh_client = ssh_client
    
    command = f"psql -d {db_name} -f {file_path}"
    stdout, stderr = run_ssh_command(target_ssh_client, command)
    if stderr:
        raise Exception(f"Error importing database: {stderr}")
    print(f"Database imported from {file_path} to {db_name}")

    if target_host != 'localhost':
        target_ssh_client.close()

def create_database(conn, db_name):
    cur = conn.cursor()
    cur.execute(f"CREATE DATABASE {db_name};")
    print(f"Database {db_name} created")

def main():
    # Source server SSH and database credentials
    source_ssh_host = 'your_source_server_ip'
    source_ssh_port = 22
    source_ssh_user = 'your_source_ssh_username'
    source_ssh_password = 'your_source_ssh_password'
    source_db_host = 'localhost'
    source_db_user = 'your_source_db_username'
    source_db_password = 'your_source_db_password'
    source_db = 'source_db_name'
    
    # Target server SSH and database credentials (could be the same as source)
    target_ssh_host = 'your_target_server_ip'  # Use 'localhost' if the same server
    target_ssh_port = 22
    target_ssh_user = 'your_target_ssh_username'
    target_ssh_password = 'your_target_ssh_password'
    target_db_host = 'your_target_db_host'  # Use 'localhost' if the same server
    target_db_user = 'your_target_db_username'
    target_db_password = 'your_target_db_password'
    target_db = 'target_db_name'
    
    export_file_path = '/path/to/exported_db.sql'
    
    # Establish SSH connection to source server
    ssh_client = paramiko.SSHClient()
    ssh_client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh_client.connect(source_ssh_host, port=source_ssh_port, username=source_ssh_user, password=source_ssh_password)
    
    # Export database from source
    export_db(ssh_client, source_db, export_file_path)
    
    # Connect to target PostgreSQL if different, and optionally create a new database
    if target_db_host != source_db_host or target_db != source_db:
        target_conn = connect_to_db(target_db_host, target_db, target_db_user, target_db_password)
        create_database(target_conn, target_db)
        target_conn.close()
    
    # Import database to target
    import_db(ssh_client, target_db, export_file_path, target_ssh_host, target_ssh_port, target_ssh_user, target_ssh_password)
    
    # Clean up
    ssh_client.close()
    
if __name__ == "__main__":
    main()
