import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('web1_test', 'web1_test1', '!Qayxsw2', {
  host: 'localhost',
  dialect: 'mysql'
});

export default sequelize;
