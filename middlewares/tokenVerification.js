import jwt from "jsonwebtoken";
import AccountModel from "../models/AccountModel.js";
import config from "../config/config.js";

export const isVerifiedUser = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
      }

      const token = authHeader.split(" ")[1];

      const decoded = jwt.verify(token, config.accessTokenSecret);

      const user = await AccountModel.findById(decoded.id);

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      if (allowedRoles.length && !allowedRoles.includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      console.log(user)
      req.user = user;
      next();

    } catch (error) {

      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Session expired, login again" });
      }

      return res.status(401).json({ message: "Invalid token" });
    }
  };
};