import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'cine-db';

let client = null;

export async function connectToMongo() {
  if (client) {
    return client;
  }

  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    await client.db(DB_NAME).command({ ping: 1 });
    console.log(`Cliente de MongoDB conectado a la base ${DB_NAME}`);
    return client;
  } catch (error) {
    client = null;
    console.error('Error al inicializar el cliente de MongoDB:', error.message);
    throw error;
  }
}

export function getDb() {
  if (!client) {
    throw new Error(
      'El cliente de MongoDB no está inicializado. Ejecuta connectToMongo() antes de utilizar getDb().'
    );
  }

  return client.db(DB_NAME);
}
