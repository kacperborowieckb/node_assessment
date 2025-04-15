import { DataTypes, Model } from 'sequelize';

import db from '../db/db';

interface User {
  id: string;
  username: string;
}

export class UserInstance extends Model<User> {}

UserInstance.init(
  {
    id: {
      type: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: db,
    tableName: 'users',
  }
);
