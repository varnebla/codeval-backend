const Report = require('./../models/Report');

exports.addReview = async ctx => {
  const { review, reviewerName } = ctx.request.body;
  if (!review) ctx.throw(422, JSON.stringify({ error: 'Review is required' }));
  if (!reviewerName)
    ctx.throw(422, JSON.stringify({ error: 'Reviewer Name is required' }));
  // LINK THE APPLICATION TO THE COMPANY
  await Report.findOneAndUpdate(
    { _id: ctx.params.id },
    {
      $push: {
        reviews: {
          created_by: reviewerName,
          created_at: new Date().toISOString(),
          content: review
        }
      }
    },
    { new: true }
  );
  ctx.body = 'Review successfully posted';
};
