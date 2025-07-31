const { DataTypes } = require("sequelize");
const db = require("./db");
const bcrypt = require("bcrypt");

const User = db.define("user", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true, 
    primaryKey: true, 
  },

  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  bio: {
    type: DataTypes.TEXT, 
    allowNull: true
  },

  avatar_url: {
    type: DataTypes.ENUM("image", "gif"), 
    allowNull: true,    
  },

  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    validate: {
      isEmail: true,
    },
  },

  auth0Id: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },

  password_hash: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: "Securely hashed password",
  },

  created_at: {
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW
  }
});

// Instance method to check password
User.prototype.checkPassword = function (password) {
  if (!this.passwordHash) {
    return false; // Auth0 users don't have passwords
  }
  return bcrypt.compareSync(password, this.passwordHash);
};

// Class method to hash password
User.hashPassword = function (password) {
  return bcrypt.hashSync(password, 10);
};

module.exports = User;
