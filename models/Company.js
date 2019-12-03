const { model, Schema } = require('mongoose');

const companySchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    required: true
  },
  admin: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  exercises: [
    {
      type: Schema.Types.ObjectId,
      ref: 'exercises'
    }
  ],
  employees: [
    {
      type: Schema.Types.ObjectId,
      ref: 'users'
    }
  ],
  applications: [
    {
      type: Schema.Types.ObjectId,
      ref: 'applications'
    }
  ]
});

module.exports = model('Company', companySchema);
