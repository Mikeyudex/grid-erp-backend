import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

// Load env
dotenv.config({ path: __dirname + '/.env' });

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('No MONGODB_URI found in .env');
  process.exit(1);
}

// City schema (minimal, only the fields we need)
const citySchema = new mongoose.Schema({
  name: { type: String },
  toponymName: { type: String },
  adminName1: { type: String },
  createdAt: { type: Date },
  updatedAt: { type: Date },
});

const City = mongoose.model('City', citySchema);

async function migrate() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('Connected.');

    // 1. Count affected documents before the update
    const affectedCount = await City.countDocuments({
      adminName1: { $regex: /Department/i },
    });
    console.log(`Found ${affectedCount} documents with "Department" in adminName1.`);

    if (affectedCount === 0) {
      console.log('Nothing to update. Exiting.');
      return;
    }

    // 2. Update all matching documents:
    //    Replace the word "Department" (and any surrounding whitespace) with ""
    //    and trim the result so we don't leave trailing/leading spaces.
    //
    //    MongoDB's $set + aggregation pipeline lets us do string ops server-side.
    const result = await City.updateMany(
      { adminName1: { $regex: /Department/i } },
      [
        {
          $set: {
            adminName1: {
              $trim: {
                input: {
                  $replaceAll: {
                    input: '$adminName1',
                    find: ' Department',
                    replacement: '',
                  },
                },
              },
            },
            updatedAt: new Date(),
          },
        },
      ],
    );

    console.log(`Migration completed. Modified ${result.modifiedCount} document(s).`);

    // 3. Quick sanity check — show remaining documents that still have "Department"
    const remaining = await City.countDocuments({
      adminName1: { $regex: /Department/i },
    });

    if (remaining > 0) {
      console.warn(
        `⚠️  ${remaining} document(s) still contain "Department". ` +
        'They may have a different casing or spacing pattern. Check and re-run if needed.',
      );
    } else {
      console.log('✅  All documents cleaned successfully.');
    }
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
}

migrate();
