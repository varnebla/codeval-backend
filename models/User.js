const { model, Schema } = require('mongoose');

const userSchema = new Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    required: true
  },
  profileImage: {
    type: String
  },
  password: {
    type: String,
    default: 'https://beautifulmemory.sg/wp-content/uploads/2019/03/default-avatar-profile-icon-vector-18942381.jpg'
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
