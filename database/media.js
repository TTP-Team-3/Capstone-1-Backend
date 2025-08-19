const { DataTypes } = require("sequelize");
const db = require("./db");

const Media = db.define(
  "media",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    echo_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "echoes",
        key: "id",
      },
    },

    reply_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "replies",
        key: "id",
      },
    },

    type: {
      type: DataTypes.ENUM("image", "audio", "video"),
      allowNull: false,
    },

    uuid: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    file_size: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },

    duration_seconds: {
      // only applies to audio or video
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    signed_url: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
      defaultValue: "",
    },
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    validate: {
      eitherEchoOrReply() {
        if (!this.echo_id && !this.reply_id) {
          throw new Error("Media must belong to either an echo or reply.");
        }
        if (this.echo_id && this.reply_id) {
          throw new Error("Media cannot belong to both an echo and a reply.");
        }
      },
    },
  },
);

module.exports = Media;
