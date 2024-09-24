const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('fyp', 'root', 'haroon1234', {
    host: 'localhost',
    dialect: 'mysql', // or 'postgres', 'sqlite', etc.
});

module.exports = sequelize;
