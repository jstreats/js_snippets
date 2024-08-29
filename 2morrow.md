Here is a simple example of how you might integrate Qlik Sense SSO with a Node.js application using ticket-based authentication.

### Step 1: Request a Ticket from Qlik Sense

Create a route in your Node.js app that requests a ticket from Qlik Sense:

```javascript
const express = require('express');
const axios = require('axios');
const app = express();

// Configuration
const qlikSenseProxyUrl = 'https://<your-qlik-sense-server>:4243/qps';
const qlikSenseVirtualProxy = ''; // if you have a virtual proxy prefix
const qlikSenseUserDirectory = '<UserDirectory>'; // replace with your user directory
const qlikSenseUserId = '<UserId>'; // replace with your user ID

// Middleware to check Qlik Sense authentication
app.use(async (req, res, next) => {
    try {
        // Check if the user is already authenticated
        if (req.session && req.session.ticket) {
            return next();
        }

        // Request a ticket from Qlik Sense
        const response = await axios.post(`${qlikSenseProxyUrl}/ticket?xrfkey=abcdef1234567890`, {
            UserDirectory: qlikSenseUserDirectory,
            UserId: qlikSenseUserId,
            Attributes: []
        }, {
            headers: {
                'X-Qlik-Xrfkey': 'abcdef1234567890',
                'Content-Type': 'application/json'
            },
            // Assuming you have a self-signed certificate
            httpsAgent: new https.Agent({ rejectUnauthorized: false })
        });

        if (response.data.Ticket) {
            req.session.ticket = response.data.Ticket;
            // Redirect to Qlik Sense Hub with the ticket
            const hubUrl = `https://<your-qlik-sense-server>/${qlikSenseVirtualProxy}/hub/?qlikTicket=${response.data.Ticket}`;
            return res.redirect(hubUrl);
        } else {
            res.status(401).send('Unable to authenticate with Qlik Sense.');
        }
    } catch (error) {
        console.error('Error requesting ticket from Qlik Sense:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Example protected route
app.get('/protected', (req, res) => {
    if (req.session && req.session.ticket) {
        res.send('You are authenticated with Qlik Sense!');
    } else {
        res.status(401).send('You are not authenticated.');
    }
});

// Start server
app.listen(3000, () => {
    console.log('Node.js app listening on port 3000');
});
```

### Step 2: Secure the Application

Ensure that your Node.js application is running under HTTPS and that the `qlikSenseProxyUrl` is pointing to the correct Qlik Sense Proxy Service (QPS) endpoint.

### Step 3: Create a Session After Authentication

When the user is redirected back from Qlik Sense with a ticket, you can use that ticket to create a session in your Node.js application.

### Step 4: Serve Your Application

Make sure that your Qlik Sense server and Node.js application are properly configured to handle the authentication flow. The Node.js app should be accessible via HTTPS, and your Qlik Sense server should be configured to accept requests from your Node.js app.

### Important Notes:

1. **Self-Signed Certificates**: If Qlik Sense is using a self-signed certificate, you'll need to handle that in your Node.js app (as shown in the `httpsAgent` configuration).
2. **User Information**: The `UserDirectory` and `UserId` need to be specific to your environment. Adjust these values accordingly.
3. **Virtual Proxy**: If you have a virtual proxy prefix in Qlik Sense, you should set it in the `qlikSenseVirtualProxy` variable.

This example assumes that you're using session middleware in Express.js to manage the user session. You can expand this code to handle more complex logic, such as different user roles, additional security checks, and better error handling.

Let me know if you need further customization or additional features!