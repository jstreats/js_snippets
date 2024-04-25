import requests
import time
import json

# Function to make a GET request to the primary API
def make_request():
    url = "https://api.example.com/data"  # Replace with the actual URL
    headers = {'Content-Type': 'application/json'}
    body = {
        "dimensionList": ["Month Year"],
        "measureList": [],
        "selections": [
            {
                "FieldName": "Year",
                "Values": [2024],
                "fieldType": "N"
            },
            {
                "FieldName": "Month",
                "Values": [1],
                "fieldType": "N"
            }
        ]
    }
    try:
        response = requests.get(url, headers=headers, json=body, verify=False)
        response.raise_for_status()
        print("Request successful, response:", response.text)
    except requests.RequestException as e:
        print("Error during the API call:", e)
        call_error_handling_api()

# Function to call another API when an error occurs
def call_error_handling_api():
    url = "https://api.example.com/error-handler"  # Replace with the actual URL
    try:
        response = requests.post(url, data={"message": "Error in primary API"}, verify=False)
        print("Error handling API called successfully, status code:", response.status_code)
    except requests.RequestException as e:
        print("Error during the error handling API call:", e)

# Main loop to run the function every 1 minute
while True:
    make_request()
    time.sleep(60)  # Wait for 1 minute before making the next request



















const fetch = require('node-fetch');

async function fetchUsers(baseUrl, headers) {
    const response = await fetch(`${baseUrl}/qrs/user/full`, { headers });
    return response.json();
}

async function fetchUserActivities(baseUrl, headers, userId) {
    const response = await fetch(`${baseUrl}/qrs/auditactivity?filter=userId eq ${userId}`, { headers });
    return response.json();
}

// Example usage
const baseUrl = 'https://qlik.example.com';
const headers = {
    'X-Qlik-Xrfkey': 'abcdef1234567890',
    'X-Qlik-User': 'UserDirectory=INTERNAL;UserId=qlik_admin',
    'hdr-usr': `UserDirectory=YourDirectory; UserId=YourUserId`
};

fetchUsers(baseUrl, headers).then(users => {
    users.forEach(user => {
        fetchUserActivities(baseUrl, headers, user.id).then(activities => {
            console.log(`User: ${user.name}, Activities: `, activities);
        });
    });
});
