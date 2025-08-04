const { DataTypes } = require('sequelize');
const db = require('./db');

const Reactions = db.define('reactions', {
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

    user_id: {
        type: DataTypes.INTEGER, 
        allowNull: false, 
        references: {
            model: 'users',
            key: 'id'
        }
    }, 

    type: {
        type: DataTypes.ENUM('sad', 'funny', 'happy'),
        allowNull: false
    }
}, {
    timestamps: true, 
    createdAt: 'created_at',
    updatedAt: 'updated_at', 
    indexes: [{
        unique: true, 
        fields: ['user_id', 'echo_id'],
        name: 'unique_user_echo_reaction_pair'
    }]
});

module.exports = Reactions;
