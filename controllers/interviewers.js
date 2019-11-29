const Exercise = require('./../models/Exercise');
const Company = require('./../models/Company');
const User = require('./../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function generateToken (user, companyId) {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      companyId: companyId
    },
    process.env.SECRET_KEY,
    { expiresIn: '24h' }
  );
}

//TODO// FIX API KEY THAT IS NOT INJECTED FRON .ENV
const sgMail = require('@sendgrid/mail');
//const api = process.env.SENDGRID_API_KEY
sgMail.setApiKey(
  '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'
);

exports.getInterviewers = async ctx => {
  const { companyId } = ctx.request.jwtPayload;
  const result = await Company.findOne({ _id: companyId }).populate({
    path: 'employees',
    model: User
  });
  ctx.body = result.employees;
};

exports.inviteInteviewer = async ctx => {
  const { companyId, id } = ctx.request.jwtPayload;
  const { interviewerEmail } = ctx.request.body;
  if (!interviewerEmail)
    ctx.throw(422, JSON.stringify({ error: 'Interviewer email is required' }));
  // FIND THE SENDER
  const sender = await User.findOne({ _id: id });
  if (!sender) ctx.throw(422, JSON.stringify({ error: 'Sender not found' }));
  // FIND THE COMPANY
  const company = await Company.findOne({ _id: companyId });
  if (!company) ctx.throw(422, JSON.stringify({ error: 'Company not found' }));
  // CREATE USER
  const createdInterviewer = await User.create({
    email: interviewerEmail,
    created_at: new Date().toISOString(),
    company: company.id
  });
  // CONNECT COMPANY TO USER
  const updatedCompany = await Company.findOneAndUpdate(
    { _id: companyId },
    { $push: { employees: createdInterviewer.id } },
    { new: true }
  );
  // SEND EMAIL TO USER
  const link = `http://localhost:3000/inviteInterviewer/${createdInterviewer._id}`;
  const msg = {
    to: createdInterviewer.email,
    from: 'thesis@codeworks.com',
    templateId: 'd-8523a802998043f1af5e95a330653c5f',
    dynamic_template_data: {
      appLink: link,
      companyName: updatedCompany.name,
      senderName: sender.name
    }
  };
  await sgMail.send(msg);
  // RETURN SOMETHING
  ctx.body = JSON.stringify({ message: 'successfully invited' });
};

exports.registerInterviewer = async ctx => {
  const { name, password } = ctx.request.body;
  if (!name) ctx.throw(422, JSON.stringify({ error: 'Name required.' }));
  if (!password)
    ctx.throw(422, JSON.stringify({ error: 'Password required.' }));
  // HASH PASSWORD
  hashedPassword = await bcrypt.hash(password, 12);
  // LINK THE COMPANY TO THE USER
  const updatedInterviewer = await User.findOneAndUpdate(
    { _id: ctx.params.id },
    { $set: { name: name, password: hashedPassword, verified: true } },
    { new: true }
  );
  // GENERATE TOKEN
  const token = generateToken(updatedInterviewer, updatedInterviewer.company);
  // COMPOSE RESPONSE
  ctx.body = {
    name: updatedInterviewer.name,
    companyId: updatedInterviewer.company,
    id: updatedInterviewer._id,
    token
  };
};
