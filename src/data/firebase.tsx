import { initializeApp } from "firebase/app";
import {
  collection,
  doc,
  getDoc,
  getFirestore,
  setDoc,
} from "firebase/firestore";
import { getStorage, ref, getDownloadURL, uploadBytes } from "firebase/storage";

import firebase_config from "../resources/firebase/firebase_config.json";
import { RecipeType } from "../utils/recipe-utils";

const app = initializeApp(firebase_config);

const firestore = getFirestore(app);
export const recipesDB = collection(firestore, "recipes");
export function getRecipe(id: string) {
  return getDoc(doc(recipesDB, id));
}

export async function uploadRecipe(
  recipe: Omit<RecipeType, "id" | "img_url">,
  img: File
) {
  const result = await uploadRecipeImage(img);
  const url = await getDownloadURL(result.ref);
  return await setDoc(doc(recipesDB), {
    ...recipe,
    img_url: url,
  });
}

const storage = getStorage(app);
const recipeImagesStorage = ref(storage, "recipe_pictures");

export function uploadRecipeImage(img: File) {
  return uploadBytes(recipeImagesStorage, img);
}
