const { DataTypes } = require('sequelize'); 
const db = require('./db'); 

const Replies = db.define('replies', {
    id: {
        primaryKey: true, 
        autoIncrement: true, 
        type: DataTypes.INTEGER
    }, 

    echo_id: {
        type: DataTypes.INTEGER, 
        allowNull: false, 
        references: {
            model: 'echoes', 
            key: 'id'
        }
    }, 

    user_id: {
        type: DataTypes.INTEGER, 
        allowNull: false, 
        references: {
            model: 'users', 
            key: 'id'
        }
    }, 

    parent_reply_id: {
        type: DataTypes.INTEGER, 
        allowNull: true, 
        references: {
            model: 'replies', 
            key: 'id'
        } 
    }
}, {
    tableName: 'replies', 
    timestamps: true, 
    createdAt: 'created_at', 
    updatedAt: 'updated_at'
});

module.exports = Replies; 