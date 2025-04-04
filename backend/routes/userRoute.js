import express from "express";
import user from "../models/usermodel.js"; // Adjust the path as necessary
const router = express.Router();  


//create a new user
router.post("/", async (req, res) => {
    try {
        if (
            !req.body.name ||
            !req.body.email ||
            !req.body.phone ||
            !req.body.accessLevel ||
            !req.body.permissions ||
            !req.body.password
        ) {
            return res.status(400).send({ message: "All required fields must be provided." });
        }

        // Create new user
        const newUser = await user.create({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            accessLevel: req.body.accessLevel || "",
            permissions: req.body.permissions || [],
            status: req.body.status || "active",
            password: req.body.password
            
        });

        return res.status(201).send(
            `User created successfully with ID: ${newUser._id}`
        );
    } catch (error) {
        console.log(error.message);
        return res.status(500).send({ message: error.message });
    }
});

//get all users

router.get("/", async (req, res) => {
    try {
        const users
         = await user.find({});
        return res.status(200).json({
          success: true,
          count: users
          .length,
          data: users


        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).send({ message: error.message });
    }
});

//get users by id
router.get("/:id", async (req, res) => {
    try {
        const User = await user.findById(req.params.id);

        if (!User) return res.status(404).json({ message: "user not found" });

        return res.status(200).json(User);
    } catch (error) {
        console.log(error.message);
        return res.status(500).send({ message: error.message });
    }
});

//update an existing user
router.put("/:id", async (req, res) => {
    try {
        const User = await user.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!User) return res.status(404).json({ message: "user not found" });

        return res.status(200).json({message: "user updated successfully" });
    } catch (error) {
        console.log(error.message);
        return res.status(500).send({ message: error.message });
    }
});

// delete an user
router.delete("/:id", async (req, res) => {
    try {
        const User = await user.findByIdAndDelete(req.params.id);

        if (!User) return res.status(404).json({ message: "user not found" });

        return res.status(200).json({ message: "user deleted successfully" });
    } catch (error) {
        console.log(error.message);
        return res.status(500).send({ message: error.message });
    }
});


export default router; 