import express from "express";
import passport from "passport";
import { userService } from "../../service/users/userService.js";
import { userInfoService } from "../../service/user-info/userInfoService.js";
import { forgotPasswordService } from "../../service/forgotPassword/forgotPasswordService.js";
import { generateToken } from "../../config/serverSessions/jwt.js";
import upload from "../../middleware/upload.js";
import { cloudinaryUpload } from "../../config/cloudinary/cloudinaryUpload.js";
import { authenticateToken } from "../../middleware/authentication.js";
import { userIdCheck } from "../../middleware/objectIdCheck.js";

class UserResource {
  constructor() {
    this.router = express.Router();
    this.initRoutes();
  }

  initRoutes() {
    // user login and registration
    this.router.post("/register", this.register.bind(this));
    this.router.get("/verify-email/:token", this.verifyEmail.bind(this));
    this.router.post("/login", this.login.bind(this));
    this.router.patch("/", authenticateToken, this.updateUser.bind(this));
    this.router.post("/logout", this.logout.bind(this));
    this.router.post("/forgot-password", this.forgotPassword.bind(this));
    this.router.post("/reset-password", this.resetPassword.bind(this));
    this.router.post(
      "/image",
      authenticateToken,
      upload.single("image"),
      this.uploadUserPicture.bind(this)
    );

    // Google OAuth routes using Passport
    this.router.get(
      "/auth/google",
      passport.authenticate("google", {
        scope: ["email", "profile"],
        session: false,
      })
    );

    this.router.get(
      "/auth/google/callback",
      passport.authenticate("google", { session: false }),
      this.googleOAuthCallback.bind(this)
    );

    // user getters
    this.router.get("/:userId", userIdCheck, this.getUser.bind(this));
    this.router.get(
      "/:userId/recipe-count",
      userIdCheck,
      this.getUserRecipeCount.bind(this)
    );
    this.router.get(
      "/:userId/like-count",
      userIdCheck,
      this.getUserLikeCount.bind(this)
    );
    this.router.get(
      "/:userId/global-like-count",
      userIdCheck,
      this.getUserGlobalLikeCount
    );
    this.router.get(
      "/:userId/picture-url",
      userIdCheck,
      this.getUserPictureUrl.bind(this)
    );
    this.router.get(
      "/:userId/recipes",
      userIdCheck,
      this.getUserRecipes.bind(this)
    );

    // user-info
    this.router.post(
      "/user-info",
      authenticateToken,
      this.addUserInfo.bind(this)
    );
    this.router.patch(
      "/user-info",
      authenticateToken,
      this.updateUserInfo.bind(this)
    );
    this.router.get(
      "/user-info/:userId",
      userIdCheck,
      this.getUserInfo.bind(this)
    );
  }

  async register(req, res) {
    const { username, password, email, firstName, lastName } = req.body;
    try {
      if (!password) {
        return res.status(400).json({ error: "Password is required" });
      }

      const userData = { username, email, firstName, lastName, password };
      const result = await userService.addNewUser(userData);

      if (result.success) {
        return res
          .status(200)
          .json({ message: "User successfully registered" });
      } else {
        return res.status(400).json({ error: result.message });
      }
    } catch (error) {
      console.error("Register error:", error);
      return res.status(500).json({ error: "Server error" });
    }
  }

  async verifyEmail(req, res) {
    try {
      const { token } = req.params;
      const result = await userService.verifyEmail(token);
      if (result.success) {
        return res
          .status(200)
          .send({ success: "Email successfully verified!" });
      } else {
        return res
          .status(400)
          .send({ error: "Invalid or expired verification link." });
      }
    } catch (error) {
      return res.status(500).send("Server error");
    }
  }

  async login(req, res) {
    const { username, password } = req.body;
    try {
      if (!password) {
        return res.status(400).json({ error: "Password is required" });
      }

      const result = await userService.isAuthenticated({ username, password });

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

  async updateUser(req, res) {
    const userId = req.user?.userId;
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
        return res.status(400).json({ error: result.error || "Update failed" });
      }
    } catch (error) {
      return res.status(500).json({ error: "Server error" });
    }
  }

  async logout(req, res) {
    return res.status(200).json({ message: "Logout successful" });
  }

  // Google OAuth callback handler
  async googleOAuthCallback(req, res) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: "Authentication failed" });
      }

      const token = generateToken({
        userId: user._id.toString(),
        username: user.username || user.email,
        email: user.email,
      });

      return res.redirect(`${process.env.URL_REDIRECT}?token=${token}`);
    } catch (error) {
      return res.status(500).json({ error: "OAuth callback error" });
    }
  }

  // adding user picture
  async uploadUserPicture(req, res) {
    const userId = req.user?.userId;
    const image = req.file;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!image) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    try {
      const imageUpload = await cloudinaryUpload(image.buffer, "users");
      const result = await userService.updateUserPictureUrl(
        userId,
        imageUpload.secure_url
      );
      if (!result) {
        return res.status(400).json({ error: "User not found" });
      }
      return res
        .status(200)
        .json({ success: true, userPictureUrl: imageUpload.secure_url });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: "Server error" });
    }
  }

  // user getters
  async getUser(req, res) {
    const userId = req.params.userId;

    try {
      const result = await userService.getUser(userId);
      if (result?.error) {
        return res.status(400).json({ error: result.error });
      }
      return res.status(200).json({ success: true, userInfo: result });
    } catch (err) {
      return res.status(500).json({ error: "Server error" });
    }
  }

  async getUserRecipeCount(req, res) {
    const userId = req.params.userId;

    try {
      const count = await userService.getUserRecipeCount(userId);
      if (count?.error) {
        return res.status(400).json({ error: count.error });
      }
      return res.status(200).json({ recipeCount: count });
    } catch (err) {
      return res.status(500).json({ error: "Server error" });
    }
  }

  async getUserLikeCount(req, res) {
    const userId = req.params.userId;

    try {
      const count = await userService.getUserLikeCount(userId);
      if (count?.error) {
        return res.status(400).json({ error: count.error });
      }
      return res.status(200).json({ likeCount: count });
    } catch (err) {
      return res.status(500).json({ error: "Server error" });
    }
  }

  async getUserGlobalLikeCount(req, res) {
    const userId = req.params.userId;

    try {
      const globalLikes = await userService.getUserGlobalLikeCount(userId);
      if (globalLikes?.error) {
        return res.status(400).json({ error: globalLikes.error });
      }
      return res.status(200).json({ globalLikeCount: globalLikes });
    } catch (err) {
      return res.status(500).json({ error: "Server error" });
    }
  }

  async getUserPictureUrl(req, res) {
    const userId = req.params.userId;

    try {
      const url = await userService.getUserPictureUrl(userId);
      if (url?.error) {
        return res
          .status(400)
          .json({ error: url.error || "Error fetching url" });
      }
      return res.status(200).json({ pictureUrl: url });
    } catch (err) {
      return res.status(500).json({ error: "Server error" });
    }
  }

  async getUserRecipes(req, res) {
    const userId = req.params.userId;

    try {
      const recipes = await userService.getUserRecipes(userId);
      if (recipes?.error) {
        return res.status(400).json({ error: recipes.error });
      }
      return res.status(200).json(recipes);
    } catch (err) {
      return res.status(500).json({ error: "Server error" });
    }
  }

  //user-info collection methods
  async addUserInfo(req, res) {
    const userId = req.user?.userId;
    const { favoriteCuisine, favoriteMeal, favoriteDish, dietaryRestriction } =
      req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const result = await userInfoService.addUserInfo(
        userId,
        favoriteCuisine,
        favoriteMeal,
        favoriteDish,
        dietaryRestriction
      );
      if (result.success) {
        return res
          .status(200)
          .json({ message: "User info successfully submitted" });
      } else {
        return res
          .status(400)
          .json({ error: result.error || "User not found" });
      }
    } catch (err) {
      return res.status(500).json({ error: "Server error" });
    }
  }
  async updateUserInfo(req, res) {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const patchFields = req.body;

    const allowedFields = [
      "favoriteCuisine",
      "favoriteMeal",
      "favoriteDish",
      "dietaryRestriction",
    ];
    const fieldsToUpdate = {};
    for (const field in patchFields) {
      if (allowedFields.includes(field)) {
        fieldsToUpdate[field] = patchFields[field];
      }
    }

    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).json({ error: "No fields provided" });
    }

    try {
      const result = await userInfoService.updateUserInfo(
        userId,
        fieldsToUpdate
      );
      if (result.success) {
        return res.status(200).json({ message: "Successful update" });
      } else {
        return res.status(400).json({ error: result.error || "Update failed" });
      }
    } catch (err) {
      return res.status(500).json({ error: "Server error" });
    }
  }

  // user-info getters
  async getUserInfo(req, res) {
    const userId = req.params.userId;

    try {
      const result = await userInfoService.getUserInfo(userId);
      console.log(result.error);
      if (result?.error) {
        return res.status(400).json({ error: result.error || "Error" });
      }
      return res.status(200).json({ userInfo: result });
    } catch (err) {
      return res.status(500).json({ error: "Server error" });
    }
  }
}

export const userResource = new UserResource();
