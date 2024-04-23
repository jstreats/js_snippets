import paramiko

def create_ssh_client(server, port, user, password):
    """ Establish an SSH connection to the server """
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(server, port=port, username=user, password=password)
    return client

def execute_sql_commands(ssh_client):
    """ Execute SQL commands on the remote server via SSH """
    db_name = 'CXODashboard_db_dev'
    db_user = 'AutoQlik'
    db_password = 'AutoClick'
    db_port = '4432'

    # SQL command to find tables with 'updated_on' column and set its default
    sql_command = """
    psql -U {user} -d {database} -p {port} -c \\
    "SELECT table_name FROM information_schema.tables WHERE table_schema='public'" | while read tblname; do \\
        psql -U {user} -d {database} -p {port} -c \\
        "SELECT column_name FROM information_schema.columns WHERE table_name='\$tblname' AND column_name='updated_on'" | if [ \$? -eq 0 ]; then \\
            psql -U {user} -d {database} -p {port} -c \\
            "ALTER TABLE '\$tblname' ALTER COLUMN updated_on SET DEFAULT CURRENT_TIMESTAMP"; \\
        fi \\
    done
    """.format(user=db_user, database=db_name, port=db_port)

    # Execute the SQL command on the server
    stdin, stdout, stderr = ssh_client.exec_command(sql_command)
    print(stdout.read().decode())
    print(stderr.read().decode())

def main():
    ssh_server = 'example.com'
    ssh_port = 22
    ssh_user = 'SVC-QSDEVOPS-DEV'
    ssh_password = 'bfNb5C6EqoL491'

    # Connect to SSH
    ssh_client = create_ssh_client(ssh_server, ssh_port, ssh_user, ssh_password)
    try:
        # Execute SQL commands via SSH
        execute_sql_commands(ssh_client)
    finally:
        ssh_client.close()

if __name__ == "__main__":
    main()
