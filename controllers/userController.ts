import { Request, Response } from 'express';
import { Exercise, ExerciseInstance, UserInstance } from '../models';
import { Op, WhereOptions } from 'sequelize';

async function getUsers(req: Request, res: Response) {
  try {
    const users = await UserInstance.findAll();
    res.status(200).json({ users });
  } catch (error) {
    console.error('Error getting users: ', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

type CreateUserPayload = { username: string };

async function createUser(
  req: Request<{}, {}, CreateUserPayload>,
  res: Response
) {
  try {
    const { username } = req.body;

    if (!username) {
      res.status(400).json({ message: 'Username is required' });

      return;
    }

    const existingUser = await UserInstance.findOne({ where: { username } });
    if (existingUser) {
      res.status(409).json({ message: 'Username already exists' });

      return;
    }

    const newUserData = {
      id: crypto.randomUUID(),
      username,
    };

    const user = await UserInstance.create(newUserData);
    res.status(201).json({ user });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
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
  try {
    const { date, description, duration } = req.body;
    const { id: userId } = req.params;

    if (!date || !description || !duration) {
      res.status(400).json({ message: 'All exercise fields are required' });

      return;
    }

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      res.status(400).json({ message: 'Invalid date format' });
      return;
    }

    const user = await UserInstance.findByPk(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });

      return;
    }

    const newExerciseData: Exercise = {
      description,
      duration,
      date,
      userId,
    };

    const exercise = await ExerciseInstance.create(newExerciseData);
    res.status(201).json({ exercise });
  } catch (error) {
    console.error('Error creating exercise: ', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

type GetUserExercisesQuery = {
  from?: string;
  to?: string;
  limit?: number;
};

async function getUserExercises(
  req: Request<UserExerciseParams, {}, {}, GetUserExercisesQuery>,
  res: Response
) {
  try {
    const { from, limit, to } = req.query;
    const { id: userId } = req.params;

    const user = await UserInstance.findByPk(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });

      return;
    }

    const query: WhereOptions<Exercise> = { userId };

    if (from && to) {
      query.date = { [Op.between]: [from, to] };
    } else {
      if (from) {
        query.date = { [Op.gte]: from };
      }
      if (to) {
        query.date = { [Op.lte]: to };
      }
    }


    const exercises = await ExerciseInstance.findAll({
      where: query,
      limit,
    });

    res.status(200).json(exercises);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export default { getUsers, createUser, createUserExercise, getUserExercises };
