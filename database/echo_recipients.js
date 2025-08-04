const { DataTypes } = require("sequelize");
const db = require("./db");

const Echo_recipients = db.define("echo_recipients", {
    echo_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false, 
        references: {
            model: 'echoes', // target table name 
            key: 'id'
        }, 
    },

    recipient_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
            model: 'users', // target table name
            key: 'id'
        }, 
    }
}, {
    tableName: 'echo_recipients',
    timestamps: false
});

module.exports = Echo_recipients;
