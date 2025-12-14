const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: String,
  location: String,
  skills: [String],
  experience: {
    type: Number,
    default: 0
  },
  resume: {
    filename: String,
    path: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  },
  evaluation: {
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    summary: {
      type: String,
      default: ''
    },
    strengths: {
      type: [String],
      default: []
    },
    weaknesses: {
      type: [String],
      default: []
    },
    recommendations: {
      type: [String],
      default: []
    }
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'screened', 'interviewed', 'offered', 'hired', 'rejected'],
    default: 'new'
  },
  notes: String,
  source: {
    type: String,
    enum: ['linkedin', 'github', 'referral', 'application', 'other'],
    default: 'application'
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

module.exports = mongoose.model('Candidate', candidateSchema);