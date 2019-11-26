require('dotenv').config();
const Koa = require('koa');
const app = new Koa();
const cors = require('@koa/cors');
const mongoose = require('mongoose');
const bodyParser = require('koa-bodyparser');

const errorHandler = require('./middleware/errorHandler');
const router = require('./router/router');

app.use(cors());
app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());
app.use(errorHandler);

mongoose
  .connect(process.env.MONGODB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log('MongoDB Connected'); // eslint-disable-line no-console
    return app.listen({ port: process.env.PORT || 5000 });
  })
  .then(() => {
    console.log('Server on 🔥 on port 5000'); // eslint-disable-line no-console
  });
