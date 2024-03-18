const { exec } = require('child_process');

function runTaskByName(taskName) {
    // Command to find the task by its name and run it
    const command = `Start-ScheduledTask -TaskName "${taskName}"`;

    // Execute the PowerShell command
    exec(`powershell.exe -Command "${command}"`, (error, stdout, stderr) => {
        if (error) {
            console.error('Error:', error.message);
            return;
        }
        if (stderr) {
            console.error('Error:', stderr);
            return;
        }
        console.log(`Task '${taskName}' started successfully.`);
    });
}





const express = require('express');
const { exec } = require('child_process');
const axios = require('axios');
require('dotenv').config();

const app = express();

// Function to stop a Windows service
function stopService(serviceName) {
    return new Promise((resolve, reject) => {
        // Command to stop a service using sc command in Windows
        const command = `sc stop "${serviceName}"`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(`Error stopping service ${serviceName}: ${error.message}`);
                return;
            }
            if (stderr) {
                reject(`Error stopping service ${serviceName}: ${stderr}`);
                return;
            }
            resolve(`Service ${serviceName} stopped successfully.`);
        });
    });
}

// Function to start a Windows service
function startService(serviceName) {
    return new Promise((resolve, reject) => {
        // Command to start a service using sc command in Windows
        const command = `sc start "${serviceName}"`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(`Error starting service ${serviceName}: ${error.message}`);
                return;
            }
            if (stderr) {
                reject(`Error starting service ${serviceName}: ${stderr}`);
                return;
            }
            resolve(`Service ${serviceName} started successfully.`);
        });
    });
}

// Array of service names to stop and start
const serviceNames = ['Service1', 'Service2', 'Service3'];
const stopDelays = [5000, 3000, 6000]; // Delays in milliseconds between stopping each service
const startDelays = [5000, 3000, 6000]; // Delays in milliseconds between starting each service

// Function to stop services sequentially with a delay between each stop
async function stopServicesSequentiallyWithDelay(stopDelays) {
    for (const [index, serviceName] of serviceNames.entries()) {
        try {
            await stopService(serviceName);
            console.log(`Service ${serviceName} stopped successfully.`);
            if (index < serviceNames.length - 1) {
                console.log(`Waiting ${stopDelays[index]} milliseconds before stopping the next service...`);
                await delayExecution(stopDelays[index]);
            } else {
                console.log('All services stopped.');
                console.log('Starting services...');
                await startServicesWithDelay();
            }
        } catch (error) {
            console.error(error);
        }
    }
}

// Function to delay execution
function delayExecution(delay) {
    return new Promise(resolve => setTimeout(resolve, delay));
}

// Function to start all services with delays between each start
async function startServicesWithDelay() {
    for (const [index, serviceName] of serviceNames.entries()) {
        try {
            await startService(serviceName);
            console.log(`Service ${serviceName} started successfully.`);
            if (index < startDelays.length) {
                console.log(`Waiting ${startDelays[index]} milliseconds before starting the next service...`);
                await delayExecution(startDelays[index]);
            }
        } catch (error) {
            console.error(error);
        }
    }
}

// Route to trigger stopServicesSequentiallyWithDelay
app.get('/stop-services', async (req, res) => {
    try {
        await stopServicesSequentiallyWithDelay(stopDelays);
        res.send('Services stopped and started successfully.');
    } catch (error) {
        console.error('Error stopping and starting services:', error);
        res.status(500).send('Error stopping and starting services.');
    }
});

// Serve a simple HTML page
app.get('/', (req, res) => {
    res.send(`
        <html>
        <head>
            <title>Stop Services</title>
        </head>
        <body>
            <h1>Stop Services</h1>
            <form action="/stop-services" method="get">
                <button type="submit">Stop Services</button>
            </form>
        </body>
        </html>
    `);
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
