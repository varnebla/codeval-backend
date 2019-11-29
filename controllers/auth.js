const User = require('./../models/User');
const Company = require('./../models/Company');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function generateToken (user, company) {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      companyId: company.id
    },
    process.env.SECRET_KEY,
    { expiresIn: '24h' }
  );
}

exports.register = async ctx => {
  // CHECK INPUT
  const { companyName, name, email, password } = ctx.request.body;
  if (!companyName)
    ctx.throw(422, JSON.stringify({ error: 'Company name required.' }));
  if (!name) ctx.throw(422, JSON.stringify({ error: 'Name required.' }));
  if (!email) ctx.throw(422, JSON.stringify({ error: 'Email required.' }));
  if (!password)
    ctx.throw(422, JSON.stringify({ error: 'Password required.' }));
  // CHECK IF USER EXISTS
  const user = await User.findOne({ name });
  if (user) {
    ctx.throw(422, JSON.stringify({ error: 'This name is taken.' }));
  }
  // CHECK IF COMPANY EXISTS
  const company = await Company.findOne({ name: companyName });
  if (company) {
    ctx.throw(
      422,
      JSON.stringify({ error: 'There\'s already a company with this name' })
    );
  }
  // HASH THE PASSWORD
  hashedPassword = await bcrypt.hash(password, 12);
  // CREATE THE COMPANY
  const createdCompany = await Company.create({
    name: companyName,
    email: email,
    verified: false,
    created_at: new Date().toISOString()
  });
  // CREATE THE USER
  const createdUser = await User.create({
    name,
    email,
    password: hashedPassword,
    created_at: new Date().toISOString(),
    company: createdCompany.id
  });
  // LINK THE COMPANY TO THE USER
  const updatedCompany = await Company.findOneAndUpdate(
    { _id: createdCompany.id },
    { $set: { admin: createdUser.id }, $push: {employees: createdUser.id} },
    { new: true }
  );
  // GENERATE TOKEN
  const link = `http://localhost:3000/confirm/${createdUser.id}`;
  // SEND EMAIL
  const msg = {
    to: createdUser.email,
    from: 'thesis@thesis-codeworks.com',
    templateId: 'd-805812b3ecb841e78f44d7f78fe68536',
    dynamic_template_data: {
      appLink: link,
      senderName: createdUser.name
    },
  };
  await sgMail.send(msg);
  // COMPOSE RESPONSE
  ctx.body = { msg: 'Succesfully registered' };
};

exports.login = async ctx => {
  // CHECK INPUT
  const { email, password } = ctx.request.body;
  if (!email) ctx.throw(422, JSON.stringify({ error: 'Email required.' }));
  if (!password)
    ctx.throw(422, JSON.stringify({ error: 'Password required.' }));
  // CHECK IF USER EXISTS
  const user = await User.findOne({ email });
  if (!user) {
    ctx.throw(422, JSON.stringify({ error: 'This user doesn\'t exist' }));
  }
  // CHECK IF ITS COMPANY EXIST
  const company = await Company.findOne({ _id: user.company });
  if (!company) {
    ctx.throw(
      422,
      JSON.stringify({ error: 'This user is not connected to any company' })
    );
  }
  // CHECK IF THE USER IS VERIFIED
  if (!user.verified) {
    ctx.throw(
      422,
      JSON.stringify({ error: 'This user is not verified' })
    );
  }
  // CHECK IF THE PASSWORD IS CORRECT
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    ctx.throw(422, JSON.stringify({ error: 'Wrong credentials' }));
  }
  // GENERATE TOKEN
  const token = generateToken(user, company);
  // COMPOSE RESPONSE
  ctx.body = {
    name: user.name,
    companyName: company.name,
    companyId: company._id,
    id: user._id,
    token
  };
};

exports.confirmEmail = async ctx => {
  const { userId } = ctx.request.body;
  // CHECK INPUT
  if (!userId) ctx.throw(422, JSON.stringify({ error: 'UserId required.' }));
  // CHECK IF USER EXISTS
  
  const user = await User.findById( userId);
  if (!user)
    ctx.throw(422, JSON.stringify({ error: 'This user doesnt exist' }));
  // CHECK IF USER EXISTS
  const company = await Company.findOne({ admin: userId });
  if (!company)
    ctx.throw(422, JSON.stringify({ error: 'This company doesnt exist' }));
    // CHECK IF THE USER IS VERIFIED
  if (user.verified) {
    ctx.throw(
      422,
      JSON.stringify({ error: 'This user is already verified' })
    );
  }
  // UPDATE USER
  user.verified = true;
  await user.save();
  // UPDATE COMPANY
  company.verified = true;
  await company.save();
  ctx.body = { msg: 'Email succesfully confirmed' };
};
