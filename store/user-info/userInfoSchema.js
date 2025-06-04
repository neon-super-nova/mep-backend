export const userInfoCollection = "user-info";

export const UserInfo = {
  userId: ObjectId,
  favoriteCuisine: String,
  favoriteMeal: String,
  favoriteDish: String,
  dietaryRestriction: { type: String, required: false, default: null },
};
