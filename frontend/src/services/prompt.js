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
            data: savedPrompt,
            id: savedPrompt._id
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
            .limit(50);

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

// Update existing prompt by ID
router.put('/:id', async (req, res) => {
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

        const updatedPrompt = await Prompt.findByIdAndUpdate(
            req.params.id,
            {
                title,
                instructions,
                context,
                inputData,
                outputIndicator,
                negativePrompting,
                combinedPrompt,
                response,
                updatedAt: Date.now()
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedPrompt) {
            return res.status(404).json({
                error: 'Prompt not found'
            });
        }

        res.json({
            message: 'Prompt updated successfully',
            data: updatedPrompt
        });
    } catch (error) {
        console.error('Error updating prompt:', error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                error: 'Validation error: ' + error.message
            });
        }

        if (error.name === 'CastError') {
            return res.status(400).json({
                error: 'Invalid prompt ID format'
            });
        }

        res.status(500).json({
            error: 'Failed to update prompt'
        });
    }
});

// Delete prompt by ID
router.delete('/:id', async (req, res) => {
    try {
        const deletedPrompt = await Prompt.findByIdAndDelete(req.params.id);

        if (!deletedPrompt) {
            return res.status(404).json({
                error: 'Prompt not found'
            });
        }

        res.json({
            message: 'Prompt deleted successfully',
            data: deletedPrompt
        });
    } catch (error) {
        console.error('Error deleting prompt:', error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                error: 'Invalid prompt ID format'
            });
        }

        res.status(500).json({
            error: 'Failed to delete prompt'
        });
    }
});

module.exports = router;