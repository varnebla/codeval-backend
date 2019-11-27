const Application = require('./../models/Application');
const Exercise = require('./../models/Exercise');
const Company = require('./../models/Company');
const User = require('./../models/User');

//TODO// FIX API KEY THAT IS NOT INJECTED FRON .ENV
const sgMail = require('@sendgrid/mail');
//const api = process.env.SENDGRID_API_KEY
sgMail.setApiKey(
  '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'
);

// GET ALL APPLIATIONS FROM COMPANY DASHBOARD
exports.getApplications = async ctx => {
  const { companyId } = ctx.request.jwtPayload;
  const result = await Company.findOne({ _id: companyId }).populate({
    path: 'applications',
    model: Application,
    populate: { path: 'created_by', model: User, select: ['name', 'email'] }
  });
  ctx.body = result.applications;
};

// GET SINGLE APPLICATION FROM APPLICANT BRIEFING PAGE
exports.getApplication = async ctx => {
  ctx.body = await Application.findOne({ _id: ctx.params.id }).populate([
    {
      path: 'exercise',
      model: Exercise
    },
    {
      path: 'created_by',
      model: User,
      select: ['name', 'email']
    }
  ]);
};

// POST REQUEST AFTER BRIEFING SUBMISSION
exports.startApplication = async ctx => {
  const { applicantName } = ctx.request.body;
  // CHECK INPUT
  if (!applicantName)
    ctx.throw(422, JSON.stringify({ error: 'Applicant name is required' }));
  // CHECK IT'S STILL VALID (EXPIRATION TIME)
  const app = await Application.findOne({ _id: ctx.params.id });
  if (Date.now() - app.created_at > app.token_duration)
    ctx.throw(422, JSON.stringify({ error: 'Token link expired' }));
  // CHECK IT HAS NEVER BEEN ACTIVATED
  if (app.status !== 'issued')
    ctx.throw(422, JSON.stringify({ error: 'This application is expired' }));
  // UPDATE THE APPLICATION
  await Application.findOneAndUpdate(
    { _id: ctx.params.id },
    { $set: { applicantName: applicantName, status: 'activated' } },
    { new: true }
  );
  ctx.body = 'successfully started';
};

// CREATE APPLICATION FROM COMPANY DASHBOARD
exports.createApplication = async ctx => {
  const { id, companyId } = ctx.request.jwtPayload;
  // CHECK INPUT
  const { exercise, applicantEmail, token_duration } = ctx.request.body;
  if (!exercise)
    ctx.throw(422, JSON.stringify({ error: 'Exercise id is required' }));
  if (!applicantEmail)
    ctx.throw(422, JSON.stringify({ error: 'Applicant email is required' }));
  if (!token_duration)
    ctx.throw(
      422,
      JSON.stringify({ error: 'Email token duration is required' })
    );
  // CHECK THAT THE EXERCISE EXISTS AND IS OWNED BY THE COMPANY
  const chosenExercise = await Exercise.findOne({ _id: exercise });
  if (chosenExercise.company == !companyId) {
    ctx.throw(
      422,
      JSON.stringify({
        error: 'Exercise not found or not related to your company'
      })
    );
  }
  // CREATE THE EXERCISES
  const createdApplication = await Application.create({
    exercise,
    applicantEmail,
    created_by: id,
    created_at: new Date().toISOString(),
    company: companyId,
    token_duration
  });
  // LINK THE APPLICATION TO THE COMPANY
  await Company.findOneAndUpdate(
    { _id: companyId },
    { $push: { applications: createdApplication.id } },
    { new: true }
  );
  // SEND EMAIL TO APPLICANT
  const msg = {
    to: applicantEmail,
    from: 'thesis@codeworks.com',
    subject: 'Your link to the coding interview',
    text: 'Ciao',
    html: `<p>Bonjour!</p><p>Voici votre mot de passe provisoire:</p><a href='http://localhost:3000/${createdApplication._id}'>link text</a> <p>Cordialement,</p> <p>Infogène Lyon</p>`
  };
  await sgMail.send(msg);
  // FINISH
  ctx.body = 'Application succesfully created';
};