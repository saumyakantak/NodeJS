const Sequelize = require('sequelize');


const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_HOST, 'skk15', {
  host: 'localhost',
  dialect: 'mssql',
  port:"1433"
});

module.exports = sequelize;
