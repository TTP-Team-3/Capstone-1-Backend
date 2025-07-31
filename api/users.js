const express = require("express")
const router = express.Router();
const { User } = require("../database"); 

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

module.exports = router; 