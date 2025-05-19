import express from "express";
import { recipeService } from "../../service/recipes/recipeService.js";

class RecipeResource {
  constructor() {
    this.router = express.Router();
    this.recipeService = recipeService;
    this.initRoutes();
  }

  initRoutes() {
    this.router.post("/", this.addRecipe.bind(this));
    this.router.get("/:name", this.getRecipeByName.bind(this));
    this.router.get("/:ingredients", this.getRecipeByIngredients.bind(this));
    this.router.get(
      "/:cuisineRegion",
      this.getRecipeByCuisineRegion.bind(this)
    );
    this.router.get(
      "/:proteinChoice",
      this.getRecipeByProteinChoice.bind(this)
    );
    this.router.get(
      "/:dietaryRestriction",
      this.getRecipeByDietaryRestriction.bind(this)
    );
    this.router.get(
      "/:religiousRestriction",
      this.getRecipeByReligiousRestriction.bind(this)
    );
    this.router.patch("/:recipeId", this.updateRecipe.bind(this));
    this.router.delete("/:recipeId", this.deleteRecipe.bind(this));
    /*this.router.post("/id/:imageId", this.uploadImage.bind(this));*/
  }

  async addRecipe(req, res) {
    const {
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
    } = req.body;
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

  async getRecipeByName(req, res) {
    try {
      const recipeName = req.params.name;
      const recipe = await this.recipeService.getRecipeByName(recipeName);
      if (recipe) {
        res.status(200).json(recipe);
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

      if (recipes && recipes.length > 0) {
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
      const recipe = await this.recipeService.getRecipeByCuisineRegion(
        recipeRegion
      );
      if (recipe) {
        res.status(200).json(recipe);
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
      const recipe = await this.recipeService.getRecipeByProteinChoice(
        recipeProtein
      );
      if (recipe) {
        res.status(200).json(recipe);
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
      const recipe = await this.recipeService.getRecipeByDietaryRestriction(
        recipeDiet
      );
      if (recipe) {
        res.status(200).json(recipe);
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
      const recipe = await this.recipeService.getRecipeByReligiousRestriction(
        recipeReligion
      );
      if (recipe) {
        res.status(200).json(recipe);
      } else {
        res.status(404).json({ error: "Recipe not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }

  async updateRecipe(req, res) {
    try {
      const recipeId = req.params.recipeId;
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
        inputtedFields
      );

      console.log("Update result:", result);

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
      const result = await this.recipeService.deleteRecipe(recipeId);
      if (result.success) {
        res.status(200).json({ message: "Recipe successfully deleted" });
      } else {
        res.status(404).json({ error: "Recipe not found" });
      }
    } catch (error) {
      console.error(error);
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
