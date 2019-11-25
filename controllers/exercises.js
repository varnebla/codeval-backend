const Exercise = require('./../models/Exercise');
const Company = require('./../models/Company');

exports.getExercises = async ctx => {
  const { companyId } = ctx.request.jwtPayload;
  const result = await Company.findOne({ _id: companyId }).populate({
    path: 'exercises',
    model: Exercise
  });
  ctx.body = result.exercises;
};

exports.createExercise = async ctx => {
  const { id, companyId } = ctx.request.jwtPayload;
  // CHECK INPUT
  const { title, difficulty, placeholderCode, tests } = ctx.request.body;
  if (!title) ctx.throw(422, JSON.stringify({ error: 'Title is required' }));
  if (!difficulty)
    ctx.throw(422, JSON.stringify({ error: 'Difficulty is required' }));
  if (!placeholderCode)
    ctx.throw(422, JSON.stringify({ error: 'Placeholder code is required' }));
  if (!tests) ctx.throw(422, JSON.stringify({ error: 'Tests are required' }));
  // CREATE THE EXERCISES
  const createdExercises = await Exercise.create({
    title,
    difficulty,
    placeholderCode,
    tests,
    createdAt: new Date().toISOString(),
    created_by: id,
    company: companyId
  });
  // LINK THE COMPANY TO THE USER
  await Company.findOneAndUpdate(
    { _id: companyId },
    { $push: { exercises: createdExercises.id } },
    { new: true }
  );
  ctx.body = 'Exercise created';
  ctx.status = 201;
};

exports.deleteExercise = async ctx => {
  const { companyId } = ctx.request.jwtPayload;
  const exerciseId = ctx.params.id;
  const exercise = await Exercise.findOne({ _id: exerciseId });
  if (!exercise) {
    ctx.throw(422, JSON.stringify({ error: ' Exercise doesnt exist'}));
  }
  console.log(exercise.company);
  console.log(companyId);
  if (companyId == exercise.company) {
    // REMOVE EXERCISE FROM COMPANY
    const companyExercises = await Company.findOne({ _id: companyId }).populate(
      {
        path: 'exercises',
        model: Exercise
      }
    );
    console.log('company exercises', companyExercises);
    const filteredExercises = companyExercises.exercises.filter(elem => {
      return elem._id !== exerciseId;
    });
    console.log('filtered exercises', filteredExercises);
    await Company.findOneAndUpdate(
      { _id: companyId },
      { $set: { exercises: filteredExercises } },
      { new: true }
    );
    // DELETE EXERCISE
    await Exercise.deleteOne({ _id: exerciseId });
  } else {
    ctx.throw(422, JSON.stringify({ error: 'Not authorized' }));
  }
  ctx.status = 200;
};
