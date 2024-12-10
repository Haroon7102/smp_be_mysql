'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('fb_post', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users', // Ensure 'users' table exists in your database
          key: 'id',
        },
        onDelete: 'CASCADE', // Optional, depends on your requirements
      },
      pageId: {
        type: Sequelize.STRING(255), // Adjust length as necessary
        allowNull: false,
      },
      pageName: {
        type: Sequelize.STRING(255), // Adjust length as necessary
        allowNull: true,
      },

      accessToken: {
        type: Sequelize.TEXT, // Use TEXT to handle large tokens if necessary
        allowNull: false,
      },
      message: {
        type: Sequelize.TEXT, // Use TEXT for long messages
        allowNull: true,
      },
      media: {
        type: Sequelize.TEXT, // Use TEXT to store large media URLs or serialized data
        allowNull: true, // Optional: can be null if no media is associated with the post
      },
      postTypes: {
        type: Sequelize.JSON, // Use JSON to store multiple post types or attributes
        allowNull: true, // Optional: can be null if no post type is assigned
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('fb_post');
  },
};
