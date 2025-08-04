const { DataTypes } = require("sequelize");
const db = require("/.db");

const Media = db.define("media", {
    id: {
        type: DataTypes.INTEGER, 
        primaryKey: true, 
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

    type: {
        type: DataTypes.ENUM('image', 'audio', 'video'),
        allowNull: false,
    }, 

    url: {
        type: DataTypes.STRING, 
        allowNull: false,
        validate: {
            isUrl: true
        }
    },

    file_size: {
        type: DataTypes.INTEGER, 
        allowNull: false
    }, 

    duration_seconds: {
        // only applies to audio or video 
        type: DataTypes.INTEGER,
        allowNull: true
    }, 

    thumbnail_url: {
        // optional thumbnail 
        type: DataTypes.STRING, 
        allowNull: true
    }
}, {
    timestamps: true,
    createdAt: 'created_at', 
    updatedAt: 'updated_at'
}); 

module.exports = Media; 
