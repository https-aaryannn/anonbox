/**
 * NOTE: This is a backend stub.
 * In the attached React SPA, logic is handled client-side via Firebase/LocalStorage for the demo.
 * To enable this Node.js backend, you would:
 * 1. `npm install express cors firebase-admin dotenv`
 * 2. Run `node server/index.js`
 */

const express = require('express');
const cors = require('cors');
// const admin = require('firebase-admin');

const app = express();
app.use(cors());
app.use(express.json());

// admin.initializeApp({ ...credential });
// const db = admin.firestore();

// Rate limiting middleware stub
const rateLimit = (req, res, next) => {
    // Implement Redis or Memory store rate limiting here
    next();
};

app.post('/api/confess', rateLimit, async (req, res) => {
    const { content } = req.body;
    if (!content || content.length > 1000) {
        return res.status(400).json({ error: "Invalid content" });
    }
    
    try {
        // await db.collection('confessions').add({ content, createdAt: Date.now() });
        res.status(201).json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
