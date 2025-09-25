import { getDatabase } from "../database.js";
import { reviewStore } from "../reviews/reviewStore.js";
import { likeStore } from "../likes/likeStore.js";
import { notificationStore } from "../notifications/notificationStore.js";
import { userInfoStore } from "../user-info/userInfoStore.js";
import { recipeStore } from "../recipes/recipeStore.js";
import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";

class UserStore {
  constructor() {
    this.collection = null;
  }

  async init() {
    const db = getDatabase();
    this.collection = db.collection("users");
    this.recipeCollection = db.collection("recipes");
    this.likesCollection = db.collection("likes");
    this.reviewsCollection = db.collection("reviews");
    this.recipeStatsCollection = db.collection("recipeStats");

    this.reviewStore = reviewStore;
    this.likeStore = likeStore;
    this.notificationStore = notificationStore;
    this.userInfoStore = userInfoStore;
    this.recipeStore = recipeStore;

    await this.collection.createIndex({ email: 1 }, { unique: true });
    await this.collection.createIndex({ username: 1 }, { unique: true });
  }

  async findUser(userId) {
    const id = new ObjectId(userId);
    return Boolean(await this.collection.findOne({ _id: id }));
  }

  async userExistsByEmail(email) {
    const user = await this.collection.findOne({ email });
    return !!user;
  }

  async addNewUser(newUser) {
    const email = newUser.email.trim().toLowerCase();
    const username = newUser.username.trim().toLowerCase();

    const existingUser = await this.collection.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      throw new Error("User already registered");
    }

    const hashedPassword = await bcrypt.hash(newUser.password, 10);

    const userData = {
      username,
      email,
      password: hashedPassword,
      verified: false,
      verificationToken: newUser.verificationToken,
      firstName: newUser.firstName || "",
      lastName: newUser.lastName || "",
      createdAt: new Date(),
    };
    await this.collection.insertOne(userData);
  }

  async isAuthenticated(user) {
    const foundUser = await this.collection.findOne({
      username: user.username,
    });
    if (!foundUser) {
      return "USER_NOT_FOUND";
    }

    if (foundUser.verified === false) {
      return "NOT_VERIFIED";
    }

    if (user.password) {
      const isPasswordCorrect = await bcrypt.compare(
        user.password,
        foundUser.password
      );
      return isPasswordCorrect ? "SUCCESS" : "CREDENTIAL_MISMATCH";
    }

    if (user.oauthProvider) {
      // OAuth token check
      const oauthTokenField = `${user.oauthProvider}Token`; // e.g. googleToken
      if (
        foundUser[oauthTokenField] &&
        foundUser[oauthTokenField] === user.oauthToken
      ) {
        return "SUCCESS";
      } else {
        return "CREDENTIAL_MISMATCH";
      }
    }

    return "CREDENTIALS_MISMATCH";
  }

  async findByUsername(username) {
    return await this.collection.findOne({ username });
  }

  async findByEmail(email) {
    return await this.collection.findOne({ email });
  }

  async verifyEmail(token) {
    const user = await this.collection.findOne({ verificationToken: token });
    if (!user) {
      return "Invalid token";
    }
    await this.collection.updateOne(
      { _id: user._id },
      { $set: { verified: true }, $unset: { verificationToken: "" } }
    );
    return "Email successfully verified";
  }

  async updatePassword(email, newPassword) {
    const trimmedEmail = email.trim();
    const trimmedPassword = newPassword.trim();

    const userExists = await this.userExistsByEmail(trimmedEmail);
    if (!userExists) {
      return "User not found";
    }

    const newHashedPassword = await bcrypt.hash(trimmedPassword, 10);
    await this.collection.updateOne(
      { email: trimmedEmail },
      { $set: { password: newHashedPassword } }
    );
    return "Password updated";
  }

  async patchUser(userId, patchFields) {
    const objectId = ObjectId.createFromHexString(userId);
    if (patchFields.username) {
      const existingUsernameCheck = await this.findByUsername(
        patchFields.username
      );
      if (existingUsernameCheck) {
        throw new Error("INVALID_USERNAME");
      }
    }
    const result = await this.collection.updateOne(
      { _id: objectId },
      { $set: patchFields }
    );
    return result.modifiedCount > 0;
  }

  // Google OAuth helpers
  async findGoogleUser(email) {
    return await this.collection.findOne({ email });
  }

  async registerGoogleUser(profile) {
    const existingUser = await this.collection.findOne({
      email: profile.email,
    });
    if (existingUser) return existingUser;

    const newUser = {
      username: profile.email,
      email: profile.email,
      firstName: profile.name?.split(" ")[0] || "",
      lastName: profile.name?.split(" ")[1] || "",
      googleToken: profile.googleToken,
      googleRefreshToken: profile.googleRefreshToken,
      oauthProvider: "google",
      verified: true,
      createdAt: new Date(),
      pictureUrl: profile.pictureUrl || "",
    };
    const insertResult = await this.collection.insertOne(newUser);
    return { ...newUser, _id: insertResult.insertedId };
  }

  // user profile picture
  async updateUserPictureUrl(userId, pictureUrl) {
    const id = new ObjectId(userId);
    const user = await this.collection.findOne({ _id: id });
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }
    const result = await this.collection.findOneAndUpdate(
      { _id: id },
      { $set: { pictureUrl } },
      { returnDocument: "after" }
    );
    return result;
  }

  // user getters
  async getUser(userId) {
    const user = await this.collection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }
    return {
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
    };
  }

  async getUserRecipeCount(userId) {
    const findUser = await this.findUser(userId);
    if (!findUser) {
      throw new Error("USER_NOT_FOUND");
    }
    const count = await this.recipeCollection.countDocuments({ userId });
    return count;
  }

  async getUserLikeCount(userId) {
    const id = new ObjectId(userId);
    const user = await this.collection.findOne({ _id: id });
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }
    const count = await this.likesCollection.countDocuments({ userId });
    return count;
  }

  async getUserGlobalLikeCount(userId) {
    const id = new ObjectId(userId);
    const user = await this.collection.findOne({ _id: id });
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }
    const query = await this.recipeCollection
      .aggregate([
        { $match: { userId: userId } },
        {
          $group: {
            _id: null,
            totalLikes: { $sum: "$totalLikes" },
          },
        },
      ])
      .toArray();
    // aggregate functions in mongodb return a cursor always
    // s0, resulting array (ex. global count = 100) will look like:
    // query = [{_id: null, totalLikes: 100}]

    return query.length > 0 ? query[0].totalLikes : 0;
  }

  async getUserPictureUrl(userId) {
    const user = await this.collection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }
    const url = user.pictureUrl;
    return url;
  }

  async getUserRecipes(userId) {
    const user = await this.collection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    const name = user.firstName + " " + user.lastName;
    const username = user.username.toLowerCase();

    const recipes = await this.recipeCollection
      .aggregate([
        { $match: { userId: userId } },
        {
          $project: {
            _id: 1,
            name: 1,
            imageUrls: 1,
            authorName: name,
            username: username,
            createdAt: 1,
          },
        },
      ])
      .toArray();

    return recipes || [];
  }

  async getUserLikedRecipes(userId) {
    const id = new ObjectId(userId);
    const user = await this.collection.findOne({ _id: id });
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    const likedRecipeLookup = await this.likesCollection
      .aggregate([
        { $match: { userId: userId } },
        {
          $project: {
            recipeId: 1,
            _id: 0,
          },
        },
      ])
      .toArray();

    const likedRecipeIds = likedRecipeLookup.map(
      (recipe) => new ObjectId(recipe.recipeId)
    );

    if (likedRecipeIds.length === 0) return [];

    const likedRecipes = await this.recipeCollection
      .aggregate([
        { $match: { _id: { $in: likedRecipeIds } } },
        {
          $lookup: {
            from: "users",
            let: { userIdStr: "$userId" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", { $toObjectId: "$$userIdStr" }],
                  },
                },
              },
              {
                $project: {
                  firstName: 1,
                  lastName: 1,
                  username: 1,
                },
              },
            ],
            as: "recipeAuthor",
          },
        },
        { $unwind: "$recipeAuthor" },
        {
          $project: {
            _id: 1,
            name: 1,
            imageUrls: 1,
            authorName: {
              $concat: [
                "$recipeAuthor.firstName",
                " ",
                "$recipeAuthor.lastName",
              ],
            },
            username: "$recipeAuthor.username",
          },
        },
      ])
      .toArray();
    return likedRecipes;
  }

  async deleteUser(userId, deleteOption) {
    const existingUser = await this.findUser(userId);
    if (!existingUser) {
      throw new Error("USER_NOT_FOUND");
    }

    // give two options full OR partial DELETE

    if (deleteOption == "partial") {
      await this.collection.updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: {
            deleted: true,
            username: "deletedUser",
            firstName: "Deleted",
            lastName: "User",
            email: null,
            password: null,
            pictureUrl: null,
            googleToken: null,
          },
        }
      );
      return { message: "Partial delete success" };
      // FULL_DELETE
    } else {
      try {
        // delete all recipes by user
        await this.recipeStore.deleteAllRecipesByUser(userId);

        // delete reviews and update new reviewCount and averageRating
        await this.reviewStore.deleteReviewsByUser(userId);

        // delete likes and update likeCount
        await this.likeStore.deleteLikesByUser(userId);

        // delete notifications
        await this.notificationStore.deleteUserNotifications(userId);

        // delete user-info
        await this.userInfoStore.deleteUserInfo(userId);

        // now delete user
        await this.collection.deleteOne({ _id: new ObjectId(userId) });
        return { message: "Full delete success" };
      } catch (err) {
        return { error: err || "error occurred" };
      }
    }
  }
}

export const userStore = new UserStore();
