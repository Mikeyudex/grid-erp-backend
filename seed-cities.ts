import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load env
dotenv.config({ path: __dirname + '/.env' });

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('No MONGODB_URI found in .env');
  process.exit(1);
}

// City Schema match
const citySchema = new mongoose.Schema({
  name: { type: String, required: true },
  toponymName: { type: String },
  adminName1: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: null }
});

const City = mongoose.model('City', citySchema);

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('Connected.');

    console.log('Loading cities file...');
    // Archivo local de frontend (importarlo como módulo ES es difícil en script TS simple sin transpilar, 
    // así que lo leeremos usando import estático o lo evaluaremos si es CJS, pero as es ESM, haremos trampa leyendo el archivo con fs y regex o mejor copiándolo y cambiándolo a json).
    
    // Como el archivo citys.js original es un export de un array grande, es más fácil hacer import.
    // Pero como puede que estemos en CommonJS, y el archivo sea ES module, mejor extraer el array directamente.
    
    const frontendCitysPath = path.join(__dirname, '../grid-erp-frontend/src/helpers/citys.js');
    let content = fs.readFileSync(frontendCitysPath, 'utf-8');
    
    // Remove "export const citys = " and replace the end to make it pure JSON
    content = content.replace('export const citys = ', '');
    // remove any trailing semicolon or comments at the end
    content = content.trim();
    if (content.endsWith(';')) {
      content = content.slice(0, -1);
    }

    const citysArray = JSON.parse(content);
    console.log(`Found ${citysArray.length} cities.`);

    // Map to new schema
    const citiesToInsert = citysArray.map((c: any) => ({
      name: c.name,
      toponymName: c.toponymName,
      adminName1: c.adminName1,
    }));

    console.log('Clearing existing cities collection...');
    await City.deleteMany({});

    console.log('Inserting new cities...');
    await City.insertMany(citiesToInsert);

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
}

seed();
