import { ObjectId } from "mongodb";

export const isIdValid = (id) => {
  return ObjectId.isValid(id) && String(new ObjectId(id)) === id;
};
