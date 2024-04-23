import requests
from datetime import datetime, timedelta

# Function to generate all months from January 2022 to December 2024
def generate_month_year_pairs():
    start_date = datetime(2022, 1, 1)
    end_date = datetime(2024, 12, 31)
    current_date = start_date
    while current_date <= end_date:
        yield current_date.year, current_date.month
        # Move to the first day of the next month
        current_date += timedelta(days=31)
        current_date = current_date.replace(day=1)

# Loop over each month and make an API call
for year, month in generate_month_year_pairs():
    # Prepare the JSON body for the request
    request_body = {
        "dimensionList": ["Pod ID", "Month Year", "Incident Number $N"],
        "measureList": ["API - Incidents"],
        "selections": [
            {
                "FieldName": "Year",
                "Values": [str(year)],
                "fieldType": "N"
            },
            {
                "FieldName": "Month",
                "Values": [str(month)],
                "fieldType": "N"
            }
        ]
    }

    # API endpoint
    api_endpoint = 'https://qsctoreporting.uk.hsbc:7000'

    # Make the API call
    response = requests.get(api_endpoint, json=request_body, verify=False)
    
    # Check if the request was successful
    if response.status_code == 200:
        # Save the response to a file
        filename = f'api_response_{year}_{month:02d}.json'
        with open(filename, 'w') as file:
            file.write(response.text)
        print(f'Successfully saved response for {year}-{month:02d}')
    else:
        print(f'Failed to fetch data for {year}-{month:02d}: {response.status_code}, Reason: {response.text}')

# If you're running this script in a production environment, consider removing verify=False and using a valid SSL certificate.
