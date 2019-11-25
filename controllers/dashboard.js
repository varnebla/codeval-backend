exports.summary = async ctx => {
  console.log(ctx.request.jwtPayload);
  ctx.body = 'Hi from dashboard';
};
