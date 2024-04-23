
import pandas as pd
import json

def convert_json_to_csv(json_data, csv_file_path):
    # Function to clean and convert incidents to numbers
    def clean_incident(incident):
        if incident in ["-", "", None]:
            return 0
        # Remove commas and convert to integer
        try:
            return int(incident.replace(',', ''))
        except ValueError:
            return 0

    # Load the data
    data = json.loads(json_data)

    # Clean the data
    for item in data:
        item["Incidents"] = clean_incident(item["Incidents"])

    # Convert to pandas DataFrame
    df = pd.DataFrame(data)

    # Write to CSV
    df.to_csv(csv_file_path, index=False)
