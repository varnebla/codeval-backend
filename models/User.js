const { model, Schema } = require('mongoose');

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  verified: {
    type: Boolean,
    default: false
  },
  company: {
    type: Schema.Types.ObjectId,
    ref: 'companies'
  }
});

module.exports = model('User', userSchema);
