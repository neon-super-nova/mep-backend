import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;

export const isIdValid = (id) => {
  return ObjectId.isValid(id) && String(new ObjectId(id)) === id;
};
