import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SAMPLE_RECIPES = [
  {
    name: "Spaghetti Carbonara",
    description: "Classic Roman pasta with eggs, pecorino, guanciale, and black pepper.",
    cuisine: "Italian",
    difficulty: "MEDIUM" as const,
    prepTime: 15,
    cookingTime: 20,
    servings: 4,
    tags: ["pasta", "italian", "quick"],
    instructions: "1. Cook spaghetti al dente. 2. Fry guanciale until crispy. 3. Mix eggs and pecorino. 4. Toss hot pasta with guanciale, remove from heat, add egg mixture, toss quickly. Season with pepper.",
    ingredients: [
      { name: "Spaghetti", quantity: 400, unit: "g" },
      { name: "Guanciale", quantity: 200, unit: "g" },
      { name: "Eggs", quantity: 4, unit: "whole" },
      { name: "Pecorino Romano", quantity: 100, unit: "g" },
      { name: "Black pepper", quantity: 2, unit: "tsp" },
    ],
  },
  {
    name: "Chicken Tikka Masala",
    description: "Tender chicken in a rich, spiced tomato-cream sauce.",
    cuisine: "Indian",
    difficulty: "MEDIUM" as const,
    prepTime: 30,
    cookingTime: 40,
    servings: 4,
    tags: ["chicken", "indian", "curry"],
    instructions: "1. Marinate chicken in yogurt and spices 30 min. 2. Grill or broil until charred. 3. Make sauce with onion, tomato, cream, and spices. 4. Add chicken to sauce, simmer 10 min.",
    ingredients: [
      { name: "Chicken breast", quantity: 600, unit: "g" },
      { name: "Plain yogurt", quantity: 200, unit: "ml" },
      { name: "Tomato passata", quantity: 400, unit: "ml" },
      { name: "Heavy cream", quantity: 100, unit: "ml" },
      { name: "Garam masala", quantity: 2, unit: "tsp" },
      { name: "Cumin", quantity: 1, unit: "tsp" },
      { name: "Garlic", quantity: 4, unit: "cloves" },
      { name: "Ginger", quantity: 1, unit: "tbsp" },
    ],
  },
  {
    name: "Avocado Toast",
    description: "Simple, nutritious breakfast with creamy avocado on toasted sourdough.",
    cuisine: "American",
    difficulty: "EASY" as const,
    prepTime: 5,
    cookingTime: 5,
    servings: 2,
    tags: ["breakfast", "vegetarian", "quick"],
    instructions: "1. Toast sourdough slices. 2. Mash avocado with lemon juice, salt, and pepper. 3. Spread on toast. 4. Top with red pepper flakes and optional poached egg.",
    ingredients: [
      { name: "Sourdough bread", quantity: 2, unit: "slices" },
      { name: "Avocado", quantity: 1, unit: "whole" },
      { name: "Lemon juice", quantity: 1, unit: "tbsp" },
      { name: "Red pepper flakes", quantity: 0.5, unit: "tsp" },
    ],
  },
  {
    name: "Beef Stir Fry",
    description: "Quick and flavorful beef with vegetables in a savory sauce.",
    cuisine: "Chinese",
    difficulty: "EASY" as const,
    prepTime: 15,
    cookingTime: 10,
    servings: 3,
    tags: ["beef", "chinese", "quick", "weeknight"],
    instructions: "1. Slice beef thin, marinate in soy sauce and cornstarch. 2. Prep vegetables. 3. Stir fry beef on high heat, set aside. 4. Stir fry vegetables. 5. Combine with sauce, toss together.",
    ingredients: [
      { name: "Beef sirloin", quantity: 400, unit: "g" },
      { name: "Broccoli", quantity: 200, unit: "g" },
      { name: "Bell pepper", quantity: 1, unit: "whole" },
      { name: "Soy sauce", quantity: 3, unit: "tbsp" },
      { name: "Oyster sauce", quantity: 2, unit: "tbsp" },
      { name: "Cornstarch", quantity: 1, unit: "tbsp" },
      { name: "Garlic", quantity: 3, unit: "cloves" },
    ],
  },
  {
    name: "Margherita Pizza",
    description: "Neapolitan-style pizza with San Marzano tomatoes, fresh mozzarella, and basil.",
    cuisine: "Italian",
    difficulty: "MEDIUM" as const,
    prepTime: 90,
    cookingTime: 12,
    servings: 2,
    tags: ["pizza", "italian", "vegetarian"],
    instructions: "1. Make dough, let rise 1 hour. 2. Stretch to thin round. 3. Spread tomato sauce. 4. Add torn mozzarella. 5. Bake at max oven temp 10-12 min. 6. Top with fresh basil.",
    ingredients: [
      { name: "Tipo 00 flour", quantity: 300, unit: "g" },
      { name: "San Marzano tomatoes", quantity: 200, unit: "ml" },
      { name: "Fresh mozzarella", quantity: 125, unit: "g" },
      { name: "Fresh basil", quantity: 10, unit: "leaves" },
      { name: "Olive oil", quantity: 2, unit: "tbsp" },
      { name: "Yeast", quantity: 7, unit: "g" },
    ],
  },
  {
    name: "Greek Salad",
    description: "Fresh Mediterranean salad with cucumber, tomatoes, olives, and feta.",
    cuisine: "Mediterranean",
    difficulty: "EASY" as const,
    prepTime: 15,
    cookingTime: 0,
    servings: 4,
    tags: ["salad", "vegetarian", "healthy", "no-cook"],
    instructions: "1. Chop cucumber and tomatoes into chunks. 2. Slice red onion. 3. Combine with olives and feta. 4. Dress with olive oil, red wine vinegar, oregano, salt and pepper.",
    ingredients: [
      { name: "Cucumber", quantity: 1, unit: "whole" },
      { name: "Tomatoes", quantity: 3, unit: "whole" },
      { name: "Red onion", quantity: 0.5, unit: "whole" },
      { name: "Kalamata olives", quantity: 100, unit: "g" },
      { name: "Feta cheese", quantity: 200, unit: "g" },
      { name: "Olive oil", quantity: 3, unit: "tbsp" },
      { name: "Dried oregano", quantity: 1, unit: "tsp" },
    ],
  },
  {
    name: "French Onion Soup",
    description: "Rich, deeply caramelized onion soup topped with gruyère crouton.",
    cuisine: "French",
    difficulty: "MEDIUM" as const,
    prepTime: 20,
    cookingTime: 75,
    servings: 4,
    tags: ["soup", "french", "comfort"],
    instructions: "1. Caramelize onions in butter 45-60 min. 2. Deglaze with wine. 3. Add beef broth and thyme, simmer 20 min. 4. Ladle into oven-safe bowls, top with baguette and gruyère. 5. Broil until golden.",
    ingredients: [
      { name: "Yellow onions", quantity: 1.5, unit: "kg" },
      { name: "Butter", quantity: 4, unit: "tbsp" },
      { name: "Dry white wine", quantity: 120, unit: "ml" },
      { name: "Beef broth", quantity: 1.5, unit: "L" },
      { name: "Baguette", quantity: 0.5, unit: "whole" },
      { name: "Gruyère", quantity: 150, unit: "g" },
    ],
  },
  {
    name: "Tacos al Pastor",
    description: "Classic Mexican street tacos with marinated pork, pineapple, and cilantro.",
    cuisine: "Mexican",
    difficulty: "HARD" as const,
    prepTime: 240,
    cookingTime: 20,
    servings: 6,
    tags: ["tacos", "mexican", "pork"],
    instructions: "1. Marinate pork in achiote, orange juice, and spices 4 hours. 2. Grill or broil in thin slices. 3. Warm corn tortillas. 4. Serve with pineapple, onion, cilantro, and salsa verde.",
    ingredients: [
      { name: "Pork shoulder", quantity: 1, unit: "kg" },
      { name: "Achiote paste", quantity: 3, unit: "tbsp" },
      { name: "Orange juice", quantity: 120, unit: "ml" },
      { name: "Corn tortillas", quantity: 18, unit: "whole" },
      { name: "Pineapple", quantity: 0.5, unit: "whole" },
      { name: "Cilantro", quantity: 0.5, unit: "bunch" },
      { name: "White onion", quantity: 1, unit: "whole" },
    ],
  },
];

async function main() {
  console.log("Seeding database...");

  const email = "demo@mealmap.app";
  const password = await bcrypt.hash("Demo1234!", 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name: "Demo User", password },
  });

  let household = await prisma.household.findFirst({
    where: { members: { some: { userId: user.id } } },
  });

  if (!household) {
    household = await prisma.household.create({
      data: {
        name: "Demo Household",
        members: { create: { userId: user.id, role: "OWNER" } },
      },
    });
  }

  for (const recipe of SAMPLE_RECIPES) {
    const seedId = `seed-${recipe.name.toLowerCase().replace(/\s+/g, "-")}`;
    await prisma.recipe.upsert({
      where: { id: seedId },
      update: {},
      create: {
        id: seedId,
        name: recipe.name,
        description: recipe.description,
        cuisine: recipe.cuisine,
        difficulty: recipe.difficulty,
        prepTime: recipe.prepTime,
        cookingTime: recipe.cookingTime,
        servings: recipe.servings,
        tags: recipe.tags,
        instructions: recipe.instructions,
        createdById: user.id,
        ingredients: {
          create: recipe.ingredients.map((ing) => ({
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit,
          })),
        },
      },
    });
  }

  console.log(`Seeded ${SAMPLE_RECIPES.length} recipes for ${email}`);
  console.log("Login: demo@mealmap.app / Demo1234!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
