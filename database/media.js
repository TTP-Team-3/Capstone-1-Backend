const { DataTypes } = require("sequelize");
const db = require("./db");

const Media = db.define("media", {
    id: {
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true
    },

    echo_id: {
        type: DataTypes.INTEGER,
        allowNull: true, 
        references: {
            model: 'echoes',
            key: 'id'
        }
    }, 

    reply_id: {
        type: DataTypes.INTEGER,
        allowNull: true, 
        references: {
            model: 'replies',
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
    updatedAt: 'updated_at',
    validate: {
        eitherEchoOrReply() {
            if (!this.echo_id && !this.reply_id) {
                throw new Error('Media must belong to either an echo or reply.');
            }
            if (this.echo_id && this.reply_id) {
                throw new Error('Media cannot belong to both an echo and a reply.');
            }
        }
    }
}); 

module.exports = Media; 
