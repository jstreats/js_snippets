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
