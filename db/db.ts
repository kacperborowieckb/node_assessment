import { Sequelize } from "sequelize";

const db = new Sequelize({
    storage: './database.sqlite',
    dialect: 'sqlite',
    logging: false
})

export default db