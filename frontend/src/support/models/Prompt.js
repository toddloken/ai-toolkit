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

// Add pre-save middleware to update the updatedAt field
promptSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Prompt', promptSchema);