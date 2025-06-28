const mongoose = require('mongoose');

const promptSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    instructions: {
        type: String,
        trim: true
    },
    context: {
        type: String,
        trim: true
    },
    inputData: {
        type: String,
        trim: true
    },
    outputIndicator: {
        type: String,
        trim: true
    },
    negativePrompting: {
        type: String,
        trim: true
    },
    combinedPrompt: {
        type: String,
        required: true
    },
    response: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Prompt', promptSchema);

// backend/routes/prompts.js
const express = require('express');
const router = express.Router();
const Prompt = require('../models/Prompt');

// Save prompt to database
router.post('/save', async (req, res) => {
    try {
        const {
            title,
            instructions,
            context,
            inputData,
            outputIndicator,
            negativePrompting,
            combinedPrompt,
            response
        } = req.body;

        // Validation
        if (!title || !combinedPrompt) {
            return res.status(400).json({
                error: 'Title and combined prompt are required'
            });
        }

        const newPrompt = new Prompt({
            title,
            instructions,
            context,
            inputData,
            outputIndicator,
            negativePrompting,
            combinedPrompt,
            response
        });

        const savedPrompt = await newPrompt.save();

        res.status(201).json({
            message: 'Prompt saved successfully',
            data: savedPrompt
        });
    } catch (error) {
        console.error('Error saving prompt:', error);
        res.status(500).json({
            error: 'Failed to save prompt to database'
        });
    }
});

// Get all prompts
router.get('/', async (req, res) => {
    try {
        const prompts = await Prompt.find()
            .sort({ createdAt: -1 })
            .limit(50); // Limit to last 50 prompts

        res.json({
            data: prompts
        });
    } catch (error) {
        console.error('Error fetching prompts:', error);
        res.status(500).json({
            error: 'Failed to fetch prompts'
        });
    }
});

// Get prompt by ID
router.get('/:id', async (req, res) => {
    try {
        const prompt = await Prompt.findById(req.params.id);

        if (!prompt) {
            return res.status(404).json({
                error: 'Prompt not found'
            });
        }

        res.json({
            data: prompt
        });
    } catch (error) {
        console.error('Error fetching prompt:', error);
        res.status(500).json({
            error: 'Failed to fetch prompt'
        });
    }
});

module.exports = router;

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
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

// Your existing API routes
app.use('/api', require('./routes/api')); // Your existing apiService routes

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});