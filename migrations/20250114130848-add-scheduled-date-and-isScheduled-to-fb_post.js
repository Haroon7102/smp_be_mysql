'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('fb_post', 'scheduledDate', {
      type: Sequelize.DATE,
      allowNull: true, // You can set to `false` if you want to enforce it as a required field
    });

    await queryInterface.addColumn('fb_post', 'isScheduled', {
      type: Sequelize.BOOLEAN,
      defaultValue: false, // Set default value to false
      allowNull: false, // Make it non-nullable
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('fb_post', 'scheduledDate');
    await queryInterface.removeColumn('fb_post', 'isScheduled');
  },
};
