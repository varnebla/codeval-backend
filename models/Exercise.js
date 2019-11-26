const { model, Schema } = require('mongoose');

const exerciseSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  difficulty: {
    type: Number,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  instructions: {
    type: String,
    required: true
  },
  placeholderCode: {
    type: String,
    required: true
  },
  hints: {
    type: [String]
  },
  solution: {
    type: String
  },
  created_at: {
    type: Date,
    required: true
  },
  updated_at: Date,
  updated_by: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  created_by: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  company: {
    type: Schema.Types.ObjectId,
    ref: 'companies'
  },
  tests: {
    type: String,
    required: true
  }
});

module.exports = model('Exercise', exerciseSchema);
