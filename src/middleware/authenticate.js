import { verifyAccessToken } from "../utils/JWTutils.js";
import User from "../model/User.js";

const authenticate = async (req, res, next) => {
  try {
    // Get the token from cookies
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Verify the token
    const decoded = verifyAccessToken(accessToken);
    if (!decoded) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // Find the user
    const user = await User.findById(decoded.userId).select(
      "-password -refreshToken"
    );
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};

export default authenticate;
