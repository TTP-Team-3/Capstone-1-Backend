const { DataTypes } = require("sequelize"); 
const db = require("./db");

const Tags = db.define("tags", {
    id: {
        type: DataTypes.INTEGER,  
        primaryKey: true, 
        allowNull: false, 
        autoIncrement: true, // auto generated tags IDs
    }, 

    name: {
        type: DataTypes.TEXT, 
        allowNull: false,
    }
}, {
    tableName: 'tags',
    timestamps: true
});

module.exports = Tags; 
