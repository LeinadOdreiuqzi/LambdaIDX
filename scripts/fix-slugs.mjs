// Script to fix slugs by removing accents and special characters
import prisma from '../lib/prisma.js';

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters except spaces and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .trim();
}

async function fixSlugs() {
  try {
    console.log('🔍 Fetching all pages...');
    const pages = await prisma.page.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
      },
    });

    console.log(`📊 Found ${pages.length} pages`);

    let fixedCount = 0;
    let skippedCount = 0;

    for (const page of pages) {
      const newSlug = slugify(page.title);
      
      if (newSlug !== page.slug) {
        console.log(`🔄 Fixing: "${page.title}"`);
        console.log(`   Old slug: ${page.slug}`);
        console.log(`   New slug: ${newSlug}`);
        
        await prisma.page.update({
          where: { id: page.id },
          data: { slug: newSlug },
        });
        
        fixedCount++;
      } else {
        skippedCount++;
      }
    }

    console.log(`\n✅ Fixed ${fixedCount} slugs`);
    console.log(`⏭️  Skipped ${skippedCount} slugs (already correct)`);
  } catch (error) {
    console.error('❌ Error fixing slugs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixSlugs();
