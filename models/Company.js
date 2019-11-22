const { model, Schema } = require('mongoose');

const companySchema = new Schema({
  name: String,
  verified: Boolean,
  created_at: Date,
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
  ],

});

module.exports = model('Company', companySchema);
