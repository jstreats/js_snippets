import requests
from datetime import datetime, timedelta

# Function to generate all months from January 2022 to December 2024
def generate_month_year_pairs():
    start_date = datetime(2022, 1, 1)
    end_date = datetime(2024, 12, 31)
    current_date = start_date
    while current_date <= end_date:
        yield current_date.year, current_date.month
        current_date += timedelta(days=31)
        current_date = current_date.replace(day=1)

# Base URL of the API
api_url = "https://qsctoreporting.uk.hsbc:7000"

# Loop through each year and month
for year, month in generate_month_year_pairs():
    # JSON request body
    request_body = {
        "dimensionList": ["Pod ID"],
        "measureList": ["API - Incidents"],
        "selections": [
            {"FieldName": "Year", "Values": [str(year)], "fieldType": "N"},
            {"FieldName": "Month", "Values": [str(month)], "fieldType": "N"}
        ]
    }

    # Make the GET request to the API
    response = requests.get(api_url, json=request_body, verify=False)
    
    if response.status_code == 200:
        # Parse the response and extract pod incident data
        pod_incidents_data = response.json()  # Replace with the actual key if response is nested
        # Save the extracted data to a file
        file_name = f"pod_incidents_{year}_{month:02d}.json"
        with open(file_name, "w") as file:
            file.write(response.text)
        print(f"Data for {year}-{month:02d} saved successfully.")
    else:
        print(f"Failed to get data for {year}-{month:02d}: {response.status_code}")

