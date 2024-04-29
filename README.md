
async function fetchProvisionalNumberLastUpdateDate(tables, maxDate = moment().toDate()) {
    const client = await pool.connect();
    try {
        let provisionalNumberLastUpdateDate = null;

        // Loop through each table and find the maximum `updated_on` date less than or equal to `maxDate`
        for (let table of tables) {
            const query = `
                SELECT MAX(updated_on) AS max_updated_on
                FROM ${table}
                WHERE updated_on <= $1;
            `;
            const res = await client.query(query, [maxDate]);
            const maxDateForTable = res.rows[0].max_updated_on;
            if (maxDateForTable && (!provisionalNumberLastUpdateDate || maxDateForTable > provisionalNumberLastUpdateDate)) {
                provisionalNumberLastUpdateDate = maxDateForTable;
            }
        }

        if (!provisionalNumberLastUpdateDate) {
            return { provisionalNumberLastUpdateDate: null, isProvisionalMetric: false };
        }

        // Convert `provisionalNumberLastUpdateDate` to moment object and extract the month
        const selectedMonth = moment(provisionalNumberLastUpdateDate).month() + 1;  // month() returns 0 to 11

        // Check if date is before the 5th of the selected month
        const isProvisionalMetric = moment(provisionalNumberLastUpdateDate).date() < 5;

        return {
            provisionalNumberLastUpdateDate,
            isProvisionalMetric,
            selectedMonth
        };
    } finally {
        client.release();
    }
}


















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
