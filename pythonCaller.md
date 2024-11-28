// pythonCaller.js
const { spawn } = require('child_process');

/**
 * Calls a Python script and returns its output as a Promise.
 *
 * @param {string} scriptPath - The path to the Python script.
 * @param {Array<string>} args - Array of arguments to pass to the Python script.
 * @returns {Promise<any>} - A promise that resolves with the script output or rejects with an error.
 */
function callPythonScript(scriptPath, args = []) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python3', [scriptPath, ...args]);

    let output = '';
    let error = '';

    // Capture standard output
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    // Capture standard error
    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    // Handle process exit
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          resolve(JSON.parse(output)); // Parse output as JSON if needed
        } catch (parseError) {
          reject(`Error parsing output: ${parseError.message}`);
        }
      } else {
        reject(`Python script exited with code ${code}: ${error}`);
      }
    });
  });
}

module.exports = callPythonScript;
