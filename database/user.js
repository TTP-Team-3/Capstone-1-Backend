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
    allowNull: false,
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
},{
    tableName: 'users', 
    timestamps: true, 
    createdAt: 'created_at', 
    updatedAt: 'updated_at',
});

// Instance method to check password
User.prototype.checkPassword = function (password) {
  if (!this.password_hash) {
    return false; // Auth0 users don't have passwords
  }
  return bcrypt.compareSync(password, this.password_hash);
};

// Class method to hash password
User.hashPassword = function (password) {
  return bcrypt.hashSync(password, 10);
};

module.exports = User;
