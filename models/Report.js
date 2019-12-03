const { model, Schema } = require('mongoose');

const reportSchema = new Schema({
  submittedCode: String,
  tests: [
    {
      title: String,
      passed: Boolean
    }
  ],
  hints: [
    {
      title: String,
      used: Boolean,
      time: Date
    }
  ],
  passed: Boolean,
  duration: Number,
  finalScore: Number,
  copyPaste: [
    {
      content: String,
      time: Date
    }
  ],
  testClicked: [
    {
      currentCode: String,
      time: Date
    }
  ],
  applicantName: String,
  application: {
    type: Schema.Types.ObjectId,
    ref: 'applications'
  },
  reviews: [
    {
      created_by: String,
      created_at: Date,
      content: String
    }
  ]
});

module.exports = model('Report', reportSchema);
