import { DataTypes, Model } from 'sequelize';

import db from '../db/db';

export interface Exercise {
  userId: string;
  description: string;
  duration: number;
  date: string;
}

export class ExerciseInstance extends Model<Exercise> {}

ExerciseInstance.init(
  {
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0, 
      },
    },
    date: {
      type: DataTypes.DATEONLY, 
      allowNull: false,
    },
  },
  {
    sequelize: db,
    tableName: 'exercises', 
  }
);