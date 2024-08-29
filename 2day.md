To implement Single Sign-On (SSO) functionality in a Node.js application using a keytab file, you can leverage the `kerberos` library. Here’s a basic example of how to set this up.

### Step 1: Install Required Dependencies
First, install the necessary packages:

```bash
npm install express kerberos
```

### Step 2: Create the SSO Functionality
Here’s a simple Express application that demonstrates how to use Kerberos for SSO:

```javascript
const express = require('express');
const kerberos = require('kerberos');

const app = express();
const PORT = 3000;

// Path to your keytab file
const keytabPath = '/path/to/your.keytab';
const servicePrincipal = 'HTTP/your-service-host@YOUR.REALM';

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Welcome to the SSO protected service');
});

app.get('/auth', async (req, res) => {
    try {
        // Initialize the Kerberos client
        const client = new kerberos.KerberosClient();

        // Authenticate using the keytab file
        await client.initializeClient(servicePrincipal, { keytab: keytabPath });
        const ticket = await client.step('');

        if (ticket) {
            // Successful authentication
            res.status(200).send('Authenticated successfully!');
        } else {
            // Authentication failed
            res.status(401).send('Authentication failed');
        }
    } catch (err) {
        console.error('Authentication error:', err);
        res.status(500).send('Internal server error');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
```

### Step 3: Configure the Environment
Ensure that your server is configured to handle the Kerberos environment. You may need to set the following environment variables:

```bash
export KRB5_CONFIG=/etc/krb5.conf
export KRB5CCNAME=FILE:/tmp/krb5cc_$(id -u)
export KRB5_KTNAME=/path/to/your.keytab
```

### Explanation

1. **Kerberos Initialization**: The `KerberosClient` is initialized with the service principal and the keytab file. This allows the application to authenticate itself with the Kerberos server.

2. **Handling Requests**: When a request is made to the `/auth` endpoint, the server attempts to authenticate the user using the Kerberos ticket. If successful, a success message is returned.

3. **Error Handling**: Basic error handling is implemented to capture any issues during the authentication process.

### Step 4: Run the Application

After setting up the environment and ensuring the keytab and configuration files are in place, start your Node.js server:

```bash
node app.js
```

You can now test the SSO functionality by accessing the `/auth` endpoint.

This is a basic implementation and can be expanded upon to fit specific requirements, such as integrating with other authentication mechanisms, handling user sessions, or setting up more complex routing and middleware.