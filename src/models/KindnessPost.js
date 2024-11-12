const mongoose = require('mongoose');

const kindnessPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Physical Help', 'Emotional Support', 'Resources', 'Other']
  },
  urgency: {
    type: String,
    required: true,
    enum: ['Low', 'Medium', 'High']
  },
  location: String,
  isAnonymous: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['OPEN', 'IN_PROGRESS', 'COMPLETED'],
    default: 'OPEN'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  votes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: ['UPVOTE', 'DOWNVOTE']
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('KindnessPost', kindnessPostSchema); 