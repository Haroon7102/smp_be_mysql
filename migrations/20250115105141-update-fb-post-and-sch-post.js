'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove columns from 'fb_post' table
    await queryInterface.removeColumn('fb_post', 'scheduledDate');
    await queryInterface.removeColumn('fb_post', 'isScheduled');
    await queryInterface.removeColumn('fb_post', 'file');

    // Add 'isScheduled' column to 'sch_post' table
    await queryInterface.addColumn('sch_post', 'isScheduled', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,  // You can change the default if needed
    });
  },

  down: async (queryInterface, Sequelize) => {
    // In case of rollback, only remove the 'isScheduled' column from 'sch_post' table
    await queryInterface.removeColumn('sch_post', 'isScheduled');
  }
};

