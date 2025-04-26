
// Validate user (checks if user is valid)
export const validateUser = async (req, res) => {
  try {
    // User is already attached to request by authentication middleware
    return res.status(200).json({
      valid: true,
      user: {
        id: req.user._id,
        email: req.user.email,
        fullName: req.user.fullName,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Server error", details: error.message });
  }
};

// Refresh token controller
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: "Refresh token required" });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res
        .status(401)
        .json({ error: "Invalid or expired refresh token" });
    }

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // Update refresh token in database
    user.refreshToken = newRefreshToken;
    await user.save();

    // Set new tokens in cookies
    res.cookie("accessToken", newAccessToken, accessTokenOptions);
    res.cookie("refreshToken", newRefreshToken, refreshTokenOptions);

    return res.status(200).json({ message: "Tokens refreshed successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Server error", details: error.message });
  }
};

// Logout controller
export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      // Find user with this refresh token and clear it
      await User.findOneAndUpdate({ refreshToken }, { refreshToken: null });
    }

    // Clear cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Server error", details: error.message });
  }
};
