/* eslint-env node */
const express = require('express');
const path = require('path');
const app = express();

// Serve static files (HTML, CSS, JS, images)
app.use(express.static(path.join(__dirname)));

// Add an explicit route for the CSV file to ensure it's served correctly
app.get('/members.csv', (req, res) => {
    res.setHeader('Content-Type', 'text/csv');
    res.sendFile(path.join(__dirname, 'members.csv'), (err) => {
        if (err) {
            console.error("Could not send members.csv:", err);
            res.status(404).send("File not found");
        }
    });
});

// Fallback: always serve index.html for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`GLO Members Matcher running at http://localhost:${PORT}`);
}); 