const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-toolkit', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB database: ai-toolkit'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/prompts', require('./routes/prompts'));
app.use('/api', require('./routes/api'));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'AI Toolkit Support Server' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`AI Toolkit Support Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});