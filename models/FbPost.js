// models/FbPost.js

module.exports = (sequelize, DataTypes) => {
    const FbPost = sequelize.define('FbPost', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        email: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users', // Ensure the 'Users' model exists
                key: 'email',
            },
            onDelete: 'CASCADE', // Ensures related posts are deleted if the user is deleted
        },
        pageId: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        pageName: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        accessToken: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        media: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        postId: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        mediaUrl: {
            type: DataTypes.JSON,
            allowNull: true,
            // Add the new column here
        },
        scheduledDate: {
            type: DataTypes.DATE,  // This will map to your scheduledDate column in the database
            allowNull: true,       // You can change this to false if necessary
        },
        isScheduled: {
            type: DataTypes.BOOLEAN, // This will map to your isScheduled column
            defaultValue: false,     // Default value set to false
            allowNull: false,
        },
        file: {
            type: DataTypes.BLOB('long'), // Change this if using TEXT for Base64
            allowNull: true,
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
        tableName: 'fb_post', // The table name as defined in the migration
        timestamps: true, // Ensures `createdAt` and `updatedAt` are handled automatically
    });

    // Associations
    // FbPost.associate = (models) => {
    //     FbPost.belongsTo(models.User, { foreignKey: 'userId' });
    // };

    return FbPost;
};
