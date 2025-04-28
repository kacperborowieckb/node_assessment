import { Request, Response } from 'express';
import { Exercise, ExerciseInstance, UserInstance } from '../models';
import { Op, WhereOptions } from 'sequelize';
import dayjs from 'dayjs';

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

    await UserInstance.create(newUserData);
    
    res.status(201).json(newUserData);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

type UserExerciseParams = {
  id: string;
};

type CreateUserExercisePayload = {
  date?: string;
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

    if (!description || !duration) {
      res.status(400).json({ message: 'All exercise fields are required' });

      return;
    }

    const user = await UserInstance.findByPk(userId);

    if (!user) {
      res.status(404).json({ message: 'User not found' });

      return;
    }

    const newExerciseData: Partial<Exercise> = {
      description,
      duration: Number(duration),
      userId,
    };

    if (date) {
      const parsedDate = dayjs(date, 'YYYY-MM-DD', true);

      if (!parsedDate.isValid()) {
        res.status(400).json({ message: 'Invalid date' });
        return;
      }

      newExerciseData.date = parsedDate.toISOString();
    }

    const exercise = await ExerciseInstance.create(newExerciseData as Exercise);

    res.status(201).json({ ...exercise.dataValues, username: user.dataValues.username});
  } catch (error: any) {
    if (error.errors[0].type === 'Validation error') {
      res.status(400).json({
        message: 'Duration should be positive number greater or equal 0.01',
      });
      console.error('Error creating exercise: ', error);

      return;
    }

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

    const isValidFrom = from ? dayjs(from, 'YYYY-MM-DD', true).isValid() : true;
    const isValidTo = to ? dayjs(to, 'YYYY-MM-DD', true).isValid() : true;

    const isLimitValid = limit ? !isNaN(Number(limit)) && Number(limit) > 0 && Number.isInteger(Number(limit)) : true;

    if (!isValidFrom || !isValidTo) {
      res.status(400).json({ message: 'Invalid date query params' });

      return
    }

    if (!isLimitValid) {
      res.status(400).json({ message: 'Limit query param should be positive integer' });

      return
    }

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

    const count = await ExerciseInstance.count({
      where: query,
    });

    const exercises = await ExerciseInstance.findAll({
      where: query,
      order: [['date', 'ASC']],
      limit,
      attributes: ['description', 'duration', 'date', 'id'],
    });

    const { username, id } = user.dataValues;

    res.status(200).json({
      username,
      id,
      count,
      logs: exercises,
    });
  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export default { getUsers, createUser, createUserExercise, getUserExercises };
