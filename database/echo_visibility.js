const { DataTypes} = require("sequelize");
const db = require("./db");

const Echo_visibility = db.define("echo_visibility", {
  echo_id: {
    type: DataTypes.INTEGER,
    primaryKey: true, 
    allowNull: false,
    references: {
        model: 'echoes', 
        key: 'id'
    }
  },

  note: {
    type: DataTypes.TEXT, 
    allowNull: true
  }
}, {
    tableName: 'echo_visibility',
    timestamps: false,
});

module.exports = Echo_visibility;
