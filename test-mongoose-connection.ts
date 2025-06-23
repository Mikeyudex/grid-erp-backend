import mongoose from 'mongoose';
import 'dotenv/config'; // Cargar variables de entorno desde .env

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';

async function test() {
  try {
    await mongoose.connect(uri);
    console.log('✅ Conexión exitosa a MongoDB');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error conectando a MongoDB:', err, err.message);
    process.exit(1);
  }
}

test();
