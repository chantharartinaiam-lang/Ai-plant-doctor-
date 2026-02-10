// script.js

function getCurrentDateTime() {
    const now = new Date();
    return now.toISOString().replace('T', ' ').substring(0, 19);
}

console.log('Current Date and Time (UTC):', getCurrentDateTime());