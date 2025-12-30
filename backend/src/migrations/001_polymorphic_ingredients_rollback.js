import mongoose from 'mongoose';
import SemiProcessedRecipe from '../models/SemiProcessedRecipe.js';
import SkuRecipe from '../models/SkuRecipe.js';
import BatchCookingLog from '../models/BatchCookingLog.js';
import TransferLog from '../models/TransferLog.js';
import SkuItem from '../models/SkuItem.js';

/**
 * Rollback Script: Revert Polymorphic Ingredient References
 *
 * This script reverts the polymorphic ingredient migration, converting
 * back to the original fixed-reference structure.
 *
 * ⚠️  WARNING: This will revert to the old schema structure!
 * Use only if the migration needs to be undone.
 *
 * Run with: node backend/src/migrations/001_polymorphic_ingredients_rollback.js [--dry-run]
 */

const DRY_RUN = process.argv.includes('--dry-run');

const stats = {
  semiProcessedRecipes: { total: 0, reverted: 0, errors: 0 },
  skuRecipes: { total: 0, reverted: 0, errors: 0 },
  batchCookingLogs: { total: 0, reverted: 0, errors: 0 },
  transferLogs: { total: 0, reverted: 0, errors: 0 },
  skuItems: { total: 0, reverted: 0, errors: 0 }
};

/**
 * Rollback SemiProcessedRecipe documents
 */
async function rollbackSemiProcessedRecipes() {
  console.log('\n📋 Rolling back SemiProcessedRecipes...');

  const recipes = await SemiProcessedRecipe.find({}).lean();
  stats.semiProcessedRecipes.total = recipes.length;

  for (const recipe of recipes) {
    try {
      // Check if needs rollback (has polymorphic structure)
      if (!recipe.ingredients?.[0]?.ingredientType) {
        console.log(`  ⏭️  Skipping ${recipe.outputName} (already in old format)`);
        continue;
      }

      const updates = {};

      // Only rollback if ALL ingredients are 'raw' type
      const hasNonRaw = recipe.ingredients.some(ing => ing.ingredientType !== 'raw');
      if (hasNonRaw) {
        console.log(`  ⚠️  Skipping ${recipe.outputName} (contains non-raw ingredients - cannot rollback)`);
        stats.semiProcessedRecipes.errors++;
        continue;
      }

      // Convert back to old structure
      updates.ingredients = recipe.ingredients.map(ing => ({
        rawIngredientId: ing.ingredientId,
        rawIngredientName: ing.ingredientName,
        quantity: ing.quantity,
        unit: ing.unit
      }));

      if (!DRY_RUN) {
        await SemiProcessedRecipe.updateOne(
          { _id: recipe._id },
          { $set: updates, $unset: { holdingTimeHours: '', storageTemp: '', level: '' } }
        );
      }

      console.log(`  ✅ Reverted: ${recipe.outputName}`);
      stats.semiProcessedRecipes.reverted++;

    } catch (error) {
      console.error(`  ❌ Error reverting ${recipe.outputName}:`, error.message);
      stats.semiProcessedRecipes.errors++;
    }
  }
}

/**
 * Rollback SkuRecipe documents
 */
async function rollbackSkuRecipes() {
  console.log('\n📋 Rolling back SkuRecipes...');

  const recipes = await SkuRecipe.find({}).lean();
  stats.skuRecipes.total = recipes.length;

  for (const recipe of recipes) {
    try {
      // Check if needs rollback
      if (!recipe.ingredients?.[0]?.ingredientType) {
        console.log(`  ⏭️  Skipping ${recipe.skuName} (already in old format)`);
        continue;
      }

      // Only rollback if ALL ingredients are 'semiProcessed' type
      const hasNonSemi = recipe.ingredients.some(ing => ing.ingredientType !== 'semiProcessed');
      if (hasNonSemi) {
        console.log(`  ⚠️  Skipping ${recipe.skuName} (contains non-semi ingredients - cannot rollback)`);
        stats.skuRecipes.errors++;
        continue;
      }

      const updates = {};

      // Convert back to old structure
      updates.ingredients = recipe.ingredients.map(ing => ({
        semiProcessedId: ing.ingredientId,
        semiProcessedName: ing.ingredientName,
        quantity: ing.quantity,
        unit: ing.unit
      }));

      if (!DRY_RUN) {
        await SkuRecipe.updateOne(
          { _id: recipe._id },
          { $set: updates, $unset: { hasRecipe: '', assemblyInstructions: '' } }
        );
      }

      console.log(`  ✅ Reverted: ${recipe.skuName}`);
      stats.skuRecipes.reverted++;

    } catch (error) {
      console.error(`  ❌ Error reverting ${recipe.skuName}:`, error.message);
      stats.skuRecipes.errors++;
    }
  }
}

/**
 * Rollback BatchCookingLog documents
 */
async function rollbackBatchCookingLogs() {
  console.log('\n📋 Rolling back BatchCookingLogs...');

  const logs = await BatchCookingLog.find({}).lean();
  stats.batchCookingLogs.total = logs.length;

  for (const log of logs) {
    try {
      // Check if needs rollback
      if (log.rawIngredientsUsed) {
        console.log(`  ⏭️  Skipping batch ${log.batchId} (already in old format)`);
        continue;
      }

      // Only rollback if ALL ingredients are 'raw' type
      const hasNonRaw = log.ingredientsUsed?.some(ing => ing.ingredientType !== 'raw');
      if (hasNonRaw) {
        console.log(`  ⚠️  Skipping batch ${log.batchId} (contains non-raw ingredients - cannot rollback)`);
        stats.batchCookingLogs.errors++;
        continue;
      }

      const updates = {};

      // Convert back to old structure
      if (log.ingredientsUsed && log.ingredientsUsed.length > 0) {
        updates.rawIngredientsUsed = log.ingredientsUsed.map(ing => ({
          ingredientId: ing.ingredientId,
          ingredientName: ing.ingredientName,
          quantity: ing.quantity,
          unit: ing.unit
        }));

        updates.$unset = { ingredientsUsed: '' };
      }

      if (!DRY_RUN) {
        await BatchCookingLog.updateOne(
          { _id: log._id },
          updates.$unset ? updates : { $set: updates }
        );
      }

      console.log(`  ✅ Reverted: Batch ${log.batchId}`);
      stats.batchCookingLogs.reverted++;

    } catch (error) {
      console.error(`  ❌ Error reverting batch ${log.batchId}:`, error.message);
      stats.batchCookingLogs.errors++;
    }
  }
}

/**
 * Rollback TransferLog documents
 */
async function rollbackTransferLogs() {
  console.log('\n📋 Rolling back TransferLogs...');

  const logs = await TransferLog.find({}).lean();
  stats.transferLogs.total = logs.length;

  for (const log of logs) {
    try {
      // Check if needs rollback
      if (log.semiProcessedUsed) {
        console.log(`  ⏭️  Skipping transfer ${log._id} (already in old format)`);
        continue;
      }

      // Only rollback if ALL ingredients are 'semiProcessed' type
      const hasNonSemi = log.ingredientsUsed?.some(ing => ing.ingredientType !== 'semiProcessed');
      if (hasNonSemi) {
        console.log(`  ⚠️  Skipping transfer ${log._id} (contains non-semi ingredients - cannot rollback)`);
        stats.transferLogs.errors++;
        continue;
      }

      const updates = {};

      // Convert back to old structure
      if (log.ingredientsUsed && log.ingredientsUsed.length > 0) {
        updates.semiProcessedUsed = log.ingredientsUsed.map(item => ({
          itemId: item.ingredientId,
          itemName: item.ingredientName,
          quantity: item.quantity,
          unit: item.unit
        }));

        updates.$unset = { ingredientsUsed: '' };
      }

      if (!DRY_RUN) {
        await TransferLog.updateOne(
          { _id: log._id },
          updates.$unset ? updates : { $set: updates }
        );
      }

      console.log(`  ✅ Reverted: Transfer ${log._id}`);
      stats.transferLogs.reverted++;

    } catch (error) {
      console.error(`  ❌ Error reverting transfer ${log._id}:`, error.message);
      stats.transferLogs.errors++;
    }
  }
}

/**
 * Rollback SkuItem documents
 */
async function rollbackSkuItems() {
  console.log('\n📋 Rolling back SkuItems...');

  const items = await SkuItem.find({}).lean();
  stats.skuItems.total = items.length;

  for (const item of items) {
    try {
      if (!DRY_RUN) {
        await SkuItem.updateOne(
          { _id: item._id },
          { $unset: { category: '', requiresAssembly: '', assemblyLocation: '' } }
        );
      }

      console.log(`  ✅ Reverted: ${item.name}`);
      stats.skuItems.reverted++;

    } catch (error) {
      console.error(`  ❌ Error reverting ${item.name}:`, error.message);
      stats.skuItems.errors++;
    }
  }
}

/**
 * Print rollback statistics
 */
function printStats() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 ROLLBACK STATISTICS');
  console.log('='.repeat(60));

  Object.entries(stats).forEach(([collection, data]) => {
    console.log(`\n${collection}:`);
    console.log(`  Total: ${data.total}`);
    console.log(`  Reverted: ${data.reverted}`);
    console.log(`  Errors: ${data.errors}`);
    console.log(`  Skipped: ${data.total - data.reverted - data.errors}`);
  });

  const totalReverted = Object.values(stats).reduce((sum, data) => sum + data.reverted, 0);
  const totalErrors = Object.values(stats).reduce((sum, data) => sum + data.errors, 0);

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Total Documents Reverted: ${totalReverted}`);
  console.log(`❌ Total Errors: ${totalErrors}`);
  console.log('='.repeat(60) + '\n');

  if (totalErrors > 0) {
    console.log('⚠️  Some documents could not be rolled back because they use');
    console.log('   the new polymorphic features (mixed ingredient types).');
    console.log('   These documents cannot be automatically reverted.\n');
  }
}

/**
 * Main rollback function
 */
async function runRollback() {
  try {
    console.log('\n🔄 STARTING POLYMORPHIC INGREDIENTS ROLLBACK');
    console.log('='.repeat(60));

    if (DRY_RUN) {
      console.log('⚠️  DRY RUN MODE - No changes will be made to the database');
    } else {
      console.log('⚠️  LIVE MODE - Changes will be written to the database');
      console.log('⚠️  THIS WILL REVERT TO THE OLD SCHEMA STRUCTURE!');
    }

    console.log('='.repeat(60));

    // Connect to database
    const dbUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/qsr_inventory';
    await mongoose.connect(dbUri);
    console.log('✅ Connected to database:', dbUri);

    // Run rollbacks in sequence
    await rollbackSemiProcessedRecipes();
    await rollbackSkuRecipes();
    await rollbackBatchCookingLogs();
    await rollbackTransferLogs();
    await rollbackSkuItems();

    // Print statistics
    printStats();

    if (DRY_RUN) {
      console.log('\n💡 To apply rollback, run without --dry-run flag\n');
    } else {
      console.log('\n✅ Rollback completed!\n');
    }

  } catch (error) {
    console.error('\n❌ ROLLBACK FAILED:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from database\n');
  }
}

// Run rollback if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runRollback();
}

export default runRollback;
