import express from "express";
import { recipeService } from "../../service/recipes/recipeService.js";
import { authenticateToken } from "../../middleware/authentication.js";

class RecipeResource {
  constructor() {
    this.router = express.Router();
    this.recipeService = recipeService;
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

    /*this.router.post("/id/:imageId", this.uploadImage.bind(this));*/
  }

  async addRecipe(req, res) {
    const {
      name,
      prepTime,
      cookTime,
      totalTime,
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
        totalTime,
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
        "totalTime",
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
      console.error(error);
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
