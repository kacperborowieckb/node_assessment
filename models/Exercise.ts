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
      type: DataTypes.NUMBER,
      allowNull: false,
      validate: {
        min: 0.01, 
        isNumeric: true,
      },
    },
    date: {
      type: DataTypes.DATEONLY, 
      allowNull: true,
      defaultValue: DataTypes.NOW
    },
  },
  {
    sequelize: db,
    tableName: 'exercises', 
  }
);