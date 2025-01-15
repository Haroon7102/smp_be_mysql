// SchPost.js - Sequelize model definition for the sch_post table
'use strict';

module.exports = (sequelize, DataTypes) => {
    const SchPost = sequelize.define('SchPost', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        caption: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        scheduledDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        pageId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        accessToken: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        postType: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        file: {
            type: DataTypes.BLOB('long'), // Use BLOB for binary files, or change if storing Base64 as text
            allowNull: true,
        },
        isScheduled: {
            type: DataTypes.BOOLEAN, // This will map to your isScheduled column
            defaultValue: false,     // Default value set to false
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    }, {
        tableName: 'sch_post', // Match the table name in the database
        timestamps: true,      // Enable automatic handling of createdAt and updatedAt
    });

    return SchPost;
};
