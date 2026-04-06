import { MongoClient, Db } from "mongodb";
import { MONGODB_URI } from "./config";

let db: Db;

export async function connectDatabase(): Promise<void> {
    if (!MONGODB_URI) throw new Error("MONGODB_URI is not set");
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db();
    await db.collection("user_prompts").createIndex({ userId: 1 }, { unique: true });
    console.log("MongoDB connected");
}

export function getDb(): Db {
    if (!db) throw new Error("Database not connected");
    return db;
}
