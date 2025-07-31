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

module.exports = router; 