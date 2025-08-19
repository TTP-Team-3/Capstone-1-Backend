const express = require("express")
const router = express.Router();
const { Reports } = require("../database"); 
const { authenticateJWT } = require("../auth");
const { Op } = require("sequelize");

// post a report 
router.post("/", authenticateJWT, async (req, res) => {
    try {
        const { echo_id, reply_id, type, reasons} = req.body; 
        const reporterId = parseInt(req.user.id, 10);

        // validate user 
        if (!reporterId) {
            return res.status(401).json({error: "Unauthorized"});
        }

        // validate required fields 
        if (echo_id == null || type == null) {
            return res.status(400).json({error: "Missing required fields: echo_id, type"});
        }

        // validate type
        const validTypes = Reports.getAttributes().type.values;
        if (!validTypes.includes(type)) {
            return res.status(400).json({error: "Type not valid."});
        }

        // create report 
        const report = await Reports.create({
            echo_id, 
            reply_id, 
            reporter_id: reporterId,
            type, 
            reasons
        });
        return res.status(201).json({
            status: "success",
            message: "Report created successfully.",
            data: report 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to post report" }); 
    }
});

// get a specific report 
router.get("/:id", async (req, res) => {
    try {
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch user" })
    }
});

// update a report 
router.patch("/:id/echoes", async (req, res) => {
    try {
        
    } catch (err) {
        res.status(500).json({error: "Failed to fetch user echoes"});
    }
});

// get all reports 
router.get("/", async (req, res) => {
    try {

    } catch (err) {
        console.error(err);
        return res.status(500).json({error: ""});
    }
});

module.exports = router; 
