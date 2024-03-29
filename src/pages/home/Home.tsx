import { useEffect, useState } from "react";
import { getDocs } from "firebase/firestore";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { recipesDB } from "../../data/firebase";
import { RecipeType } from "../../utils/recipe-utils";
import FirebaseImg from "@/src/components/Image/FirebaseImage";
import { RxPlus } from "react-icons/rx";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const RecipeCard = (props: RecipeType) => {
  const { id, name, img_url } = props;

  return (
    <a className="w-5/6 sm:w-full h-full" href={`/recipe/${id}`}>
      <Card className="overflow-hidden h-full flex flex-col justify-end">
        <FirebaseImg img_url={img_url} className="w-full flex-grow" />
        <CardHeader>
          <CardTitle className="inline-block card-title overflow-hidden whitespace-nowrap text-ellipsis">
            {name}
          </CardTitle>
        </CardHeader>
      </Card>
    </a>
  );
};

const Home = () => {
  const [recipes, setRecipes] = useState([] as RecipeType[]);

  useEffect(() => {
    getDocs(recipesDB).then((r) => {
      const docs = r.docs;
      const recipes = docs.map((it) => {
        return { ...it.data(), id: it.id } as RecipeType;
      });
      setRecipes(recipes);
    });
  }, []);

  return (
    <div>
      <h1 className="text-3xl">Home</h1>
      <article>
        <span className="flex flex-row justify-between items-baseline mt-8 mb-3">
          <h2 className="text-xl">Your Recipes</h2>
        </span>
        <section className="flex flex-col justify-center items-center gap-3 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {recipes.map((recipe, i) => (
            <RecipeCard {...recipe} key={i} />
          ))}
        </section>
      </article>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild className="fixed bottom-6 right-6">
            <a href="/recipe/new">
              <Button className="px-2 rounded-full h-12">
                <RxPlus className="w-full h-full" />
              </Button>
            </a>
          </TooltipTrigger>
          <TooltipContent>Add a new recipe</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default Home;
