const express = require("express")
const router = express.Router();
const { Echoes, Echo_recipients, Friends } = require("../database"); 
const { authenticateJWT } = require("../auth"); 
const { Op } = require("sequelize");

/* ---------- helpers ---------- */
// helper: check if two users are friends (accepted)
async function isFriendWith(db, meId, otherId) {
    if (meId === otherId) return true;
    const rel = await Friends.findOne({
        where: {
            [Op.or]: [
                { user_id: otherId, friend_id: meId },
                { user_id: meId, friend_id: otherId },
            ],
            status: "accepted",
        },
    });
    return !!rel;
}

// helper: check if user is a recipient in Echo_recipients
async function isRecipientOf(db, echoId, meId) {
    const rec = await Echo_recipients.findOne({
        where: { echo_id: echoId, recipient_id: meId },
    });
    return !!rec;
}

/* =========================================================
   HOME FEED
   (must be BEFORE /:id to avoid treating 'home' as ID)
   Visible to signed-in user:
   - public
   - friend (if accepted friendship OR you’re the author)
   - custom (if you’re a recipient OR you’re the author)
   - self (only if you’re the author)
   ========================================================= */
router.get("/home", authenticateJWT, async (req, res) => {
    try {
        const user_id = req.user.id;

        const all = await Echoes.findAll();
        const visible = [];

        for (const e of all) {
            const own = e.user_id === user_id;

            if (e.recipient_type === "public") {
                visible.push(e);
                continue;
            }
            if (e.recipient_type === "self") {
                if (own) visible.push(e);
                continue;
            }
            if (e.recipient_type === "friend") {
                if (own || (await isFriendWith(null, user_id, e.user_id))) visible.push(e);
                continue;
            }
            if (e.recipient_type === "custom") {
                if (own || (await isRecipientOf(null, e.id, user_id))) visible.push(e);
                continue;
            }
        }

        res.json(visible);
    } catch (err) {
        console.error("GET /api/echoes/home error:", err);
        res.status(500).json({ error: "Failed to load homepage echoes" });
    }
});

/* =========================================================
   DASHBOARD LISTS (Inbox / Saved)
   - Inbox: own OR friends OR custom-where-recipient
   - Saved: (stub) return [] until you add a Saved table/flag
   ========================================================= */
router.get("/", authenticateJWT, async (req, res) => {
    try {
        const user_id = req.user.id;
        const tab = (req.query.tab || "Inbox").toLowerCase();

        if (tab === "saved") {
            // TODO: wire to real saved/bookmark table/flag
            return res.json([]);
        }

        // Inbox
        const all = await Echoes.findAll();
        const inbox = [];

        for (const e of all) {
            const own = e.user_id === user_id;

            if (own) { inbox.push(e); continue; }

            if (e.recipient_type === "friend") {
                if (await isFriendWith(null, user_id, e.user_id)) { inbox.push(e); continue; }
            }

            if (e.recipient_type === "custom") {
                if (await isRecipientOf(null, e.id, user_id)) { inbox.push(e); continue; }
            }

            // exclude public/self by others from Inbox per your spec
        }

        res.json(inbox);
    } catch (err) {
        console.error("GET /api/echoes error:", err);
        res.status(500).json({ error: "Failed to fetch echoes" });
    }
});

/* =========================================================
   fetching echo by id 
   ========================================================= */
router.get("/:id", authenticateJWT, async (req, res) => {
    try {
        const user_id = req.user.id;
        const echo = await Echoes.findByPk(req.params.id);

        if (!echo) {
            return res.status(404).json({error: "Echo not found"});
        }

        const isCreator = echo.user_id === user_id; 

        // If echo is only visible to self and the user is the creator
        if (echo.recipient_type === "self") {
            if (isCreator) {
                return res.json(echo);
            } else {
                return res.status(403).json({private: "This echo is private"});
            }
        }
        
        // If echo is public, only show if unlocked 
        if (echo.recipient_type === "public") {
            if (echo.is_unlocked) {
                return res.json(echo);
            } else if (isCreator) {
                return res.json(echo);
            } else {
                return res.status(403).json({locked: "Echo is locked"});
            }
        }

        // if echo is for friends and is unlocked      
        if (echo.recipient_type === "friend") {
            if (isCreator) {
                return res.json(echo); // creator can always view
            }

            // check if friendship is accepted between echo creator and logged in user
            const isFriend = await Friends.findOne({
                where: {
                    [Op.or]: [
                        {user_id: echo.user_id, friend_id: user_id}, 
                        {user_id: user_id, friend_id: echo.user_id}
                    ],
                    status: "accepted"
                }
            });

            if (isFriend) {
                if (echo.is_unlocked) {
                    return res.json(echo);
                } else {
                    return res.status(403).json({locked:"Echo is locked"});
                }
            } else {
                return res.status(403).json({not_friend: "This echo is only accessible to friends of echo creator"});
            }
        }

        // if echo is custom and for specific users 
        if (echo.recipient_type === "custom") {
            if (isCreator) {
                return res.json(echo);
            }
            const isRecipient = await Echo_recipients.findOne({
                where: {
                    echo_id: echo.id,
                    recipient_id: user_id,
                }
            })

            if (isRecipient && echo.is_unlocked) {
                return res.json(echo);
            } else if (isRecipient && !echo.is_unlocked) {
                return res.status(403).json({locked: "Echo is locked"});
            }
        }

        // default: no access
        res.status(403).json({no_access: "You cannot access this echo"});

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to fetch echo" })
    }
});

/* =========================================================
   PATCH /api/echoes/:id/unlock
   Unlock logic (visibility + time gate)
   ========================================================= */
router.patch("/:id/unlock", authenticateJWT, async (req, res) => {
  try {
    const user_id = req.user.id;
    const echo = await Echoes.findByPk(req.params.id);
    if (!echo) return res.status(404).json({ error: "Echo not found" });

    const isCreator = echo.user_id === user_id;

    // ---- visibility checks (mirror your GET /:id) ----
    if (echo.recipient_type === "self" && !isCreator) {
      return res.status(403).json({ private: "This echo is private" });
    }

    if (echo.recipient_type === "friend" && !isCreator) {
      const isFriend = await Friends.findOne({
        where: {
          [Op.or]: [
            { user_id: echo.user_id, friend_id: user_id },
            { user_id, friend_id: echo.user_id }
          ],
          status: "accepted",
        },
      });
      if (!isFriend) {
        return res.status(403).json({ not_friend: "Friends only" });
      }
    }

    if (echo.recipient_type === "custom" && !isCreator) {
      const isRecipient = await Echo_recipients.findOne({
        where: { echo_id: echo.id, recipient_id: user_id },
      });
      if (!isRecipient) {
        return res.status(403).json({ no_access: "Not a recipient" });
      }
    }

    // ---- time gate ----
    const now = new Date();
    if (now < new Date(echo.unlock_datetime) && !isCreator) {
      return res.status(403).json({ locked: "Unlock time not reached" });
    }

    // At this point, consider the echo "opened" by this user.
    // If you later add a table for history/views, insert it here.

    const payload = { ...echo.toJSON(), client_unlocked: true };
    return res.json(payload);
  } catch (err) {
    console.error("Unlock error:", err);
    res.status(500).json({ error: "Failed to unlock echo" });
  }
});

/* =========================================================
   creating an echo 
   ========================================================= */ 
router.post("/", authenticateJWT, async (req, res) => { 

    try {
        const { echo_name, recipient_type, text, unlock_datetime, show_sender_name, lat, lng, customRecipients } = req.body;
        const sender_id = req.user.id;

        // checking if any required fields are missing 
        if (!sender_id || !recipient_type || !unlock_datetime) {
            return res.status(400).json({error: "Missing required fields"});
        }

        // checking if unlock_datetime is in the future 
        const unlockTime = new Date(unlock_datetime);

        if (isNaN(unlockTime.getTime())) {
            return res.status(400).json({error: "Invalid unlock_datetime format"});
        }

        if (unlockTime < new Date()) {
            return res.status(400).json({error:"unlock_datetime must be in the future"});
        }

        // validating customRecipients array if recipient_type is 'custom'
        if (recipient_type === "custom") {
            if (!Array.isArray(customRecipients) || customRecipients.length === 0) {
                return res.status(400).json({error: "Custom recipient list must be a non-empty array."});
            }

            // prevent sending to self 
            if (customRecipients.includes(sender_id)) {
                return res.status(400).json({error: "Cannot send custom echoes to yourself."});
            }
        }

        // creating new echo 
        const newEcho = await Echoes.create({
            echo_name,
            user_id: sender_id,
            recipient_type, 
            text,
            unlock_datetime, 
            show_sender_name,
            lat,
            lng
        });

        // add custom recipients if custom 
        if (recipient_type === 'custom') {
            const echoRecipients = customRecipients.map((recipient_id) => ({
                echo_id: newEcho.id,
                recipient_id
            }));

            await Echo_recipients.bulkCreate(echoRecipients);
        }

        res.status(201).json(newEcho);
    } catch (err) {
        res.status(500).json({error: "Failed to create echo"});
    }
});

// unlocking an echo 
router.patch("/:id/unlock", authenticateJWT, async (req, res) => {
    try {
        const user_id = req.user.id; 
        const echo = await Echoes.findByPk(req.params.id);

        // check if echo exists 
        if (!echo) {
            return res.status(404).json({error: "Echo not found."});
        }

        // check if user is owner
        if (user_id !== echo.user_id) {
            return res.status(403).json({error: "You cannot access this echo."});
        }

        // enforce unlock date 
        if (new Date() < new Date(echo.unlock_datetime)) {
            return res.status(403).json({ error: "This echo is locked until its unlock date."});
        }

        // already unlocked 
        if (echo.is_unlocked) {
            return res.status(200).json({
                message: "Echo is already unlocked.", 
                echo 
            })
        } 
        
        // Unlock 
        echo.is_unlocked = true; 
        await echo.save(); 

        return res.status(200).json({
            message: "Echo unlocked",
            echo
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Error unlocking this echo"});
    }
});

// deleting an echo 
router.delete("/:id", authenticateJWT, async (req, res) => {
    try {
        const user_id = req.user.id; 
        const echo = await Echoes.findByPk(req.params.id); 

        // check if echo exists 
        if (!echo) {
            return res.status(404).json({error: "Echo not found."}); 
        }

        // check ownership 
        if (user_id !== echo.user_id) {
            return res.status(403).json({ error: "You are not the owner of this echo."});
        }

        // delete the echo 
        await echo.destroy();

        return res.status(200).json({
            message: "Echo deleted successfully", 
            id: echo.id
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({error: "Error deleting this echo"});
    }
});

module.exports = router; 