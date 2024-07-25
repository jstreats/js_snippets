pip install sqlite3 pandas tldextract
import sqlite3
import pandas as pd
import tldextract
import os

def extract_edge_history(db_path):
    # Connect to the Edge history SQLite database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Query to fetch URLs from history
    query = "SELECT url FROM urls"
    cursor.execute(query)
    rows = cursor.fetchall()

    # Close the connection
    conn.close()

    # Extract URLs
    urls = [row[0] for row in rows]
    return urls

def group_urls_by_domain(urls):
    domain_dict = {}
    for url in urls:
        extracted = tldextract.extract(url)
        domain = f"{extracted.domain}.{extracted.suffix}"
        if domain not in domain_dict:
            domain_dict[domain] = []
        domain_dict[domain].append(url)
    return domain_dict

def save_to_file(domain_dict, output_path):
    with open(output_path, 'w') as file:
        for domain, urls in domain_dict.items():
            file.write(f"{domain}:\n")
            for url in urls:
                file.write(f"  {url}\n")
            file.write("\n")

def main():
    # Path to the Edge history SQLite database
    user_profile = os.getenv('USERPROFILE')
    edge_history_path = os.path.join(user_profile, r'AppData\Local\Microsoft\Edge\User Data\Default\History')
    
    # Extract URLs from history
    urls = extract_edge_history(edge_history_path)
    
    # Group URLs by domain
    domain_dict = group_urls_by_domain(urls)
    
    # Save grouped URLs to a file
    output_path = "edge_history_grouped_by_domain.txt"
    save_to_file(domain_dict, output_path)
    print(f"Grouped URLs saved to {output_path}")

if __name__ == "__main__":
    main()