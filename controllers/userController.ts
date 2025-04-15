import { Request, Response } from 'express';

import { Exercise, ExerciseInstance, UserInstance } from '../models';
import { Op, WhereOptions } from 'sequelize';

async function getUsers(req: Request, res: Response) {
  const users = await UserInstance.findAll();

  res.status(200).json({ users });
}

type CreateUserPayload = { username: string };

async function createUser(
  req: Request<{}, {}, CreateUserPayload>,
  res: Response
) {
  const { username } = req.body;

  if (!username) {
    res.status(401).json({ message: req.body });

    return;
  }

  const newUserData = {
    id: crypto.randomUUID(),
    username,
  };

  const user = await UserInstance.create(newUserData);

  res.status(201).json({ user });
}

type UserExerciseParams = {
  id: string;
};

type CreateUserExercisePayload = {
  date: string;
  duration: number;
  description: string;
};

async function createUserExercise(
  req: Request<UserExerciseParams, {}, CreateUserExercisePayload>,
  res: Response
) {
  const { date, description, duration } = req.body;

  const newExerciseData: Exercise = {
    description,
    duration,
    date,
    userId: req.params.id,
  };

  const exercise = await ExerciseInstance.create(newExerciseData);

  res.status(201).json({ exercise });
}

type GetUserExercisesPayload = {
  from?: string;
  to?: string;
  limit?: number;
};

async function getUserExercises(
  req: Request<UserExerciseParams, {}, GetUserExercisesPayload>,
  res: Response
) {
  const { from, limit, to } = req.body;
  const { id: userId } = req.params;

  const query: WhereOptions<Exercise> = { userId };

  if (from && to) {
    query.date = { [Op.between]: [from, to] };
  } else {
    if (from) {
      query.date = { [Op.gte]: from, to };
    }

    if (to) {
      query.date = { [Op.lte]: to };
    }
  }

  const exercises = await ExerciseInstance.findAll({
    where: query,
    limit,
  });

  return res.status(200).json(exercises);
}

export default { getUsers, createUser, createUserExercise, getUserExercises };
