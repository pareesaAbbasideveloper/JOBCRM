import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import AccountModel from "../models/AccountModel.js";

// 🟢 Create Account (Signup)
export const createAccount = async (req, res) => {
    console.log(req.body)
    try {
        const { email, password, role } = req.body;
        const name = req.body.name
        // Check if account already exists
        const existingAccount = await AccountModel.findOne({ email });
        if (existingAccount) {
            return res.status(400).json({ message: "Email already registered" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create and save account
        const newAccount = new AccountModel({
            name,
            email,
            role,
            password: hashedPassword
        });

        const savedAccount = await newAccount.save();

        // Remove password from response for security
        const { password: _, ...accountData } = savedAccount._doc;

        res.status(201).json({
            success: true,
            data: accountData
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error.message });
    }
};

// 🔵 Login
export const login = async (req, res) => {
    try {
        console.log(req.body)
        const { email, password } = req.body;

        // Find account by email
        const account = await AccountModel.findOne({ email });
        if (!account) {
            return res.status(404).json({ message: "Account not found" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, account.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Create JWT Token
        const token = jwt.sign(
            { id: account._id },
            process.env.SECRET_KEY,
            { expiresIn: "1d" }
        );
        console.log("token", token)
        // Remove password from response
        const { password: _, ...accountData } = account._doc
        res.status(200).json({
            success: true,
            token,
            account: accountData
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await AccountModel.find()
            .select("-password") // 🔥 hide password
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching users",
            error: error.message
        });
    }
};


export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password, role } = req.body;

        const user = await AccountModel.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (name) user.name = name;
        if (email) user.email = email;
        if (role) user.role = role;

        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();

        const { password: _, ...userData } = user._doc;

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: userData
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating user",
            error: error.message
        });
    }
};


// Delete User
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await AccountModel.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        await AccountModel.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting user",
            error: error.message
        });
    }
};