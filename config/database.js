// const { Sequelize } = require('sequelize');

// const sequelize = new Sequelize('fyp', 'root', 'haroon1234', {
//     host: 'localhost',
//     dialect: 'mysql', // or 'postgres', 'sqlite', etc.
// });

// module.exports = sequelize;

const mysql2 = require('mysql2');

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('fyp', 'avnadmin', 'AVNS_8rvjJLYgYtsAun2UQpE', {
    host: 'haroon-fyp-atifr454-9682.e.aivencloud.com', // Correct host without http://
    dialect: 'mysql', // The database type
    port: 22896,
    dialectModule: mysql2,
    logging: false, // Set to false to disable logging

});

module.exports = sequelize;




