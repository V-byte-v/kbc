
const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const db = new sqlite3.Database(':memory:');

app.use(express.json());
app.use(express.static('frontend'));

// Setup multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Create users and videos tables
db.serialize(() => {
    db.run("CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)");
    db.run("CREATE TABLE videos (id INTEGER PRIMARY KEY, name TEXT)");
});

// Sign up endpoint
app.post('/signup', (req, res) => {
    const { username, password } = req.body;
    db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, password], (err) => {
        if (err) {
            res.json({ success: false, message: 'User registration failed' });
        } else {
            res.json({ success: true });
        }
    });
});

// Upload video endpoint
app.post('/upload', upload.single('video'), (req, res) => {
    const videoName = req.file.filename;
    db.run("INSERT INTO videos (name) VALUES (?)", [videoName], (err) => {
        if (err) {
            res.json({ success: false, message: 'Video upload failed' });
        } else {
            res.json({ success: true });
        }
    });
});

// Fetch videos endpoint
app.get('/videos', (req, res) => {
    db.all("SELECT name FROM videos", [], (err, rows) => {
        if (err) {
            res.status(500).json({ success: false, message: 'Failed to fetch videos' });
        } else {
            res.json(rows);
        }
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
