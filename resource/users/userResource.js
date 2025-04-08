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
  }

  async register(req, res) {
    try {
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
    const { username, password } = req.body;
    try {
      const result = await userService.isAuthenticated({
        username,
        password,
      });
      if (result.success) {
        res.status(200).json({ message: result.message });
      } else {
        res.status(401).json({ error: result.message });
      }
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }
}

export const userResource = new UserResource();
