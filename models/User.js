const { model, Schema } = require('mongoose');

const userSchema = new Schema({
  name: String,
  surname: String, 
  email: String,
  password: String,
  created_at: Date,
  isAdmin: Boolean,
  verified: Boolean,
  company: {
    type: Schema.Types.ObjectId,
    ref: 'companies'
  }
});

module.exports = model('User', userSchema);
