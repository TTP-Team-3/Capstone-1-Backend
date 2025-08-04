const { DataTypes } = require("sequelize");
const db = require("./db"); 

const Friends = db.define("friends", {
    id: {
        primaryKey: true, 
        type: DataTypes.INTEGER, 
        autoIncrement: true 
    },

    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {
            model: 'users',
            key: 'id'
        }
    },

    friend_id: {
        type: DataTypes.INTEGER, 
        allowNull: false,
        references: {
            model: 'users', 
            key: 'id'
        }
    }, 

    status: {
        type: DataTypes.ENUM('pending', 'accepted', 'blocked'),
        allowNull: false, 
        defaultValue: 'pending'
    }
}, {
    tableName: 'friends', 
    timestamps: true, 
    createdAt: 'created_at', 
    updatedAt: 'updated_at',
    indexes: [
        {
            unique: true, 
            fields: ['user_id', 'friend_id'],
            name: 'unique_user_friend_pair'
        }
    ]
});

module.exports = Friends;