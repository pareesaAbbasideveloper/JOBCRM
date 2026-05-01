const mongoose = require("mongoose");
const config = require("./config");
const connectDB = async () => {
    try {
        // const conn = await mongoose.connect("mongodb://127.0.0.1:27017/POSRestaurented2")
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(`❌ Database connection failed: ${error}`);
        process.exit();
    }
}

module.exports = connectDB;