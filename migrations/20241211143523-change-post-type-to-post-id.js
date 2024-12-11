'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Drop the old 'postType' column if you no longer need it
    await queryInterface.removeColumn('fb_post', 'postTypes');

    // Add a new column 'postId' to store the Facebook post ID
    await queryInterface.addColumn('fb_post', 'postId', {
      type: Sequelize.STRING, // Assuming postId is a string, adjust based on your needs
      allowNull: true, // Adjust depending on whether this field can be null
    });
  },

  down: async (queryInterface, Sequelize) => {
    // In case of rollback, remove the 'postId' column and add back 'postType'
    await queryInterface.removeColumn('fb_post', 'postId');
    await queryInterface.addColumn('fb_post', 'postTypes', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  }
};


