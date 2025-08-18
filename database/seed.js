const db = require("./db");
const { User, Echoes, Friends, Echo_recipients, Replies, Reactions, Tags } = require("./index");


const seed = async () => {
  try {
    db.logging = false;
    await db.sync({ force: true }); // Drop and recreate tables

    const users = await User.bulkCreate([
      { username: "jeramy", password_hash: User.hashPassword("123456"), email: "jeramy@gmail.com" },
      { username: "aiyanna", password_hash: User.hashPassword("456789"), email: "aiyanna@gmail.com" },
      { username: "emmanuel", password_hash: User.hashPassword("789101"), email: "emmanuel@gmail.com" },
      { username: "olivia", password_hash: User.hashPassword("101112"), email: "olivia@gmail.com" },
    ]);

    console.log(`👤 Created ${users.length} users`);

    const echoes = await Echoes.bulkCreate([
  {
    echo_name: "Jeramy's Private Echo",
    user_id: users[0].id, // Jeramy
    recipient_type: "self",
    text: "This is Jeramy's private echo",
    unlock_datetime: new Date(Date.now() + 1000 * 60 * 60), // unlock in 1 hour
    show_sender_name: true,
    is_saved: false, // default
    is_archived: false, // default
    location_locked: false, // default
    lat: null,
    lng: null
  },
  {
    echo_name: "Aiyanna's Friends Echo",
    user_id: users[1].id, // Aiyanna
    recipient_type: "friend",
    text: "Aiyanna's echo to friends",
    unlock_datetime: new Date(Date.now() - 1000 * 60 * 60), // already unlocked
    show_sender_name: false,
    is_saved: false,
    is_archived: false,
    location_locked: false,
    lat: null,
    lng: null
  },
  {
    echo_name: "Public Echo by Emmanuel",
    user_id: users[2].id, // Emmanuel
    recipient_type: "public",
    text: "Public echo by Emmanuel for everyone to see",
    unlock_datetime: new Date(),
    is_archived: true,
    is_saved: false,
    show_sender_name: true,
    location_locked: false,
    lat: null,
    lng: null
  },
  {
    echo_name: "Olivia's Public Echo",
    user_id: users[3].id, // Olivia
    recipient_type: "public",
    text: "Olivia's echo is for everyone!",
    unlock_datetime: new Date(Date.now() + 1000 * 60 * 60 * 24), // unlock in 1 day
    show_sender_name: true,
    is_saved: false,
    is_archived: false,
    location_locked: false,
    lat: null,
    lng: null
  },
  {
    echo_name: "Jeramy's Custom Echo",
    user_id: users[0].id, // Jeramy
    recipient_type: "custom",
    text: "Jeramy's custom echo wwere only specific users can see it",
    unlock_datetime: new Date(Date.now() + 1000 * 60 * 45), // unlock in 45 minutes
    show_sender_name: true,
    is_saved: false,
    is_archived: false,
    location_locked: false,
    lat: null,
    lng: null
  },
  {
    echo_name: "Walk by Saint Lawrence",
    user_id: users[0].id, // Jeramy
    recipient_type: "friend",
    text: "Remember when we first passed Saint Lawrence Triangle?",
    unlock_datetime: new Date("2025-09-01T12:00:00Z"),
    show_sender_name: true,
    location_locked: true,
    lat: 40.8365,
    lng: -73.8677,
    tags: ["memory", "friendship"]
  },
  {
    echo_name: "Lunch under the tracks",
    user_id: users[1].id, // Aiyanna
    recipient_type: "public",
    text: "Grab a lunch by the 6 train stop.",
    unlock_datetime: new Date("2025-09-05T09:00:00Z"),
    show_sender_name: false,
    location_locked: true,
    lat: 40.831589,
    lng: -73.866882,
    tags: ["food", "bronx"]
  },
  {
    echo_name: "Morning jog start",
    user_id: users[2].id, // Emmanuel
    recipient_type: "self",
    text: "Started my day running through Saint Lawrence Triangle.",
    unlock_datetime: new Date("2025-08-25T06:30:00Z"),
    show_sender_name: true,
    location_locked: true,
    lat: 40.8350,
    lng: -73.8680,
    is_unlocked: true,
    tags: ["fitness", "morning"]
  },
  {
    echo_name: "BX Park Bench Memory",
    user_id: users[3].id,                // Olivia
    recipient_type: "public",
    text: "Meet me by the park bench. You’ll know it when you see it.",
    unlock_datetime: new Date(Date.now() + 1000 * 60 * 120), // +2 hours
    show_sender_name: true,
    location_locked: true,
    lat: 40.82965,
    lng: -73.86790,
    tags: ["bronx", "park", "memory"]
  },
  {
    echo_name: "Soundview Corner Joke",
    user_id: users[3].id,                // Olivia
    recipient_type: "friend",
    text: "This corner still cracks me up 😂",
    unlock_datetime: new Date(Date.now() - 1000 * 60 * 60),  // already unlocked
    show_sender_name: true,
    location_locked: true,
    lat: 40.82920,
    lng: -73.86730,
    tags: ["friends", "inside-joke"]
  },
  {
    echo_name: "Triangle Note for Olivia",
    user_id: users[0].id,                // Jeramy
    recipient_type: "custom",
    text: "For Olivia only — look up!",
    unlock_datetime: new Date(Date.now() + 1000 * 60 * 30),  // +30 min
    show_sender_name: true,
    location_locked: true,
    lat: 40.82990,
    lng: -73.86820,
    tags: ["custom", "triangle"]
  },
  {
    echo_name: "Lunch Cart by the School",
    user_id: users[1].id,                // Aiyanna
    recipient_type: "public",
    text: "Best empanadas here at noon 🍽️",
    unlock_datetime: new Date(Date.now() + 1000 * 60 * 60 * 24), // +1 day
    show_sender_name: false,
    location_locked: true,
    lat: 40.82890,
    lng: -73.86690,
    tags: ["food", "lunch"]
  }
]);


    console.log(`📣 Created ${echoes.length} echoes`);

    const friends = await Friends.bulkCreate([
      { user_id: users[0].id, friend_id: users[1].id, status: "accepted" },
      { user_id: users[1].id, friend_id: users[0].id, status: "accepted" },
      { user_id: users[0].id, friend_id: users[2].id, status: "pending" },
      { user_id: users[2].id, friend_id: users[3].id, status: "blocked" }, 
    ]);


    console.log(`🤝 Created ${friends.length} friendships`)

    const echoRecipients = await Echo_recipients.bulkCreate([
      {
        echo_id: echoes[4].id, // Custom echo by Jeramy
        recipient_id: users[1].id // Aiyanna
      },
      {
        echo_id: echoes[4].id,
        recipient_id: users[2].id // Emmanuel
      }
    ]);

    console.log(`📨 Created ${echoRecipients.length} echo_recipients for custom echo`);

    // replies
    const replies = await Replies.bulkCreate([
      { echo_id: echoes[0].id, user_id: users[1].id, message: "Hey Jeramy, nice private echo!" },
      { echo_id: echoes[0].id, user_id: users[2].id, message: "Agreed, this is cool." },
      { echo_id: echoes[1].id, user_id: users[0].id, message: "Glad to be your friend, Aiyanna!" },
      { echo_id: echoes[2].id, user_id: users[3].id, message: "Public echoes are great!" },
      // Nested reply (replying to the first reply above)
      { echo_id: echoes[0].id, user_id: users[0].id, parent_reply_id: 1, message: "Thanks, Aiyanna!" }
    ]);
    console.log(`💬 Created ${replies.length} replies`);

    // reactions 
    const reactions = await Reactions.bulkCreate([
    // Echo 0 (self) — only Jeramy
    { echo_id: echoes[0].id, user_id: users[0].id, type: 'love' },

    // Echo 1 (friend, unlocked) — creator (Aiyanna) + Jeramy (friend accepted)
    { echo_id: echoes[1].id, user_id: users[1].id, type: 'happy' },
    { echo_id: echoes[1].id, user_id: users[0].id, type: 'like' },

    // Echo 2 (public, unlocked) — everyone can react
    { echo_id: echoes[2].id, user_id: users[2].id, type: 'like' },   // creator
    { echo_id: echoes[2].id, user_id: users[0].id, type: 'wow' },
    { echo_id: echoes[2].id, user_id: users[1].id, type: 'love' },
    { echo_id: echoes[2].id, user_id: users[3].id, type: 'funny' },

    // Echo 3 (public, locked) — only Olivia
    { echo_id: echoes[3].id, user_id: users[3].id, type: 'angry' },

    // Echo 4 (custom, locked) — only Jeramy (creator) and recipients (u1, u2)
    { echo_id: echoes[4].id, user_id: users[0].id, type: 'happy' },  // creator
    { echo_id: echoes[4].id, user_id: users[1].id, type: 'wow' },    // recipient
    { echo_id: echoes[4].id, user_id: users[2].id, type: 'like' }    // recipient
  ]);

  console.log(`😎 Created ${reactions.length} reactions`);

  const tags = await Tags.bulkCreate([
    { name: 'funny' },
    { name: 'inspirational' },
    { name: 'personal' },
    { name: 'friends' },
    { name: 'public' },
    { name: 'locked' },
    { name: 'announcement' },
    { name: 'random' }
  ]);

  console.log(`🏷️ Created ${tags.length} tags`);

  console.log("🌱 Seeded the database");

  } catch (error) {
    console.error("Error seeding database:", error);
    if (error.message.includes("does not exist")) {
      console.log("\n🤔🤔🤔 Have you created your database??? 🤔🤔🤔");
    }
  }
  db.close();
};

seed();
