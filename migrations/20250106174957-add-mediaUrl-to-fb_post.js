'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('fb_post', 'mediaUrl', {
      type: Sequelize.TEXT,
      allowNull: true, // Allow NULL values if not all posts have a media URL
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('fb_post', 'mediaUrl');
  },
};
