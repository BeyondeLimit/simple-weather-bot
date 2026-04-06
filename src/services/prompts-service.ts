import { Collection } from "mongodb";
import { getDb } from "../utils/db";
import { UserPrompts } from "../models/user-prompts.model";

export class PromptsService {
    private get collection(): Collection<UserPrompts> {
        return getDb().collection<UserPrompts>("user_prompts");
    }

    public savePrompt = async (userId: string, etfName: string): Promise<boolean> => {
        const name = etfName.trim().toUpperCase();
        const result = await this.collection.updateOne(
            { userId },
            { $addToSet: { prompts: name } },
            { upsert: true },
        );
        return result.modifiedCount > 0 || result.upsertedCount > 0;
    };

    public listPrompts = async (userId: string): Promise<string[]> => {
        const doc = await this.collection.findOne({ userId });
        return doc?.prompts ?? [];
    };

    public deletePrompt = async (userId: string, etfName: string): Promise<boolean> => {
        const result = await this.collection.updateOne(
            { userId },
            { $pull: { prompts: etfName } },
        );
        return result.modifiedCount > 0;
    };
}
