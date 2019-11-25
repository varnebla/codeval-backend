const { model, Schema } = require('mongoose');

const exerciseSchema = new Schema({
  title: String,
  difficulty: Number,
  placeholderCode: String,
  hints: [String],
  created_at: Date,
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
  tests: String

});

module.exports = model('Exercise', exerciseSchema);
