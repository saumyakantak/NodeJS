const Sequelize = require('sequelize');

const sequelize = new Sequelize('nodeJS', 'skk2', 'skk15', {
  host: 'localhost',
  dialect: 'mssql',
  port:"1433"
});

module.exports = sequelize;
