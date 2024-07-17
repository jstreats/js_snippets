# Import the Task Scheduler module
Import-Module ScheduledTasks

# Define the username to filter tasks
$username = "svc-qsdevops-dev"

# Get all scheduled tasks
$tasks = Get-ScheduledTask

# Filter tasks by the specified user, and check the settings for "Run whether user is logged on or not" and "Do not store password"
$filteredTasks = $tasks | Where-Object {
    $_.Principal.UserId -eq $username -and
    $_.Principal.LogonType -eq 'Password' -and
    $_.Principal.RunLevel -eq 'Highest' -and
    $_.Settings.DontStorePassword -eq $true
}

# Display the filtered tasks
$filteredTasks | ForEach-Object {
    [PSCustomObject]@{
        TaskName = $_.TaskName
        TaskPath = $_.TaskPath
        UserId = $_.Principal.UserId
        LogonType = $_.Principal.LogonType
        RunLevel = $_.Principal.RunLevel
        DontStorePassword = $_.Settings.DontStorePassword
    }
}



function replaceKeysInJson(json) {
const replacements = {
    "GB/GF": "GB/GF",
    "other ending": "new value"
};
    // Helper function to check if a string ends with any of the keys in the replacements object
    function getReplacementKey(key) {
        for (const [ending, replacement] of Object.entries(replacements)) {
            if (key.endsWith(ending)) {
                return replacement;
            }
        }
        return null;
    }

    // Recursive function to traverse and replace keys
    function traverseAndReplace(obj) {
        if (Array.isArray(obj)) {
            return obj.map(item => traverseAndReplace(item));
        } else if (typeof obj === 'object' && obj !== null) {
            const newObj = {};
            for (const [key, value] of Object.entries(obj)) {
                const replacementKey = getReplacementKey(key);
                const newKey = replacementKey !== null ? replacementKey : key;
                newObj[newKey] = traverseAndReplace(value);
            }
            return newObj;
        }
        return obj; // Return the value if it's not an object or array
    }

    return traverseAndReplace(json);
}
