const User = require('./../models/User');
const Company = require('./../models/Company');

const bcrypt = require('../utils/bcrypt');
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function generateToken (user) {
  return jwt.sign(
    {
      id: user.id,
      name: user.name
    },
    process.env.SECRET_KEY,
    { expiresIn: '24h' }
  );
}

exports.register = async ctx => {
  // CHECK INPUT
  const { companyName, name, email, password } = ctx.request.body;
  if (!companyName) ctx.throw(422, JSON.stringify({ error:'Company name required.'}));
  if (!name) ctx.throw(422, JSON.stringify({ error:'Name required.'}));
  if (!email) ctx.throw(422, JSON.stringify({ error:'Email required.'}));
  if (!password) ctx.throw(422, JSON.stringify({ error:'Password required.'}));
  // CHECK IF USER EXISTS
  const user = await User.findOne({ name });
  if (user) {
    ctx.throw(422, JSON.stringify({ error: 'This name is taken.'}));
  }
  // CHECK IF COMPANY EXISTS
  const company = await Company.findOne({ name: companyName });
  if (company) {
    ctx.throw(422, JSON.stringify({ error:'There\'s already a company with this name'}));
  }
  // HASH THE PASSWORD
  hashedPassword = await bcrypt.hash(password);
  // CREATE THE COMPANY
  const createdCompany = await Company.create({
    name: companyName,
    verified: false,
    created_at: new Date().toISOString()
  });
  // CREATE THE USER
  const createdUser = await User.create({
    name,
    email,
    password: hashedPassword,
    createdAt: new Date().toISOString(),
    company: createdCompany.id
  });
  // LINK THE COMPANY TO THE USER
  const updatedCompany = await Company.findOneAndUpdate(
    { _id: createdCompany.id },
    { $set: { admin: createdUser.id } },
    { new: true }
  );
  // GENERATE TOKEN
  const token = generateToken(createdUser);
  // SEND EMAIL
  const msg = {
    to: createdUser.email,
    from: 'test@example.com',
    subject: 'Sending with Twilio SendGrid is Fun',
    text: 'and easy to do anywhere, even with Node.js',
    html: '<strong>and easy to do anywhere, even with Node.js</strong>'
  };
  // sgMail.send(msg);   **********FOR DEVELOPING SendGrid EMAILS ARE COMMENTED OUT.********************
  // COMPOSE RESPONSE
  ctx.body = {
    name: createdUser.name,
    companyName: updatedCompany.name,
    companyId: updatedCompany._id,
    id: createdUser._id,
    token
  };
};

exports.login = async ctx => {
  // CHECK INPUT
  const { email, password } = ctx.request.body;
  if (!email) ctx.throw(422, JSON.stringify({ error:'Email required.'}));
  if (!password) ctx.throw(422, JSON.stringify({ error:'Password required.'}));
  // CHECK IF USER EXISTS
  const user = await User.findOne({ email });
  if (!user) {
    ctx.throw(422, JSON.stringify({ error:'This user doesn\'t exist'}));
  }
  // CHECK IF ITS COMPANY EXIST
  const company = await Company.findOne({ _id: user.company });
  if (!company) {
    ctx.throw(422, JSON.stringify({ error:'This user is not connected to any company'}));
  }
  // CHECK IF THE PASSWORD IS CORRECT
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    ctx.throw(422, JSON.stringify({ error:'Wrong credentials'}));
  }
  // GENERATE TOKEN
  const token = generateToken(user);
  // COMPOSE RESPONSE
  ctx.body = {
    name: user.name,
    companyName: company.name,
    companyId: company._id,
    id: user._id,
    token
  };
};
