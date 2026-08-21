const fs = require('fs');

// We can't run DOM scripts directly in Node.js without jsdom, but since this is a React app we can try to find the matching tree manually, or simply add a debugging border to the element in the React component itself.
