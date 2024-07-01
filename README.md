const axios = require('axios');
const chai = require('chai');
const expect = chai.expect;
const fs = require('fs');
const FormData = require('form-data');
const { exec } = require('child_process');

const API_URL = 'https://qsctoreporting.uk.hsbc:7000/DMD/table?responseDataFormat=keyValue';
const GET_API_URL = 'https://qsctoreporting.uk.hsbc:7000/DMD/table';  // Assuming a GET endpoint exists
const requestBody = {
    "dimensionList": [
        "Pod ID",
        "Month Year",
        "Incident Number SN"
    ],
    "measureList": [
        "API - Incidents"
    ],
    "selections": [
        {
            "FieldName": "Year",
            "Values": [2024],
            "fieldType": "N"
        },
        {
            "FieldName": "Month",
            "Values": [3],
            "fieldType": "N"
        }
    ]
};

const NEXUS_URL = 'http://your-nexus-repo-url/repository/your-repo';
const NEXUS_USERNAME = 'your-username';
const NEXUS_PASSWORD = 'your-password';
const TEST_RESULTS_FILE = './test-results.xml';
const UPLOAD_FLAG = process.argv.includes('--upload');

describe('DMD API Regression Tests', function() {
    this.timeout(5000);  // Increase timeout for API response

    it('should return status 200 for POST', async function() {
        const response = await axios.post(API_URL, requestBody);
        expect(response.status).to.equal(200);
    });

    it('should return status 200 for GET', async function() {
        const response = await axios.get(GET_API_URL);
        expect(response.status).to.equal(200);
    });

    it('should return data with expected structure', async function() {
        const response = await axios.post(API_URL, requestBody);
        expect(response.data).to.be.an('array');
        response.data.forEach(item => {
            expect(item).to.have.keys(['Pod ID', 'Month Year', 'Incident Number SN', 'API - Incidents']);
        });
    });

    it('should return correct data for given selections', async function() {
        const response = await axios.post(API_URL, requestBody);
        expect(response.data).to.deep.include({
            "Pod ID": "somePodID",
            "Month Year": "2024-03",
            "Incident Number SN": "someIncidentNumber",
            "API - Incidents": someValue
        });
    });

    it('should respond within acceptable time limit', async function() {
        const startTime = Date.now();
        const response = await axios.post(API_URL, requestBody);
        const endTime = Date.now();
        expect(endTime - startTime).to.be.below(2000); // 2 seconds
    });
});

// Run tests and generate results
exec('npx mocha testDmdApi.js --reporter mocha-junit-reporter --reporter-options mochaFile=' + TEST_RESULTS_FILE, (error, stdout, stderr) => {
    if (error) {
        console.error(`Error running tests: ${error.message}`);
        return;
    }
    if (stderr) {
        console.error(`Test stderr: ${stderr}`);
        return;
    }
    console.log(`Test stdout: ${stdout}`);

    if (UPLOAD_FLAG) {
        // Upload test results
        const form = new FormData();
        form.append('file', fs.createReadStream(TEST_RESULTS_FILE));

        axios.post(NEXUS_URL, form, {
            auth: {
                username: NEXUS_USERNAME,
                password: NEXUS_PASSWORD
            },
            headers: form.getHeaders()
        })
        .then(response => {
            console.log('Upload successful:', response.status);
            console.log('Uploaded results URL:', `${NEXUS_URL}/repository/your-repo/${TEST_RESULTS_FILE}`);
        })
        .catch(error => {
            console.error('Upload failed:', error);
        });
    }
});


node testDmdApi.js --upload
