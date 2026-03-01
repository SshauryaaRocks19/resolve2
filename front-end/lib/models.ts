import mongoose, { Schema, model, models } from 'mongoose';

// Test Results — stores each completed test
const testResultSchema = new Schema({
    user_id: { type: String, required: true, index: true },
    topic: { type: String, required: true },
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    weaknesses: { type: [String], default: [] },
    created_at: { type: Date, default: Date.now },
});

// Compound index for efficient queries
testResultSchema.index({ user_id: 1, topic: 1 });

export const TestResult = models.TestResult || model('TestResult', testResultSchema);

// User Concept Mastery — tracks weaknesses per micro-concept
const conceptMasterySchema = new Schema({
    user_id: { type: String, required: true, index: true },
    topic: { type: String, required: true },
    micro_concept: { type: String, required: true },
    error_weight: { type: Number, default: 1 },
    last_tested_at: { type: Date, default: Date.now },
});

// Compound index to find existing weakness records quickly
conceptMasterySchema.index({ user_id: 1, topic: 1, micro_concept: 1 }, { unique: true });

export const ConceptMastery = models.ConceptMastery || model('ConceptMastery', conceptMasterySchema);
