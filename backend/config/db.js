import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('ℹ️  No MONGODB_URI provided in .env. Running in DEMO / in-memory mode.');
    return;
  }

  const isAtlas = uri.startsWith('mongodb+srv://');
  console.log(`🔌 Attempting MongoDB connection (${isAtlas ? 'MongoDB Atlas Cloud' : 'Local MongoDB'})...`);

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      autoIndex: true,
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host} (${conn.connection.name})`);
  } catch (error) {
    console.warn(`⚠️ MongoDB Connection Failed (${error.message}). Continuing with DEMO / in-memory fallback.`);
    isConnected = false;
  }
}

export function getIsConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}
