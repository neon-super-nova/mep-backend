import { isIdValid } from "../config/validation/isIdValid.js";

export function userIdCheck(req, res, next) {
  const { userId } = req.params;
  if (!isIdValid(userId)) {
    return res.status(400).json({ error: "Invalid user id" });
  }
  next();
}

export function recipeIdCheck(req, res, next) {
  const { recipeId } = req.params;
  if (!isIdValid(recipeId)) {
    return res.status(400).json({ error: "Invalid recipe id" });
  }
  next();
}
