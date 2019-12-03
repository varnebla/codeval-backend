const Exercise = require('./../models/Exercise');
const Company = require('./../models/Company');
const User = require('./../models/User');

exports.getExercises = async ctx => {
  const { companyId } = ctx.request.jwtPayload;
  const result = await Company.findOne({ _id: companyId }).populate({
    path: 'exercises',
    model: Exercise,
    populate: [{ path: 'created_by', model: User, select: ['name', 'email'] }, { path: 'updated_by', model: User, select: ['name', 'email'] }],
  });
  ctx.body = result.exercises;
};

exports.getExercise = async ctx => {
  ctx.body = await Exercise.findOne({ _id: ctx.params.id });
  if (!ctx.params.id) ctx.throw(422, JSON.stringify({ error: 'Exercise id is required' }));
};


exports.createExercise = async ctx => {
  const { id, companyId } = ctx.request.jwtPayload;
  // CHECK INPUT
  const {
    title,
    difficulty,
    placeholderCode,
    examples,
    tests,
    instructions,
    hints,
    duration,
    solution
  } = ctx.request.body;
  if (!title) ctx.throw(422, JSON.stringify({ error: 'Title is required' }));
  if (!instructions)
    ctx.throw(422, JSON.stringify({ error: 'Instructions are required' }));
  if (!difficulty)
    ctx.throw(422, JSON.stringify({ error: 'Difficulty is required' }));
  if (!duration)
    ctx.throw(422, JSON.stringify({ error: 'Duration is required' }));
  if (!placeholderCode)
    ctx.throw(422, JSON.stringify({ error: 'Placeholder code is required' }));
  if (!tests) ctx.throw(422, JSON.stringify({ error: 'Tests are required' }));
  // CREATE THE EXERCISES
  const createdExercises = await Exercise.create({
    title,
    instructions,
    duration,
    examples,
    difficulty,
    placeholderCode,
    tests,
    hints: hints || [],
    solution: solution || '',
    created_at: new Date().toISOString(),
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

exports.updateExercise = async ctx => {
  const { id,  } = ctx.request.jwtPayload;
  const exerciseId = ctx.params.id;
  const {
    title,
    difficulty,
    duration,
    examples,
    placeholderCode,
    tests,
    instructions,
    hints,
    solution
  } = ctx.request.body;
  const exercise = await Exercise.findOne({ _id: exerciseId });
  const updatedExercise = Object.assign(exercise, ctx.request.body);
  updatedExercise.updated_by = id;
  updatedExercise.updated_at = new Date().toISOString()
  const result = await updatedExercise.save()
  ctx.body = result
}


exports.deleteExercise = async ctx => {
  const { companyId } = ctx.request.jwtPayload;
  const exerciseId = ctx.params.id;
  const exercise = await Exercise.findOne({ _id: exerciseId });
  if (!exercise) {
    ctx.throw(422, JSON.stringify({ error: ' Exercise doesnt exist' }));
  }
  if (companyId == exercise.company) {
    // REMOVE EXERCISE FROM COMPANY
    const companyExercises = await Company.findOne({ _id: companyId }).populate(
      {
        path: 'exercises',
        model: Exercise
      }
    );
    const filteredExercises = companyExercises.exercises.filter(elem => {
      return elem._id !== exerciseId;
    });
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
