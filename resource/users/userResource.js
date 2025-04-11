import express from "express";
import { userService } from "../../service/users/userService.js";
class UserResource {
  constructor() {
    this.router = express.Router();
    this.initRoutes();
  }
  initRoutes() {
    this.router.post("/register", this.register.bind(this));
    this.router.post("/login", this.login.bind(this));
    this.router.get(
      "/auth/google/callback",
      this.handleGoogleCallback.bind(this)
    );
    this.router.post("/logout", this.logout.bind(this));
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
        res.status(200).json({ message: "User successfully registered" });
      } else {
        res.status(401).json({ error: result.message });
      }
    } catch (error) {
      res.status(500).json({ error: "Server error" });
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
        res
          .status(200)
          .json({ message: "Login successful", token: result.token });
      } else {
        res.status(401).json({ error: result.message });
      }
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }

  async handleGoogleCallback(req, res) {
    try {
      const user = req.user;
      res.status(200).json({ message: "Oauth login sucess" });
    } catch (error) {
      res.status(500).json({ error: "Google OAuth failed" });
    }
  }

  async logout(req, res) {
    const currUser = req.user;
    res.status(200).json({ message: "logout successfully" });
  }
}

export const userResource = new UserResource();
