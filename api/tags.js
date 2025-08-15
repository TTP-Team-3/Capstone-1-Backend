const express = require("express");
const router = express.Router();
const { Tags, Echo_tags, Echoes } = require("../database");
const { authenticateJWT } = require("../auth");
const { Op } = require("sequelize");

// get all tags 
router.get("/", async(req, res) => {
    try {
        const tags = await Tags.findAll();

        // check if tags exist  
        if (!tags) {
            return res.status(404).json({error: "No tags found."});
        } 

        // if tags found but none created 
        if (tags.length === 0) {
            return res.status(400).json({error: "No tags have been created."});
        }

        res.json(tags);
    } catch (err) {
        console.error(err);
        return res.status(500).json({error: "Error finding all tags."});
    }
});

// create new tags 
router.post("/", authenticateJWT, async(req, res) => {
    try {
        const { tag_name } = req.body; 
        if (!tag_name || typeof tag_name !== 'string') {
            return res.status(400).json({error: 'Tag name is required and must be a string'});
        }

        // check if tag name already exists 
        const existingTag = await Tags.findOne({where: {name: tag_name}});
        if (existingTag) {
            return res.status(400).json({error: "Tag name already exists."});
        }

        // create tag 
        const createTag = await Tags.create({ name: tag_name });

        return res.status(201).json({
            message: "Tag successfully added", 
            tag: createTag
        });
    } catch (err) {
       console.error(err);
       return res.status(500).json({error: "Error adding tag to echo."});
    }
});

// find specific echoes with tag id
router.get("/:id/echoes", async (req, res) => {
    try {
        const tagId = parseInt(req.params.id, 10);

        // find echo-tag pairs that have tagId 
        const echoesWithTag = await Echo_tags.findAll({
            where: { tag_id: tagId },
            attributes: ["echo_id"]
        });

        // extract echo_id values 
        const echoIds = echoesWithTag.map(row => row.echo_id);

        // find all echoes 
        const echoes = await Echoes.findAll({
            where: { id: echoIds }
        });
        
        res.json(echoes);
    } catch (err) {
        console.error(err);
        return res.status(500).json({error: "Error finding echos with this tag."});
    }
}); 

// tag an echo 
router.post("/tag_echo", authenticateJWT, async(req, res) => {
   try { 
    const echoId = Number(req.body.echoId);
    const tagId = Number(req.body.tagId);
    const userId = req.user.id; 

    // validate echoId and tagId are numbers 
    if (!Number.isInteger(echoId) || !Number.isInteger(tagId)) {
        return res.status(400).json({
            status: "error",
            message: "echoId and tagId must be integers."
        });
    }
    
    // check if echo exists and user owns it 
    const echo = await Echoes.findOne({
        where: {
            id: echoId, 
            user_id: userId
        }
    }); 
    if (!echo) {
        return res.status(404).json({error: "Echo not found."});
    }

    // check that tag exists 
    const tag = await Tags.findByPk(tagId); 
    if (!tag) {
        return res.status(404).json({error: "Tag not found."});
    }

    // prevent duplicate tags
    const existing = await Echo_tags.findOne({
        where: {
            echo_id: echoId, 
            tag_id: tagId 
        }
    });
    if (existing) {
        return res.status(200).json({
            status: "success",
            message: "Echo already had this tag.",
            data: existing 
        });
    }

    // tag an echo 
    const tagged = await Echo_tags.create({
        echo_id: echoId, 
        tag_id: tagId
    });

    return res.status(201).json({
        status: "success",
        message: "Echo tagged successfully",
        data: tagged
    });

   } catch(err) {
    // in a rare case where two duplicates somehow are added to the database 
    if (err.name === "SequelizeUniqueConstraintError") {
        return res.status(200).json({
            status: "success",
            message: "Echo already had this tag."
        });
    }

    console.error(err);
    return res.status(500).json({error: "Error assigning tag to echo."});
   } 
});

module.exports = router; 