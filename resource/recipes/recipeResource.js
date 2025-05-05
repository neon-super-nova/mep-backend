import { recipeService } from "../../service/recipes/recipeService";

class RecipeResource {
  constructor() {
    this.recipeService = recipeResource;
    this.initRoutes();
  }

  initRoutes() {
    //all routes go here
  }
}
export const recipeResource = new RecipeResource();
