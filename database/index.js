const db = require("./db");
const User = require("./user");
const Echoes = require('./echoes');
const Echo_visibility = require('./echo_visibility');
const Echo_recipients = require('./echo_recipients');
const Echo_tags = require('./echo_tags');
const Friends = require('./friends');
const Media = require('./media');
const Reactions = require('./reactions');
const Replies = require('./replies');
const Reports = require('./reports');
const Tags = require('./tags');

//--------Defining associations-------------

// Echoes <> user (sender)
Echoes.belongsTo(User, {
  foreignKey: 'user_id', 
  as: 'sender', 
  onDelete: 'CASCADE', 
  onUpdate: 'CASCADE'
});
User.hasMany(Echoes, {
  foreignKey: 'user_id', 
  as: 'sent_echoes', 
  onDelete: 'CASCADE', 
  onUpdate: 'CASCADE'
});

// Echoes <> media 
Echoes.hasMany(Media, {
  foreignKey: 'echo_id', 
  onDelete: 'CASCADE', 
  onUpdate: 'CASCADE'
});
Media.belongsTo(Echoes, {
  foreignKey: 'echo_id', 
  onDelete: 'CASCADE', 
  onUpdate: 'CASCADE'
});

// Replies <> Echoes 
Replies.belongsTo(Echoes, {
  foreignKey: 'echo_id', 
  onDelete: 'CASCADE', 
  onUpdate: 'CASCADE'
});
Echoes.hasMany(Replies, {
  foreignKey: 'echo_id', 
  onDelete: 'CASCADE', 
  onUpdate: 'CASCADE'
});

// Replies <> User 
Replies.belongsTo(User, {
  foreignKey: 'user_id', 
  onDelete: 'CASCADE', 
  onUpdate: 'CASCADE'
});
User.hasMany(Replies, {
  foreignKey: 'user_id', 
  onDelete: 'CASCADE', 
  onUpdate: 'CASCADE'
});

// Replies <> Replies (nested replies)
Replies.belongsTo(Replies, {
  foreignKey: 'parent_reply_id', 
  as: 'parent_reply', 
  onDelete: 'CASCADE', 
  onUpdate: 'CASCADE'
});
Replies.hasMany(Replies, {
  foreignKey: 'parent_reply_id', 
  as: 'child_replies', 
  onDelete: 'CASCADE', 
  onUpdate: 'CASCADE'
});

// Media <> Replies 
Media.belongsTo(Replies, {
  foreignKey: 'reply_id', 
  onDelete: 'CASCADE', 
  onUpdate: 'CASCADE'
});
Replies.hasMany(Media, {
  foreignKey: 'reply_id', 
  onDelete: 'CASCADE', 
  onUpdate: 'CASCADE'
});

// Reactions <> Echoes 
Reactions.belongsTo(Echoes, {
  foreignKey: 'echo_id', 
  onDelete: 'CASCADE', 
  onUpdate: 'CASCADE'
});
Echoes.hasMany(Reactions, {
  foreignKey: 'echo_id', 
  onDelete: 'CASCADE', 
  onUpdate: 'CASCADE'
});

// Reactions <> User 
Reactions.belongsTo(User, {
  foreignKey: 'user_id', 
  onDelete: 'CASCADE', 
  onUpdate: 'CASCADE'
});
User.hasMany(Reactions, {
  foreignKey: 'user_id', 
  onDelete: 'CASCADE', 
  onUpdate: 'CASCADE'
});

// Reports <> Echoes 
Reports.belongsTo(Echoes, {
  foreignKey: 'echo_id', 
  onDelete: 'CASCADE', 
  onUpdate: 'CASCADE'
});
Echoes.hasMany(Reports, {
  foreignKey: 'echo_id', 
  onDelete: 'CASCADE', 
  onUpdate: 'CASCADE'
});

// Reports <> Users
Reports.belongsTo(User, {
  foreignKey: 'user_id', 
  as: 'reporter', 
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
User.hasMany(Reports, {
  foreignKey: 'user_id', 
  as: 'submitted_reports', 
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// Echoes <> Echo_visibility (1:1)
Echoes.hasOne(Echo_visibility, {
  foreignKey: 'echo_id', 
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
Echo_visibility.belongsTo(Echoes, {
  foreignKey: 'echo_id', 
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// Echoes <> Tags (many to many through echo_tags)
Echoes.belongsToMany(Tags, {
  through: Echo_tags,
  foreignKey: 'echo_id',
  otherKey: 'tag_id',
  as: 'tags', 
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
}); 
Tags.belongsToMany(Echoes, {
  through: Echo_tags, 
  foreignKey: 'tag_id',
  otherKey: 'echo_id',
  as: 'echoes', 
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// Echoes <> users (recipients- many to many)
Echoes.belongsToMany(User, {
  through: Echo_recipients,
  foreignKey: 'echo_id',
  otherKey: 'recipient_id',
  as: 'recipients', 
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
User.belongsToMany(Echoes, {
  through: Echo_recipients, 
  foreignKey: 'recipient_id',
  otherKey: 'echo_id',
  as: 'received_echoes', 
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// Users <> Users (friends)
User.belongsToMany(User, {
  through: Friends,
  as: 'outgoingFriends', // users I added
  foreignKey: 'user_id',
  otherKey: 'friend_id', 
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
User.belongsToMany(User, {
  through: Friends, 
  as: 'incomingFriends', // user who added me
  foreignKey: 'friend_id',
  otherKey: 'user_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

module.exports = {
  db,
  User,
  Echoes,
  Echo_visibility,
  Echo_recipients,
  Echo_tags,
  Friends,
  Media,
  Reactions,
  Replies,
  Reports,
  Tags
};
