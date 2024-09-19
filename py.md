const { Client } = require('pg');

// PostgreSQL connection details
const dbConfig = {
    user: 'AutoQlik',
    host: 'localhost',
    database: 'CXODashboard_db_dev',
    password: 'AutoClick',
    port: 4432,
};

// List of strings to search
const searchStrings = ["example_string1", "example_string2", "example_string3"];

// Function to connect to the PostgreSQL database
async function connectDB() {
    const client = new Client(dbConfig);
    await client.connect();
    return client;
}

// Function to generate the UPDATE query without a primary key
function generateUpdateQueryWithoutPrimaryKey(tableName, rowValues, columnName, oldValue, newValue) {
    // Construct WHERE clause using all fields' values in the row
    const conditions = Object.entries(rowValues)
        .map(([col, value]) => `${col} = ${typeof value === 'string' ? `'${value}'` : value}`)
        .join(' AND ');

    return `UPDATE ${tableName} SET ${columnName} = REPLACE(${columnName}, '${oldValue}', '${newValue}') WHERE ${conditions};`;
}

// Main function to search for strings in all tables
async function searchStringsInDB(client, searchStrings) {
    try {
        // Query to get all tables in the public schema
        const tableResult = await client.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
        `);

        for (let tableRow of tableResult.rows) {
            const tableName = tableRow.table_name;

            // Query to get all columns for the current table
            const columnResult = await client.query(`
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = $1
            `, [tableName]);

            for (let columnRow of columnResult.rows) {
                const columnName = columnRow.column_name;

                // Search through each string in the list
                for (let searchString of searchStrings) {
                    // Query to check if the column contains the search string
                    const searchResult = await client.query(`
                        SELECT *
                        FROM ${tableName}
                        WHERE ${columnName} LIKE $1
                    `, [`%${searchString}%`]);

                    if (searchResult.rows.length > 0) {
                        for (let row of searchResult.rows) {
                            console.log(`Found '${searchString}' in table '${tableName}', column '${columnName}'`);

                            // Example: Generating an update query without a primary key
                            const newString = "new_value";  // Replace with your actual new value
                            const updateQuery = generateUpdateQueryWithoutPrimaryKey(tableName, row, columnName, searchString, newString);
                            console.log(updateQuery);
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
}

// Execute the script
(async () => {
    const client = await connectDB();
    await searchStringsInDB(client, searchStrings);
    await client.end();
})();