const express = require("express")
const router = express.Router();
const { Friends } = require("../database"); 
const { authenticateJWT } = require("../auth");
const { Op } = require("sequelize");

router.get("/", authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;
        const friends = await Friends.findAll({
            where: {
                [Op.or]: [
                    {user_id: userId},
                    {friend_id: userId}
                ],
                status: "accepted"
            }
        });

        res.json(friends);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch friends" }); 
    }
});

router.post("/", authenticateJWT, async (req, res) => {
    try {
        const user_id = req.user.id; 
        const { friend_id } = req.body;

        // cannot send friend requests to self 
        if (user_id === friend_id) {
            return res.status(400).json({error: "Cannot send a friend request to self"});
        }

        // auto-accept if reverse pending request exists 
        const reverseRequest = await Friends.findOne({
            where: { user_id: friend_id, friend_id: user_id, status: "pending"}
        });
        
        if (reverseRequest) {
            reverseRequest.status = "accepted";
            await reverseRequest.save();
            return res.status(200).json(reverseRequest);
        }

        // checking if already friends 
        const isFriend = await Friends.findOne({
            where: {
                [Op.or]: [
                    {user_id, friend_id}, 
                    {user_id: friend_id, friend_id: user_id}
                    ],
                    status: "accepted"
            }
        });

        if (isFriend) {
            return res.status(403).json({ message: "Already friends"});
        }

        // check if there's already an existing request 
        const requestExists = await Friends.findOne({
            where: {
                [Op.or]: [
                    {user_id, friend_id},
                    {user_id: friend_id, friend_id: user_id}
                ],
                status: "pending"
            }
        });

        if (requestExists) {
            return res.status(403).json({message: "Friend request sent already"});
        }

        // create pending request  
        const newFriendRequest = await Friends.create({ user_id, friend_id});
        res.status(201).json(newFriendRequest);
    } catch (err) {
        console.log(err);
        return res.status(500).json({error: "Failed to send friend request"});
    }
});

router.patch("/:id/accept", authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id; 
        const friendRequest = await Friends.findByPk(req.params.id); 

        if (!friendRequest) {
            return res.status(404).json({error: "Friend request not found."});
        }

        // Ensure current user is the receiver 
        if (friendRequest.friend_id !== userId) {
            return res.status(403).json({ error: "You are not the recipient of this friend request." });
        }

        // check if already accepted
         if (friendRequest.status === "accepted") {
            return res.status(400).json({error: "This person is already your friend."});
        }

        // must be pending to accept 
        if (friendRequest.status !== "pending") {
            return res.status(400).json({error: "This request is not pending."});
        }

        // Accept friend request 
        friendRequest.status = "accepted"; 
        await friendRequest.save(); 

        return res.status(200).json({
            message: "Friend request accepted", 
            buddingFriendship: friendRequest
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({error: "Error accepting friend request."});
    }
});

router.patch("/:id/block", authenticateJWT, async (req, res) => {
    try {
    
    } catch (err) {
    
    }
});

router.delete("/:id", authenticateJWT, async (req, res) => {
    try {
    
    } catch (err) {
    
    }
});

module.exports = router; 





