const { model, Schema } = require('mongoose');

const reportSchema = new Schema({
  application: {
    type: Schema.Types.ObjectId,
    ref: 'applications'
  },
});

module.exports = model('Report', reportSchema);