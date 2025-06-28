const express = require('express');
const router = express.Router();

// Your existing simple prompt endpoint
router.post('/simple-prompt', async (req, res) => {
    try {
        const { prompt } = req.body;

        // TODO: Replace this with your actual AI service call
        // This could be OpenAI, Claude, or any other AI service

        // Placeholder response - replace with actual AI call
        const mockResponse = `This is a mock response to: "${prompt.substring(0, 50)}..."`;

        res.json({
            data: {
                response: mockResponse
            }
        });
    } catch (error) {
        console.error('Error processing prompt:', error);
        res.status(500).json({
            detail: 'Failed to process prompt'
        });
    }
});

module.exports = router;