const db = require("./db");
const { User, Echoes, Friends, Echo_recipients, Replies } = require("./index");


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
    text: "Public echo by Emmanuel",
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
    text: "Jeramy's custom echo",
    unlock_datetime: new Date(Date.now() + 1000 * 60 * 45), // unlock in 45 minutes
    show_sender_name: true,
    is_saved: false,
    is_archived: false,
    location_locked: false,
    lat: null,
    lng: null
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
