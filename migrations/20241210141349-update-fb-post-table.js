

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add the 'email' column
    await queryInterface.addColumn('fb_post', 'email', {
      type: Sequelize.STRING(255),
      allowNull: false,
      references: {
        model: 'Users', // Ensure 'Users' table exists in your database
        key: 'email',
      },
      onDelete: 'CASCADE', // Optional: adjusts behavior on user deletion
    });

    // Remove the 'userId' column
    await queryInterface.removeColumn('fb_post', 'userId');
  },

  down: async (queryInterface, Sequelize) => {
    // Re-add the 'userId' column
    await queryInterface.addColumn('fb_post', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    // Remove the 'email' column
    await queryInterface.removeColumn('fb_post', 'email');
  },
};
