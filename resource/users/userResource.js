import express from "express";
import { userService } from "../../service/users/userService.js";

class UserResource {
  constructor() {
    this.router = express.Router();
    this.initRoutes();
  }

  initRoutes() {
    this.router.post("/register", this.register.bind(this));
    this.router.get("/verify-email/:token", this.verifyEmail.bind(this));
    this.router.post("/login", this.login.bind(this));
    this.router.get(
      "/auth/google/callback",
      this.handleGoogleCallback.bind(this)
    );
    this.router.patch("/:userId", this.updateUser.bind(this));
    this.router.post("/logout", this.logout.bind(this));
    this.router.post("/forgot-password", this.forgotPassword.bind(this));
    this.router.post("/reset-password", this.resetPassword.bind(this));
  }

  async register(req, res) {
    const {
      username,
      password,
      email,
      firstName,
      lastName,
      oauthProvider,
      oauthToken,
    } = req.body;
    try {
      const userData = { username, email, firstName, lastName };
      if (password) {
        userData.password = password;
      } else if (oauthProvider && oauthToken) {
        userData.oauthProvider = oauthProvider;
        userData[`${oauthProvider}Token`] = oauthToken;
      } else {
        return res.status(400).json({ error: "Missing credentials" });
      }
      const result = await userService.addNewUser(req.body);

      if (result.success) {
        return res
          .status(200)
          .json({ message: "User successfully registered" });
      } else {
        return res.status(401).json({ error: result.message });
      }
    } catch (error) {
      return res.status(500).json({ error: "Server error" });
    }
  }

  async verifyEmail(req, res) {
    try {
      const { token } = req.params;
      const result = await userService.verifyEmail(token);
      if (result.success) {
        return res.status(200).send("Email successfully verified!");
      } else {
        return res.status(400).send("Invalid or expired verification link.");
      }
    } catch (error) {
      return res.status(500).send("Server error");
    }
  }

  async login(req, res) {
    const { username, password, oauthProvider, oauthToken } = req.body;
    try {
      const userData = { username };

      if (password) {
        userData.password = password;
      } else if (oauthProvider && oauthToken) {
        userData.oauthProvider = oauthProvider;
        userData.oauthToken = oauthToken;
      } else {
        return res.status(400).json({ error: "Missing credentials" });
      }

      const result = await userService.isAuthenticated(userData);

      if (result.success) {
        return res
          .status(200)
          .json({ message: "Login successful", token: result.token });
      } else {
        return res.status(401).json({ error: result.message });
      }
    } catch (error) {
      return res.status(500).json({ error: "Server error" });
    }
  }

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const result = await forgotPasswordService.requestPasswordReset(email);
      if (result === "User found. Email sent") {
        return res.status(200).json({ message: "Password reset email sent" });
      } else {
        return res.status(404).json({ error: "Email not found" });
      }
    } catch (error) {
      return res.status(500).json({ error: "Server error" });
    }
  }

  async resetPassword(req, res) {
    try {
      const { email, newPassword, token } = req.body;
      const result = await userService.updatePassword(
        email,
        newPassword,
        token
      );

      if (result.success) {
        return res
          .status(200)
          .json({ message: "Password was successfully changed" });
      } else {
        return res.status(400).json({ error: "Invalid or expired token" });
      }
    } catch (error) {
      return res.status(500).json({ error: "Server error" });
    }
  }

  async handleGoogleCallback(req, res) {
    try {
      // Assuming req.user is set by some OAuth middleware
      const user = req.user;
      return res.status(200).json({ message: "Oauth login success" });
    } catch (error) {
      return res.status(500).json({ error: "Google OAuth failed" });
    }
  }

  async updateUser(req, res) {
    const { userId } = req.params;
    const patchFields = req.body;

    const allowedFields = ["username", "firstName", "lastName"];
    const inputtedFields = {};

    for (const field of allowedFields) {
      if (patchFields[field] !== undefined) {
        inputtedFields[field] = patchFields[field];
      }
    }

    if (Object.keys(inputtedFields).length === 0) {
      return res.status(400).json({ error: "Empty fields" });
    }

    try {
      const result = await userService.patchUser(userId, inputtedFields);
      if (result.success) {
        return res
          .status(200)
          .json({ message: "Updates were successfully made" });
      } else {
        return res
          .status(400)
          .json({ error: result.message || "Update failed" });
      }
    } catch (error) {
      return res.status(500).json({ error: "Server error" });
    }
  }

  async logout(req, res) {
    return res.status(200).json({ message: "logout successfully" });
  }
}

export const userResource = new UserResource();
