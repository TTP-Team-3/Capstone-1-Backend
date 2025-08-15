const express = require("express");
const router = express.Router();
const { Tags } = require("../database");
const { authenticateJWT } = require("../auth");
const { Op } = require("sequelize");

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

router.get("/:id/echoes", async (req, res) => {
    try {
        
    } catch (err) {
        console.error(err);
        return res.status(500).json({error: "Error finding echos with this tag."});
    }
}); 

router.post("/:id/echoes/:id", authenticateJWT, async(req, res) => {
   try {

   } catch(err) {
    console.error(err);
    return res.status(500).json({error: "Error assigning tag to echo."});
   } 
});

module.exports = router; 