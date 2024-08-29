// Function to check if a variable is a valid BigInt
function isValidBigInt(value) {
    return typeof value === 'bigint';
}

// Function to check if a variable is a valid sanitized PostgreSQL parameter for the year in the format 20yy
function isValidYear(year) {
    const yearRegex = /^20\d{2}$/;
    return yearRegex.test(year);
}

// Function to check if a variable is a valid sanitized PostgreSQL parameter for the month-year in the format yyyy-mm-dd
function isValidMonthYear(date) {
    const monthYearRegex = /^\d{4}-(0[1-9]|1[0-2])-\d{2}$/;
    return monthYearRegex.test(date);
}

// Example Usage
console.log(isValidBigInt(12345678901234567890n)); // Output: true
console.log(isValidYear('2024')); // Output: true
console.log(is