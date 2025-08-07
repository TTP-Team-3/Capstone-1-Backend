const db = require("./db");
const { User } = require("./index");
const { Echoes } = require('./index');

const seed = async () => {
  try {
    db.logging = false;
    await db.sync({ force: true }); // Drop and recreate tables

    const users = await User.bulkCreate([
      { username: "jeramy", password_hash: User.hashPassword("123456"), email: "jeramy@gmail.com" },
      { username: "aiyanna", password_hash: User.hashPassword("456"), email: "aiyanna@gmail.com" },
      { username: "emmanuel", password_hash: User.hashPassword("789"), email: "emmanuel@gmail.com" },
      { username: "olivia", password_hash: User.hashPassword("101112"), email: "olivia@gmail.com" },
    ]);

    console.log(`👤 Created ${users.length} users`);

    const echoes = await Echoes.bulkCreate([
      {
        user_id: users[0].id,
        type: "self",
        text: "This is Jeramys private echo",
        unlock_datetime: new Date(Date.now() + 1000 * 60 * 60), // unlock in 1 hour
        show_sender_name: true
      },
      {
        user_id: users[1].id,
        type: "friend",
        text: "Aiyannas echo to friends",
        unlock_datetime: new Date(Date.now() - 1000 * 60 * 60), // already unlocked
        show_sender_name: false
      },
      {
        user_id: users[2].id,
        type: "public",
        text: "Public echo by Emmanuel",
        unlock_datetime: new Date(),
        is_archived: true,
        show_sender_name: true
      },
      {
        user_id: users[3].id,
        type: "public",
        text: "Olivias echo is for everyone!",
        unlock_datetime: new Date(Date.now() + 1000 * 60 * 60 * 24), // unlock in 1 day
        show_sender_name: true
      }
    ]);

    console.log(`Created ${echoes.length} echoes`);

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
