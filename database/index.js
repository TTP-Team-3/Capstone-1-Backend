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

// Echos <> user (sender)
Echoes.belongsTo(User, {foreignKey: 'sender_id', as: 'sender'});
User.hasMany(Echoes, {foreignKey: 'sender_id', as: 'sent_echoes'});

// Echoes <> media 
Echoes.hasMany(Media, {foreignKey: 'echo_id'});
Media.belongsTo(Echoes, {foreignKey: 'echo_id'});

// Replies <> Echoes 
Replies.belongsTo(Echoes, {foreignKey: 'echo_id'});
Echoes.hasMany(Replies, {foreignKey: 'echo_id'});

// Replies <> User 
Replies.belongsTo(User, {foreignKey: 'user_id'});
User.hasMany(Replies, {foreignKey: 'user_id'});

// Replies <> Replies (nested replies)
Replies.belongsTo(Replies, {foreignKey: 'parent_reply_id', as: 'parent_reply'});
Replies.hasMany(Replies, {foreignKey: 'parent_reply_id', as: 'child_replies'});

// Media <> Replies 
Media.belongsTo(Replies, {foreignKey: 'reply_id'});
Replies.hasMany(Media, {foreignKey: 'reply_id'});

// Reactions <> Echoes 
Reactions.belongsTo(Echoes, {foreignKey: 'echo_id'});
Echoes.hasMany(Reactions, {foreignKey: 'echo_id'});

// Reactions <> User 
Reactions.belongsTo(User, {foreignKey: 'user_id'});
User.hasMany(Reactions, {foreignKey: 'user_id'});

// Reports <> Echoes 
Reports.belongsTo(Echoes, {foreignKey: 'echo_id'});
Echoes.hasMany(Reports, {foreignKey: 'echo_id'});

// Reports <> Users
Reports.belongsTo(User, {foreignKey: 'user_id', as: 'reporter'});
User.hasMany(Reports, {foreignKey: 'user_id', as: 'submitted_reports'});

// Echoes <> Echo_visibility (1:1)
Echoes.hasOne(Echo_visibility, {foreignKey: 'echo_id'});
Echo_visibility.belongsTo(Echoes, {foreignKey: 'echo_id'});

// Echoes <> Tags (many to many through echo_tags)
Echoes.belongsToMany(Tags, {
  through: Echo_tags,
  foreignKey: 'echo_id',
  otherKey: 'tag_id',
  as: 'tags'
}); 
Tags.belongsToMany(Echoes, {
  through: Echo_tags, 
  foreignKey: 'tag_id',
  otherKey: 'echo_id',
  as: 'echoes'
});

// Echoes <> users (recipients- many to many)
Echoes.belongsToMany(User, {
  through: Echo_recipients,
  foreignKey: 'echo_id',
  otherKey: 'recipient_id',
  as: 'recipients'
});
User.belongsToMany(Echoes, {
  through: Echo_recipients, 
  foreignKey: 'recipient_id',
  otherKey: 'echo_id',
  as: 'received_echoes'
});

// Users <> Users (friends)
User.belongsToMany(User, {
  through: Friends,
  as: 'friends',
  foreignKey: 'user_id',
  otherKey: 'friend_id'
})


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
