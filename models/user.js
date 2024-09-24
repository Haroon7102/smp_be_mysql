const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true
    },

    googleId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    }
  });

  // Hash password before saving
  // User.beforeCreate(async (user) => {
  //   if (user.password) {
  //     const salt = await bcrypt.genSalt(10);
  //     user.password = await bcrypt.hash(user.password, salt);
  //     console.log("Hashed password before saving:", user.password);
  //   }
  // });

  return User;
};
