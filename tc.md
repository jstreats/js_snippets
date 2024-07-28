import json

# Load the exported JSON file
with open('exported_collection.json', 'r') as file:
    data = json.load(file)

# Extract requests
requests = data.get('requests', [])

# Format the requests for Thunder Client
formatted_requests = []
for request in requests:
    formatted_requests.append({
        "method": request['method'],
        "url": request['url'],
        "headers": request.get('headers', []),
        "body": request.get('body', {})
    })

# Save the formatted requests to a new JSON file
with open('formatted_requests.json', 'w') as file:
    json.dump(formatted_requests, file, indent=4)

print("Formatted requests saved to formatted_requests.json")
