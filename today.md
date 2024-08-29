To handle aborting requests to Qlik when a user cancels an API call in Express.js, you can utilize the `AbortController` from Node.js to abort the ongoing request to Qlik. Here's how you can implement it:

### 1. Install Required Dependencies
If you haven't already, ensure you have the necessary dependencies:

```bash
npm install node-fetch
```

### 2. Use `AbortController` in Your API Route
Here’s how you can modify your Express API to support request cancellation:

```javascript
const express = require('express');
const fetch = require('node-fetch');
const AbortController = require('abort-controller');

const app = express();

app.use(express.json());

app.post('/getHypercube', async (req, res) => {
    const { dimensions, measures, filters } = req.body;
    
    // Create an AbortController instance
    const controller = new AbortController();
    const signal = controller.signal;
    
    // Set up an event listener to abort the fetch request if the client disconnects
    req.on('close', () => {
        console.log('Client disconnected, aborting request to Qlik...');
        controller.abort();
    });
    
    try {
        const response = await fetch('https://qlik-api-endpoint', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dimensions, measures, filters }),
            signal: signal
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch data from Qlik');
        }
        
        const data = await response.json();
        res.json(data);
        
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('Request to Qlik was aborted.');
            res.status(499).send('Client closed request');
        } else {
            console.error('Error fetching data from Qlik:', error);
            res.status(500).send('Internal Server Error');
        }
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
```

### Explanation:

1. **AbortController**: This allows you to abort the request to Qlik when the client disconnects.
   
2. **Signal**: The `signal` from the `AbortController` is passed to the `fetch` request, enabling you to cancel the request.

3. **Request Abortion**: By listening to the `close` event on the `req` object, you can detect when the client disconnects and call `controller.abort()` to cancel the ongoing request to Qlik.

4. **Handling Errors**: Differentiate between an `AbortError` (which occurs when the request is aborted) and other types of errors, allowing you to handle each case appropriately.

This setup ensures that your Express.js API can gracefully handle user cancellations, reducing unnecessary load on the Qlik server and improving resource management.