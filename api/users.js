const express = require("express")
const router = express.Router();
const { User, Echoes, Friends } = require("../database");
const { Op } = require("sequelize");
const { authenticateJWT } = require("../auth"); 

router.get("/", async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ["password_hash"] }
        });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch users" }); 
    }
});
// GET /api/users/me – return the logged-in user
router.get("/me", authenticateJWT, async (req, res) => {
  try {
    const me = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password_hash"] },
    });
    if (!me) return res.status(404).json({ error: "User not found." });
    res.json(me);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load current user." });
  }
});


// PATCH /api/users/:id  – update own profile
router.patch("/:id", authenticateJWT, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (req.user.id !== id) {
    return res.status(403).json({ error: "You can only edit your own profile." });
  }

  // Update only fields that exist in your model
  // (Your User model has username, bio, avatar_url, email, etc. — not firstName/lastName/img)
  const allowed = ["username", "bio", "avatar_url", "email"];
  const patch = {};
  for (const k of allowed) if (req.body[k] !== undefined) patch[k] = req.body[k];

  try {
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: "User not found." });
    await user.update(patch);
    
    res.json({ user });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update profile." });
  }
});

router.get("/:id", async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ["password_hash"] }
        });

        res.json(user);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch user" })
    }
});
// GET /api/users/:id/friends – accepted friends of a user
router.get("/:id/friends", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const rows = await Friends.findAll({
      where: {
        [Op.or]: [{ user_id: id }, { friend_id: id }],
        status: "accepted",
      },
    });
    const otherIds = rows.map(r => (r.user_id === id ? r.friend_id : r.user_id));
    const list = otherIds.length
      ? await User.findAll({
          where: { id: otherIds },
          attributes: { exclude: ["password_hash"] },
        })
      : [];
    res.json(list);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch user's friends." });
  }
});

router.get("/:id/echoes", async (req, res) => {
    try {
        const user_echoes = await Echoes.findAll({
            where: {
                user_id: req.params.id 
            }
        });
        res.status(200).json(user_echoes);
    } catch (err) {
        res.status(500).json({error: "Failed to fetch user echoes"});
    }
});

module.exports = router; 
