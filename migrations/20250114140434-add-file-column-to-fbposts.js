'use strict';

/** @type {import('sequelize-cli').Migration} */
// migrations/{timestamp}-add-file-column-to-fbposts.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('fb_post', 'file', {
      type: Sequelize.BLOB('long'), // Use BLOB for binary files, or Sequelize.TEXT for Base64
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('fb_post', 'file');
  },
};

