const { DataTypes } = require("sequelize"); 
const db = require("./db"); 

const Reports = db.define("reports", {
    id: {
        primaryKey: true, 
        type: DataTypes.INTEGER, 
        autoIncrement: true 
    }, 

    echo_id: {
        type: DataTypes.INTEGER, 
        allowNull: false, 
        references: {
            model: 'echoes',
            key: 'id'
        }
    },

    reporter_id: {
        type: DataTypes.INTEGER, 
        allowNull: false, 
        references: {
            model: 'users',
            key: 'id'
        }
    }, 

    type: {
        type: DataTypes.ENUM('spam', 'harrassment', 'hate_speech', 'explicit', 'other'),
        allowNull: false, 
    }, 

    reasons: {
        // option message for report 
        type: DataTypes.TEXT, 
        allowNull: true 
    }, 

    status: {
        type: DataTypes.ENUM('pending', 'reviewed', 'dismissed'), 
        allowNull: false, 
        defaultValue: 'pending'
    }, 

    reviewed_at: {
        type: DataTypes.DATE, 
        allowNull: true
    }
}, {
    timestamps: true, 
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = Reports; 