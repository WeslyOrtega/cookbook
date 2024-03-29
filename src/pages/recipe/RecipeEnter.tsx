import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormItem,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { RxCamera, RxTrash } from "react-icons/rx";
import { uploadRecipe } from "@/src/data/firebase";
import { Timestamp } from "firebase/firestore";
import { Navigate } from "react-router-dom";
import { useFieldArray, useForm } from "react-hook-form";
import ImageUploadModal from "@/src/components/Image/ImageUploadModal";
import LoadingSpinner from "@/src/components/Spinner/LoadingSpinner";

const DESCRIPTION_INPUT_ID = "recipe-description-input";
const FILE_INPUT_ID = "recipe-img-input";

// Look into triggering validation on different events for each field
const formSchema = z.object({
  name: z
    .string()
    .min(5, { message: "Must be at least 5 characters" })
    .regex(/^[a-zA-Z\s]+$/, { message: "Can only contain letters and spaces" }),
  ingredients: z
    .array(
      z.object({
        val: z.string().min(1, { message: "Must be at least 1 character" }),
      })
    )
    .nonempty(),
  instructions: z
    .array(
      z.object({
        val: z.string().min(1, { message: "Must be at least 1 character" }),
      })
    )
    .nonempty(),
  description: z
    .string()
    .regex(/\S+\s\S+/, { message: "Must be at least 2 words" }),
  img: z.string().min(1, { message: "Must select an image" }),
});

const RecipeEnter = () => {
  // TODO: Look into moving this into useLoading like toast
  // TODO: also disable scrolling while loading
  const [loading, setLoading] = useState(false);
  const [imgSelected, setImgSelected] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [imgModalOpen, setImgModalOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: {
      ingredients: [{ val: "" }],
      instructions: [{ val: "" }],
      name: "",
      description: "",
      img: "",
    },
  });
  const {
    fields: ingredients,
    append: addIngredient,
    remove: removeIngredient,
  } = useFieldArray({
    control: form.control,
    name: "ingredients",
  });
  const {
    fields: instructions,
    append: addInstruction,
    remove: removeInstruction,
  } = useFieldArray({
    control: form.control,
    name: "instructions",
  });

  const saveImgURL = (url: string) => {
    form.setValue("img", url);
    setImgSelected(true);
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    uploadRecipe(
      {
        name: values.name,
        ingredients: values.ingredients.map((it) => it.val),
        instructions: values.instructions.map((it) => it.val),
        description: values.description,
        tags: [],
        owner: "Wesly Ortega",
        creation_date: Timestamp.now(),
      },
      values.img
    ).then(
      (_) => {
        setLoading(false);
        toast({ description: "Recipe uploaded succesfully!" });
        setUploaded(true);
      },
      (_) => {
        toast({
          description:
            "There was an issue uploading your recipe. Try again later",
          variant: "destructive",
        });
      }
    );
    setLoading(true);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        autoComplete="off"
      >
        {loading && (
          <div className="fixed inset-0 z-50 bg-black/80">
            <LoadingSpinner className="w-10 h-10 absolute z-10 top-1/2 left-1/2" />
          </div>
        )}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recipe Name</FormLabel>
              <FormControl>
                <Input
                  className="w-full"
                  placeholder="Eg. Roasted Chicken"
                  maxLength={100}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="img"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor={FILE_INPUT_ID}>Recipe Picture</FormLabel>
              {/* Hidden input to contain the url of the image */}
              <Input {...field} className="hidden" />
              <div className="sm:w-[350px] rounded-2xl overflow-hidden aspect-square">
                <Button
                  id={FILE_INPUT_ID}
                  type="button"
                  className="w-full h-full p-0 rounded-2xl"
                  variant="outline"
                  onClick={() => setImgModalOpen(true)}
                >
                  {!imgSelected && <RxCamera className="h-full w-full m-28" />}
                  {imgSelected && (
                    <img
                      src={form.getValues("img")}
                      className="w-full h-full hover:opacity-70"
                    />
                  )}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor={DESCRIPTION_INPUT_ID}>Description</FormLabel>
              <Textarea
                id={DESCRIPTION_INPUT_ID}
                placeholder="Eg. Very taste and easy to make"
                maxLength={500}
                autoExpand
                {...field}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col gap-2">
          <h2>Ingredients</h2>
          {ingredients.map((_, i) => {
            return (
              <FormField
                control={form.control}
                key={i}
                name={`ingredients.${i}.val`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ingredient {i + 1}</FormLabel>
                    <div className="flex flex-row gap-4">
                      <Input
                        maxLength={100}
                        placeholder="Eg. 1 Chicken Breast"
                        {...field}
                      />
                      <Button variant="destructive" className="py-1 px-2">
                        <RxTrash
                          className="w-full h-full"
                          onClick={() => removeIngredient(i)}
                        />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            );
          })}
          <Button
            variant="secondary"
            onClick={() => addIngredient({ val: "" })}
          >
            Add
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          <h2>Instructions</h2>
          {instructions.map((_, i) => {
            return (
              <FormField
                control={form.control}
                key={i}
                name={`instructions.${i}.val`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Step {i + 1}</FormLabel>
                    <div className="flex flex-row gap-4">
                      <Textarea
                        autoExpand
                        maxLength={700}
                        placeholder="Eg. 1 Chicken Breast"
                        {...field}
                      />
                      <Button variant="destructive" className="py-1 px-2">
                        <RxTrash
                          className="w-full h-full"
                          onClick={() => removeInstruction(i)}
                        />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            );
          })}
          <Button
            variant="secondary"
            onClick={() => addInstruction({ val: "" })}
          >
            Add
          </Button>
        </div>
        <div className="flex flex-row gap-2">
          <Button type="submit" className="w-full">
            Save
          </Button>
          <Button className="w-full" variant="destructive">
            Cancel
          </Button>
        </div>
      </form>
      <ImageUploadModal
        isOpen={imgModalOpen}
        saveImgUrl={saveImgURL}
        closeModal={() => setImgModalOpen(false)}
      />
      {uploaded && <Navigate to="/" />}
    </Form>
  );
};

export default RecipeEnter;
