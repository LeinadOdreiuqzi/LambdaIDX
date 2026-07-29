import { seedHierarchicalContent } from "./seed-content.js";

async function main() {
  console.log("Starting database seeding...");
  try {
    await seedHierarchicalContent();
    console.log("Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Database seeding failed:", error);
    process.exit(1);
  }
}

main();
