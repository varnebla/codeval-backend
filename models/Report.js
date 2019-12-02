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
      time: Number
    }
  ],
  passed: Boolean,
  duration: Number,
  finalScore: Number,
  copyPaste: [
    {
      content: String,
      time: Number
    }
  ],
  testClicked: [
    {
      currentCode: String,
      tests: [
        {
          title: String,
          passed: Boolean
        }
      ],
      time: Number
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
