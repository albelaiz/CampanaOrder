import "dotenv/config";
import { db } from "./server/db";
import { menuCategories } from "./shared/schema";

const initialCategories = [
  { name: "Appetizers", displayOrder: 1 },
  { name: "Main Courses", displayOrder: 2 },
  { name: "Seafood", displayOrder: 3 },
  { name: "Pasta", displayOrder: 4 },
  { name: "Desserts", displayOrder: 5 },
  { name: "Beverages", displayOrder: 6 },
];

async function seedCategories() {
  try {
    console.log("Seeding categories...");
    
    for (const category of initialCategories) {
      await db.insert(menuCategories).values(category).onConflictDoNothing();
      console.log(`Added category: ${category.name}`);
    }
    
    console.log("Categories seeded successfully!");
    
    // Show all categories
    const allCategories = await db.select().from(menuCategories);
    console.log("Current categories in database:", allCategories);
    
    process.exit(0);
  } catch (error) {
    console.error("Error seeding categories:", error);
    process.exit(1);
  }
}

seedCategories();
