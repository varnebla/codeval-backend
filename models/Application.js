const { model, Schema } = require('mongoose');

const applicationSchema = new Schema({
  applicantName: String,
  applicantEmail: String,
  applicantPhone: String,
  accessToken: String,
  accessTokenExpiration: Number,
  exercise: {
    type: Schema.Types.ObjectId,
    ref: 'exercises'
  },
  created_at: Date,
  expiryDate: Date,
  completed_at: Date,
  applicationStatus: String,
  report: {
    type: Schema.Types.ObjectId,
    ref: 'reports'
  },
});

module.exports = model('Application', applicationSchema);