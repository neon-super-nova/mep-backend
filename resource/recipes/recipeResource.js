import express from "express";
import { recipeService } from "../../service/recipes/recipeService.js";
import { likeService } from "../../service/likes/likeService.js";
import { reviewService } from "../../service/reviews/reviewService.js";
import { authenticateToken } from "../../middleware/authentication.js";
import upload from "../../middleware/upload.js";
import { cloudinaryUpload } from "../../config/cloudinary/cloudinaryUpload.js";
import { userIdCheck, recipeIdCheck } from "../../middleware/objectIdCheck.js";

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
      recipeIdCheck,
      this.updateRecipe.bind(this)
    );
    this.router.delete(
      "/:recipeId",
      authenticateToken,
      recipeIdCheck,
      this.deleteRecipe.bind(this)
    );
    this.router.post(
      "/:recipeId/image",
      authenticateToken,
      recipeIdCheck,
      upload.single("image"),
      this.uploadImage.bind(this)
    );

    // dashboard recipes
    this.router.get("/top-rated", this.getTopRatedRecipes.bind(this));
    this.router.get("/trending", this.getTrendingRecipes.bind(this));

    // all GETs for search filtering
    this.router.get("/", this.getAllRecipes.bind(this));
    this.router.get("/:recipeId", recipeIdCheck, this.getRecipeById.bind(this));
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
      recipeIdCheck,
      this.likeRecipe.bind(this)
    );
    this.router.post(
      "/:recipeId/unlike",
      authenticateToken,
      recipeIdCheck,
      this.unlikeRecipe.bind(this)
    );

    // reviews
    this.router.post(
      "/:recipeId/review",
      authenticateToken,
      recipeIdCheck,
      this.addReview.bind(this)
    );
    this.router.delete(
      "/:recipeId/review",
      authenticateToken,
      recipeIdCheck,
      this.deleteReview.bind(this)
    );
    this.router.patch(
      "/:recipeId/review",
      authenticateToken,
      recipeIdCheck,
      this.updateReview.bind(this)
    );
    this.router.get(
      "/:recipeId/review-stats",
      recipeIdCheck,
      this.getRecipeReviewStats.bind(this)
    );
    this.router.get(
      "/:recipeId/reviews",
      recipeIdCheck,
      this.getAllRecipeReviews.bind(this)
    );
  }

  async addRecipe(req, res) {
    const {
      name,
      description,
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

    if (description && description.length > 300) {
      return res
        .status(400)
        .json({ error: "Description must have a maximum of 300 characters." });
    }

    try {
      const recipe = {
        userId,
        name,
        description,
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

      if (description && description.length > 300) {
        return res.status(400).json({
          error: "Description must have a maximum of 300 characters.",
        });
      }

      const patchFields = req.body;

      const allowedFields = [
        "name",
        "description",
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

  async uploadImage(req, res) {
    const recipeId = req.params.recipeId;
    const userId = req.user?.userId;
    const image = req.file;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!image) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    try {
      const uploadResult = await cloudinaryUpload(image.buffer, "recipes");

      const updatedRecipe = await this.recipeService.updateRecipeImage(
        userId,
        recipeId,
        uploadResult.secure_url
      );

      if (!updatedRecipe) {
        return res
          .status(400)
          .json({ error: "Recipe not found or forbidden action" });
      }
      return res
        .status(200)
        .json({ success: true, imageUrl: uploadResult.secure_url });
    } catch (err) {
      return res.status(500).json({ error: "Server error" });
    }
  }
  // all GETs for search filtering

  async getAllRecipes(req, res) {
    try {
      const recipes = await this.recipeService.getAllRecipes();
      if (recipes?.error) {
        return res.status(400).json({ error: recipes.error });
      }
      return res.status(200).json({ recipes });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: "Server error" });
    }
  }

  async getRecipeById(req, res) {
    const recipeId = req.params.recipeId;

    try {
      const result = await this.recipeService.getRecipeById(recipeId);
      if (result?.error) {
        return res.status(400).json({ error: result.error });
      }
      return res.status(200).json({ success: true, recipe: result });
    } catch (err) {
      return res.status(500).json({ error: "Server error" });
    }
  }

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
      return res.status(500).json({ error: "Server error" });
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
    const recipeId = req.params.recipeId;

    try {
      const result = await this.reviewService.getAllRecipeReviews(recipeId);
      if (result.error) {
        return res.status(404).json({ error: result.error });
      }
      return res.status(200).json(result);
    } catch (err) {
      return res.status(500).json({ error: "Server error" });
    }
  }

  // trending recipes
  async getTopRatedRecipes(req, res) {
    try {
      const topRatedRecipes = await this.recipeService.getTopRatedRecipes();
      return res.status(200).json({ topRatedRecipes });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: "Error occured" });
    }
  }

  async getTrendingRecipes(req, res) {
    try {
      const trendingRecipes = await this.recipeService.getTrendingRecipes();
      return res.status(200).json({ trendingRecipes });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: "Server error" });
    }
  }
}

export const recipeResource = new RecipeResource();
