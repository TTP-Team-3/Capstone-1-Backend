const { DataTypes } = require("sequelize");
const db = require("./db");

const Echoes = db.define(
  "echoes",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    echo_name: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users", // target table
        key: "id",
      },
    },

    recipient_type: {
      type: DataTypes.ENUM("self", "friend", "public", "custom"),
      allowNull: false,
    },

    image_uuids: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      allowNull: false,
      defaultValue: [],
    },

    signed_urls: {
      type: DataTypes.ARRAY(DataTypes.TEXT("long")),
      allowNull: false,
      defaultValue: [],
    },

    text: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    unlock_datetime: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    is_unlocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },

    is_archived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },

    is_saved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },

    show_sender_name: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },

    location_locked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    lat: {
      type: DataTypes.DECIMAL(9, 6),
      allowNull: true,
    },

    lng: {
      type: DataTypes.DECIMAL(9, 6),
      allowNull: true,
    },
  },
  {
    tableName: "echoes",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

module.exports = Echoes;
