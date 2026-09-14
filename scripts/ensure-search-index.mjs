import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Applying PostgreSQL Full-Text Search GIN index...');

  try {
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS page_fts_gin_idx 
      ON "Page" USING GIN (to_tsvector('spanish', coalesce(title, '') || ' ' || coalesce(excerpt, '') || ' ' || coalesce("searchVector", '')));
    `);

    console.log('GIN index [page_fts_gin_idx] ensured successfully!');
  } catch (error) {
    console.warn('Could not create GIN index (PostgreSQL may be using non-standard config):', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
