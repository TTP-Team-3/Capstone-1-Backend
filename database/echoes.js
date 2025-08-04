const { DataTypes } = require("sequelize");
const db = require("./db");

const Echoes = db.define("echoes", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true, 
    primaryKey: true, 
  },

  sender_id: {
    type: DataTypes.INTEGER,
    allowNull: false, 
    references: {
      model: 'users', // target table 
      key: 'id'
    }
 },

 type: {
    type: DataTypes.ENUM("self", "friend", "public"),
    allowNull: false,
 },

 text: {
    type: DataTypes.STRING,
    allowNull: true, 
 },

 unlock_datetime: {
    type: DataTypes.DATE, 
    allowNull: false
 },

 is_unlocked: {
    type: DataTypes.VIRTUAL,
    get() {
        const now = new Date();
        return now >= this.unlock_datetime; 
    }
 },

 is_archived: {
    type: DataTypes.BOOLEAN, 
    defaultValue: false, 
    allowNull: false,
 },

 show_sender_name: {
    type: DataTypes.BOOLEAN,
    defaultValue: false, 
    allowNull: false, 
 }

}, {
    tableName: 'echoes', 
    timestamps: true, 
    createdAt: 'created_at', 
    updatedAt: 'updated_at',
});

module.exports = Echoes;
