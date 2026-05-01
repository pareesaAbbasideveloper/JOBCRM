import express from "express";
import {
    createAccount,
    login,
    getAllUsers,
    updateUser,
    deleteUser
} from "../controllers/accountController.js";
import { isVerifiedUser } from "../middlewares/tokenVerification.js";
const router = express.Router();


// Signup 
router.post("/signup", createAccount);

// Login (ALWAYS public)
router.post("/login", login);

// Get all users (admin only)
router.get("/users", isVerifiedUser(["Admin"]), getAllUsers);

// Update user (admin OR self)
router.put("/users/:id", isVerifiedUser(["Admin", "User"]), updateUser);
// Delete user (admin only)
router.delete("/users/:id", isVerifiedUser(["Admin"]), deleteUser);
export default router;