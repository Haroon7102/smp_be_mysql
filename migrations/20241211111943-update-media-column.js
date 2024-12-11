'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('fb_post', 'media', {
      type: Sequelize.JSON,  // Change the column type to JSON
      allowNull: true,       // Allow null if needed
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('fb_post', 'media', {
      type: Sequelize.TEXT,  // Revert the column type to TEXT if rolling back
      allowNull: true,       // Allow null if needed
    });
  }
};

