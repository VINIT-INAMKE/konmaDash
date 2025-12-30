import mongoose from 'mongoose';
import SemiProcessedRecipe from '../models/SemiProcessedRecipe.js';
import SkuRecipe from '../models/SkuRecipe.js';
import BatchCookingLog from '../models/BatchCookingLog.js';
import TransferLog from '../models/TransferLog.js';
import SkuItem from '../models/SkuItem.js';
import SemiProcessedItem from '../models/SemiProcessedItem.js';

/**
 * Migration Script: Convert to Polymorphic Ingredient References
 *
 * This migration updates all recipes and logs to use the new polymorphic
 * ingredient reference system, allowing recipes to use raw ingredients,
 * semi-processed items, and purchased goods.
 *
 * Run with: node backend/src/migrations/001_polymorphic_ingredients.js [--dry-run]
 */

const DRY_RUN = process.argv.includes('--dry-run');

// Track migration statistics
const stats = {
  semiProcessedRecipes: { total: 0, updated: 0, errors: 0 },
  skuRecipes: { total: 0, updated: 0, errors: 0 },
  batchCookingLogs: { total: 0, updated: 0, errors: 0 },
  transferLogs: { total: 0, updated: 0, errors: 0 },
  skuItems: { total: 0, updated: 0, errors: 0 },
  semiProcessedItems: { total: 0, updated: 0, errors: 0 }
};

/**
 * Migrate SemiProcessedRecipe documents
 * Convert rawIngredientId → polymorphic structure
 * Add default values for holdingTimeHours and storageTemp
 */
async function migrateSemiProcessedRecipes() {
  console.log('\n📋 Migrating SemiProcessedRecipes...');

  const recipes = await SemiProcessedRecipe.find({}).lean();
  stats.semiProcessedRecipes.total = recipes.length;

  for (const recipe of recipes) {
    try {
      // Check if already migrated
      if (recipe.ingredients?.[0]?.ingredientType) {
        console.log(`  ⏭️  Skipping ${recipe.outputName} (already migrated)`);
        continue;
      }

      const updates = {};

      // Convert ingredients to polymorphic structure
      if (recipe.ingredients && recipe.ingredients.length > 0) {
        updates.ingredients = recipe.ingredients.map(ing => ({
          ingredientType: 'raw',
          ingredientId: ing.rawIngredientId,
          ingredientRef: 'RawIngredient',
          ingredientName: ing.rawIngredientName,
          quantity: ing.quantity,
          unit: ing.unit
        }));
      }

      // Add default values for new fields
      if (!recipe.holdingTimeHours) {
        updates.holdingTimeHours = 24; // Default 24 hours
      }

      if (!recipe.storageTemp) {
        updates.storageTemp = 'chiller_2_4'; // Default chiller storage
      }

      if (!recipe.level) {
        updates.level = 1; // Default level 1 (made from raw ingredients)
      }

      if (!DRY_RUN) {
        await SemiProcessedRecipe.updateOne(
          { _id: recipe._id },
          { $set: updates }
        );
      }

      console.log(`  ✅ Updated: ${recipe.outputName}`);
      stats.semiProcessedRecipes.updated++;

    } catch (error) {
      console.error(`  ❌ Error updating ${recipe.outputName}:`, error.message);
      stats.semiProcessedRecipes.errors++;
    }
  }
}

/**
 * Migrate SkuRecipe documents
 * Convert semiProcessedId → polymorphic structure
 * Add hasRecipe: true (all existing recipes have recipes)
 */
async function migrateSkuRecipes() {
  console.log('\n📋 Migrating SkuRecipes...');

  const recipes = await SkuRecipe.find({}).lean();
  stats.skuRecipes.total = recipes.length;

  for (const recipe of recipes) {
    try {
      // Check if already migrated
      if (recipe.ingredients?.[0]?.ingredientType) {
        console.log(`  ⏭️  Skipping ${recipe.skuName} (already migrated)`);
        continue;
      }

      const updates = {};

      // Convert ingredients to polymorphic structure
      if (recipe.ingredients && recipe.ingredients.length > 0) {
        updates.ingredients = recipe.ingredients.map(ing => ({
          ingredientType: 'semiProcessed',
          ingredientId: ing.semiProcessedId,
          ingredientRef: 'SemiProcessedItem',
          ingredientName: ing.semiProcessedName,
          quantity: ing.quantity,
          unit: ing.unit
        }));
      }

      // Add hasRecipe flag (all existing recipes have recipes)
      if (recipe.hasRecipe === undefined) {
        updates.hasRecipe = true;
      }

      // Add default assemblyInstructions
      if (!recipe.assemblyInstructions) {
        updates.assemblyInstructions = '';
      }

      if (!DRY_RUN) {
        await SkuRecipe.updateOne(
          { _id: recipe._id },
          { $set: updates }
        );
      }

      console.log(`  ✅ Updated: ${recipe.skuName}`);
      stats.skuRecipes.updated++;

    } catch (error) {
      console.error(`  ❌ Error updating ${recipe.skuName}:`, error.message);
      stats.skuRecipes.errors++;
    }
  }
}

/**
 * Migrate BatchCookingLog documents
 * Rename rawIngredientsUsed → ingredientsUsed
 * Add polymorphic fields
 */
async function migrateBatchCookingLogs() {
  console.log('\n📋 Migrating BatchCookingLogs...');

  const logs = await BatchCookingLog.find({}).lean();
  stats.batchCookingLogs.total = logs.length;

  for (const log of logs) {
    try {
      // Check if already migrated
      if (log.ingredientsUsed && !log.rawIngredientsUsed) {
        console.log(`  ⏭️  Skipping batch ${log.batchId} (already migrated)`);
        continue;
      }

      const updates = {};

      // Convert rawIngredientsUsed to polymorphic ingredientsUsed
      if (log.rawIngredientsUsed && log.rawIngredientsUsed.length > 0) {
        updates.ingredientsUsed = log.rawIngredientsUsed.map(ing => ({
          ingredientType: 'raw',
          ingredientId: ing.ingredientId,
          ingredientRef: 'RawIngredient',
          ingredientName: ing.ingredientName,
          quantity: ing.quantity,
          unit: ing.unit
        }));

        // Remove old field
        updates.$unset = { rawIngredientsUsed: '' };
      }

      if (!DRY_RUN) {
        await BatchCookingLog.updateOne(
          { _id: log._id },
          updates.$unset ? updates : { $set: updates }
        );
      }

      console.log(`  ✅ Updated: Batch ${log.batchId}`);
      stats.batchCookingLogs.updated++;

    } catch (error) {
      console.error(`  ❌ Error updating batch ${log.batchId}:`, error.message);
      stats.batchCookingLogs.errors++;
    }
  }
}

/**
 * Migrate TransferLog documents
 * Rename semiProcessedUsed → ingredientsUsed
 * Add polymorphic fields
 */
async function migrateTransferLogs() {
  console.log('\n📋 Migrating TransferLogs...');

  const logs = await TransferLog.find({}).lean();
  stats.transferLogs.total = logs.length;

  for (const log of logs) {
    try {
      // Check if already migrated
      if (log.ingredientsUsed && !log.semiProcessedUsed) {
        console.log(`  ⏭️  Skipping transfer ${log._id} (already migrated)`);
        continue;
      }

      const updates = {};

      // Convert semiProcessedUsed to polymorphic ingredientsUsed
      if (log.semiProcessedUsed && log.semiProcessedUsed.length > 0) {
        updates.ingredientsUsed = log.semiProcessedUsed.map(item => ({
          ingredientType: 'semiProcessed',
          ingredientId: item.itemId,
          ingredientRef: 'SemiProcessedItem',
          ingredientName: item.itemName,
          quantity: item.quantity,
          unit: item.unit
        }));

        // Remove old field
        updates.$unset = { semiProcessedUsed: '' };
      }

      if (!DRY_RUN) {
        await TransferLog.updateOne(
          { _id: log._id },
          updates.$unset ? updates : { $set: updates }
        );
      }

      console.log(`  ✅ Updated: Transfer ${log._id}`);
      stats.transferLogs.updated++;

    } catch (error) {
      console.error(`  ❌ Error updating transfer ${log._id}:`, error.message);
      stats.transferLogs.errors++;
    }
  }
}

/**
 * Migrate SkuItem documents
 * Add default values for new fields
 */
async function migrateSkuItems() {
  console.log('\n📋 Migrating SkuItems...');

  const items = await SkuItem.find({}).lean();
  stats.skuItems.total = items.length;

  for (const item of items) {
    try {
      // Check if already migrated
      if (item.category && item.requiresAssembly !== undefined && item.assemblyLocation) {
        console.log(`  ⏭️  Skipping ${item.name} (already migrated)`);
        continue;
      }

      const updates = {};

      // Add default values for new fields
      if (!item.category) {
        updates.category = 'other';
      }

      if (item.requiresAssembly === undefined) {
        updates.requiresAssembly = true;
      }

      if (!item.assemblyLocation) {
        updates.assemblyLocation = 'kitchen';
      }

      if (!DRY_RUN) {
        await SkuItem.updateOne(
          { _id: item._id },
          { $set: updates }
        );
      }

      console.log(`  ✅ Updated: ${item.name}`);
      stats.skuItems.updated++;

    } catch (error) {
      console.error(`  ❌ Error updating ${item.name}:`, error.message);
      stats.skuItems.errors++;
    }
  }
}

/**
 * Migrate SemiProcessedItem batches
 * Add expiresAt field to existing batches (calculate from createdAt + 24h default)
 */
async function migrateSemiProcessedItems() {
  console.log('\n📋 Migrating SemiProcessedItem batches...');

  const items = await SemiProcessedItem.find({}).lean();
  stats.semiProcessedItems.total = items.length;

  for (const item of items) {
    try {
      // Check if batches need migration
      const needsMigration = item.batches?.some(batch => !batch.expiresAt);

      if (!needsMigration) {
        console.log(`  ⏭️  Skipping ${item.name} (already migrated)`);
        continue;
      }

      // Update batches to add expiresAt
      const updatedBatches = item.batches.map(batch => {
        if (batch.expiresAt) {
          return batch;
        }

        // Calculate expiry (createdAt + 24 hours as default)
        const createdAt = batch.createdAt || new Date();
        const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);

        return {
          ...batch,
          expiresAt
        };
      });

      if (!DRY_RUN) {
        await SemiProcessedItem.updateOne(
          { _id: item._id },
          { $set: { batches: updatedBatches } }
        );
      }

      console.log(`  ✅ Updated: ${item.name} (${item.batches?.length || 0} batches)`);
      stats.semiProcessedItems.updated++;

    } catch (error) {
      console.error(`  ❌ Error updating ${item.name}:`, error.message);
      stats.semiProcessedItems.errors++;
    }
  }
}

/**
 * Print migration statistics
 */
function printStats() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 MIGRATION STATISTICS');
  console.log('='.repeat(60));

  Object.entries(stats).forEach(([collection, data]) => {
    console.log(`\n${collection}:`);
    console.log(`  Total: ${data.total}`);
    console.log(`  Updated: ${data.updated}`);
    console.log(`  Errors: ${data.errors}`);
    console.log(`  Skipped: ${data.total - data.updated - data.errors}`);
  });

  const totalUpdated = Object.values(stats).reduce((sum, data) => sum + data.updated, 0);
  const totalErrors = Object.values(stats).reduce((sum, data) => sum + data.errors, 0);

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Total Documents Updated: ${totalUpdated}`);
  console.log(`❌ Total Errors: ${totalErrors}`);
  console.log('='.repeat(60) + '\n');
}

/**
 * Main migration function
 */
async function runMigration() {
  try {
    console.log('\n🚀 STARTING POLYMORPHIC INGREDIENTS MIGRATION');
    console.log('='.repeat(60));

    if (DRY_RUN) {
      console.log('⚠️  DRY RUN MODE - No changes will be made to the database');
    } else {
      console.log('⚠️  LIVE MODE - Changes will be written to the database');
    }

    console.log('='.repeat(60));

    // Connect to database
    const dbUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/qsr_inventory';
    await mongoose.connect(dbUri);
    console.log('✅ Connected to database:', dbUri);

    // Run migrations in sequence
    await migrateSemiProcessedRecipes();
    await migrateSkuRecipes();
    await migrateBatchCookingLogs();
    await migrateTransferLogs();
    await migrateSkuItems();
    await migrateSemiProcessedItems();

    // Print statistics
    printStats();

    if (DRY_RUN) {
      console.log('\n💡 To apply these changes, run without --dry-run flag\n');
    } else {
      console.log('\n✅ Migration completed successfully!\n');
    }

  } catch (error) {
    console.error('\n❌ MIGRATION FAILED:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from database\n');
  }
}

// Run migration if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration();
}

export default runMigration;
