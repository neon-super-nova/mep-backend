import express from "express";
import { recipeService } from "../../service/recipes/recipeService.js";
import { likeService } from "../../service/likes/likeService.js";
import { reviewService } from "../../service/reviews/reviewService.js";
import { authenticateToken } from "../../middleware/authentication.js";

class RecipeResource {
  constructor() {
    this.router = express.Router();
    this.recipeService = recipeService;
    this.likeService = likeService;
    this.reviewService = reviewService;
    this.initRoutes();
  }

  initRoutes() {
    this.router.post("/", authenticateToken, this.addRecipe.bind(this));
    this.router.patch(
      "/:recipeId",
      authenticateToken,
      this.updateRecipe.bind(this)
    );
    this.router.delete(
      "/:recipeId",
      authenticateToken,
      this.deleteRecipe.bind(this)
    );

    // all GETs for search filtering
    this.router.get("/name/:name", this.getRecipeByName.bind(this));
    this.router.get(
      "/ingredients/:ingredients",
      this.getRecipeByIngredients.bind(this)
    );
    this.router.get(
      "/cuisine/:cuisineRegion",
      this.getRecipeByCuisineRegion.bind(this)
    );
    this.router.get(
      "/protein/:proteinChoice",
      this.getRecipeByProteinChoice.bind(this)
    );
    this.router.get(
      "/dietary-restriction/:dietaryRestriction",
      this.getRecipeByDietaryRestriction.bind(this)
    );
    this.router.get(
      "/religious-restriction/:religiousRestriction",
      this.getRecipeByReligiousRestriction.bind(this)
    );

    // likes
    this.router.post(
      "/:recipeId/like",
      authenticateToken,
      this.likeRecipe.bind(this)
    );
    this.router.post(
      "/:recipeId/unlike",
      authenticateToken,
      this.unlikeRecipe.bind(this)
    );

    // reviews
    this.router.post(
      "/:recipeId/review",
      authenticateToken,
      this.addReview.bind(this)
    );
    this.router.delete(
      "/:recipeId/review",
      authenticateToken,
      this.deleteReview.bind(this)
    );
    this.router.patch(
      "/:recipeId/review",
      authenticateToken,
      this.updateReview.bind(this)
    );
    this.router.get(
      "/:recipeId/review-stats",
      this.getRecipeReviewStats.bind(this)
    );
    this.router.get("/:recipeId/reviews", this.getAllRecipeReviews.bind(this));

    /*this.router.post("/id/:imageId", this.uploadImage.bind(this));*/
  }

  async addRecipe(req, res) {
    const {
      name,
      prepTime,
      cookTime,
      servings,
      ingredients,
      instructions,
      imageUrl,
      cuisineRegion,
      proteinChoice,
      dietaryRestriction,
      religiousRestriction,
    } = req.body;

    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const recipe = {
        userId,
        name,
        prepTime,
        cookTime,
        servings,
        ingredients,
        instructions,
        imageUrl,
        cuisineRegion,
        proteinChoice,
        dietaryRestriction,
        religiousRestriction,
      };
      const result = await this.recipeService.addRecipe(recipe);
      res
        .status(200)
        .json({ message: "Recipe successfully added", recipeId: result });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }

  async updateRecipe(req, res) {
    try {
      const recipeId = req.params.recipeId;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const patchFields = req.body;

      const allowedFields = [
        "name",
        "prepTime",
        "cookTime",
        "servings",
        "ingredients",
        "instructions",
        "imageUrl",
        "cuisineRegion",
        "proteinChoice",
        "dietaryRestriction",
        "religiousRestriction",
      ];

      const inputtedFields = {};

      for (const field of allowedFields) {
        if (field in patchFields) {
          inputtedFields[field] = patchFields[field];
        }
      }

      if (Object.keys(inputtedFields).length === 0) {
        return res.status(400).json({ error: "Empty fields" });
      }

      const result = await this.recipeService.updateRecipe(
        recipeId,
        userId,
        inputtedFields
      );

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

  async deleteRecipe(req, res) {
    try {
      const recipeId = req.params.recipeId;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const result = await this.recipeService.deleteRecipe(recipeId, userId);

      if (result.success) {
        return res.status(200).json({ message: "Recipe successfully deleted" });
      } else {
        return res.status(404).json({ error: result.message });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error" });
    }
  }

  // all GETs for search filtering

  async getRecipeByName(req, res) {
    try {
      const recipeName = req.params.name;
      const regex = new RegExp(recipeName, "i");
      const recipes = await this.recipeService.getRecipeByName(regex);
      if (recipes.length > 0) {
        res.status(200).json(recipes);
      } else {
        res.status(404).json({ error: "Recipe not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  }

  async getRecipeByIngredients(req, res) {
    try {
      const ingredient = req.params.ingredients;
      const regex = new RegExp(ingredient, "i");
      const recipes = await this.recipeService.getRecipeByIngredients(regex);

      if (recipes.length > 0) {
        res.status(200).json(recipes);
      } else {
        res.status(404).json({ error: "Recipe not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }

  async getRecipeByCuisineRegion(req, res) {
    try {
      const recipeRegion = req.params.cuisineRegion;
      const regex = new RegExp(recipeRegion, "i");
      const recipes = await this.recipeService.getRecipeByCuisineRegion(regex);
      if (recipes.length > 0) {
        res.status(200).json(recipes);
      } else {
        res.status(404).json({ error: "Recipe not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }

  async getRecipeByProteinChoice(req, res) {
    try {
      const recipeProtein = req.params.proteinChoice;
      const regex = new RegExp(recipeProtein, "i");
      const recipes = await this.recipeService.getRecipeByProteinChoice(regex);
      if (recipes.length > 0) {
        res.status(200).json(recipes);
      } else {
        res.status(404).json({ error: "Recipe not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }

  async getRecipeByDietaryRestriction(req, res) {
    try {
      const recipeDiet = req.params.dietaryRestriction;
      const regex = new RegExp(recipeDiet, "i");
      const recipes = await this.recipeService.getRecipeByDietaryRestriction(
        regex
      );
      if (recipes.length > 0) {
        res.status(200).json(recipes);
      } else {
        res.status(404).json({ error: "Recipe not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }

  async getRecipeByReligiousRestriction(req, res) {
    try {
      const recipeReligion = req.params.religiousRestriction;
      const regex = new RegExp(recipeReligion, "i");
      const recipes = await this.recipeService.getRecipeByReligiousRestriction(
        regex
      );
      if (recipes.length > 0) {
        res.status(200).json(recipes);
      } else {
        res.status(404).json({ error: "Recipe not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }

  // likes
  async likeRecipe(req, res) {
    try {
      const recipeId = req.params.recipeId;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const result = await this.likeService.like(userId, recipeId);

      if (result.success) {
        return res.status(200).json({ message: result.success });
      } else {
        return res
          .status(400)
          .json({ error: result.error || "Could not like recipe" });
      }
    } catch (err) {
      return res.status(500).json({ error: "Server error" });
    }
  }

  async unlikeRecipe(req, res) {
    try {
      const recipeId = req.params.recipeId;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const result = await this.likeService.unlike(userId, recipeId);

      if (result.success) {
        return res.status(200).json({ message: "Recipe successfully unliked" });
      } else {
        return res
          .status(400)
          .json({ error: result.error || "Could not unlike recipe" });
      }
    } catch (err) {
      return res.status(500).json({ error: "Server error" });
    }
  }

  // reviews
  async addReview(req, res) {
    try {
      const { rating, comment } = req.body;
      const recipeId = req.params.recipeId;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const result = await this.reviewService.addReview(
        userId,
        recipeId,
        rating,
        comment
      );
      if (result.success) {
        return res.status(200).json({ message: "Review successfully added" });
      } else {
        return res
          .status(400)
          .json({ error: result.error || "Could not add review" });
      }
    } catch (err) {
      return res.status(500).json({ error: "Server error" });
    }
  }

  async deleteReview(req, res) {
    try {
      const recipeId = req.params.recipeId;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const result = await this.reviewService.deleteReview(userId, recipeId);
      if (result.success) {
        return res.status(200).json({ message: "Review deleted" });
      } else {
        return res.status(400).json({ error: result.error });
      }
    } catch (err) {
      return res.status(500).json({ err: "Server error" });
    }
  }

  async updateReview(req, res) {
    try {
      const recipeId = req.params.recipeId;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const inputtedFields = req.body;
      const allowedFields = ["rating", "comment"];
      const fieldsToUpdate = {};

      for (const field of allowedFields) {
        if (field in inputtedFields) {
          fieldsToUpdate[field] = inputtedFields[field];
        }
      }

      if (Object.keys(fieldsToUpdate).length === 0) {
        return res.status(400).json({ error: "Empty fields" });
      }
      const result = await this.reviewService.updateReview(
        userId,
        recipeId,
        fieldsToUpdate
      );

      if (result.success) {
        return res.status(200).json({ message: "Review successfully updated" });
      } else {
        return res.status(400).json({ error: result.error || "Update failed" });
      }
    } catch (err) {
      return res.status(500).json({ error: "Server error" });
    }
  }

  async getRecipeReviewStats(req, res) {
    try {
      const recipeId = req.params.recipeId;
      const result = await this.reviewService.getRecipeStats(recipeId);
      if (result.error) {
        return res.status(404).json({ error: result.error });
      }
      return res.status(200).json(result);
    } catch (err) {
      console.error("Unexpected error:", err);
      return res.status(500).json({ error: "Server error" });
    }
  }

  async getAllRecipeReviews(req, res) {
    try {
      const recipeId = req.params.recipeId;
      const result = await this.reviewService.getAllRecipeReviews(recipeId);
      if (result.error) {
        return res.status(404).json({ error: result.error });
      }
      return res.status(200).json(result);
    } catch (err) {
      return res.status(500).json({ error: "Server error" });
    }
  }
}
/* async uploadImage(req, res) {
    try {
      const imageId = req.params.imageId;
      const image = req.file;
      const result = await this.recipeService.uploadImage(imageId, image);
      if (result) {
        res.status(200).json({ message: "Image successfully uploaded" });
      } else {
        res.status(404).json({ error: "Image not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }*/

export const recipeResource = new RecipeResource();
