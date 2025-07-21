import { CounterModel } from '../schemas/counter.schema';

export async function getNextSequence(sequenceName: string): Promise<number> {
    const updated = await CounterModel.findByIdAndUpdate(
        sequenceName,
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    return updated.seq;
}