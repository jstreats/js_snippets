
const getProvisionalNumberLastUpdateDate = async (tableName, maxDate = moment().format('YYYY-MM-DD')) => {
  try {

    const selectedMonth = moment(maxDate).month(); // zero-based month index
    const query = `
      SELECT MAX(updated_on) AS provisionalNumberLastUpdateDate
      FROM ${tableName}
      WHERE updated_on <= $1;
    `;

    const { rows } = await pool.query(query, [maxDate]);
    const provisionalNumberLastUpdateDate = rows[0].provisionalNumberLastUpdateDate;

    if (!provisionalNumberLastUpdateDate) {
      return { provisionalNumberLastUpdateDate: null, isProvisionalMetric: false };
    }

    const dateOfProvisional = moment(provisionalNumberLastUpdateDate);
    const isProvisionalMetric = dateOfProvisional.date() < 5 && dateOfProvisional.month() === selectedMonth;

    return { 
      provisionalNumberLastUpdateDate: provisionalNumberLastUpdateDate,
      isProvisionalMetric
    };
  } catch (error) {
    console.error("Error querying database", error);
    throw error;
  }
};




















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
