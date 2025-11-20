import { Sequelize } from 'sequelize-typescript';

async function addLastMessageColumn() {
  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite',
    logging: console.log,
  });

  try {
    await sequelize.authenticate();
    console.log('Connected to database');

    await sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN lastMessage DATETIME;
    `);

    console.log('Successfully added lastMessage column');
  } catch (error: any) {
    if (error.message?.includes('duplicate column name')) {
      console.log('Column lastMessage already exists');
    } else {
      console.error('Error adding column:', error);
    }
  } finally {
    await sequelize.close();
  }
}

addLastMessageColumn();
