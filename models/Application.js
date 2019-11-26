const { model, Schema } = require('mongoose');

const applicationSchema = new Schema({
  // REQUIRED ON CREATION
  exercise: {
    type: Schema.Types.ObjectId,
    ref: 'exercises',
    required: true
  },
  applicantEmail: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    required: true
  },
  created_by: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  company: {
    type: Schema.Types.ObjectId,
    ref: 'companies'
  },
  status: {
    type: String,
    default: 'issued'
  },
  token_duration: {
    type: Number,
    required: true
  },
  // UPDATED ON BRIEFING
  applicantName: String,
  startingTime: Date,
  // UPDATED ON SUBMIT
  completed_at: Date,
  report: {
    type: Schema.Types.ObjectId,
    ref: 'reports'
  }
});

module.exports = model('Application', applicationSchema);
