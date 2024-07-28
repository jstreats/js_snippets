import json
import os

# Specify the folder containing your JSON files
folder_path = 'path/to/your/json/folder'

# Initialize lists to store collections and environments
all_requests = []
all_environments = []

# Iterate over all JSON files in the folder
for filename in os.listdir(folder_path):
    if filename.endswith('.json'):
        file_path = os.path.join(folder_path, filename)
        
        # Load the JSON file
        with open(file_path, 'r') as file:
            data = json.load(file)
        
        # Check if the JSON file is a collection or environment
        if 'requests' in data:
            # Add requests to the combined list
            all_requests.extend(data['requests'])
        elif 'env' in data:
            # Add environment variables to the combined list
            all_environments.append(data)

# Format the requests for Thunder Client
formatted_requests = []
for request in all_requests:
    formatted_requests.append({
        "method": request['method'],
        "url": request['url'],
        "headers": request.get('headers', []),
        "body": request.get('body', {})
    })

# Save the formatted requests and environments to new JSON files
with open('combined_requests.json', 'w') as file:
    json.dump({"requests": formatted_requests}, file, indent=4)

with open('combined_environments.json', 'w') as file:
    json.dump({"environments": all_environments}, file, indent=4)

print("Formatted requests saved to combined_requests.json")
print("Formatted environments saved to combined_environments.json")
