const { DataTypes } = require("sequelize");
const db = require("./db");

const Echo_tags = db.define('echo_tags', {
    echo_id: {
        type: DataTypes.INTEGER, 
        allowNull: false, 
        primaryKey: true,
        references: {
            model: "echoes", // target table  
            key: "id"
        }
    }, 

    tag_id: {
        type: DataTypes.INTEGER, 
        allowNull: false,
        primaryKey: true, 
        references: {
            model: "tags",
            key: "id"
        }
    }
}, {
    tableName: 'echo_tas',
    timestamps: false
});

module.exports = Echo_tags; 
