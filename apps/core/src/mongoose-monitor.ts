import mongoose from 'mongoose';

mongoose.connection.on('error', (err) => {
  console.error('❌ Error en la conexión a MongoDB:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ Se perdió la conexión con MongoDB.');
});

mongoose.connection.on('connected', () => {
  console.log('✅ Conectado a MongoDB correctamente.');
});