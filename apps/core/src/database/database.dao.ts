import { Model, FilterQuery, UpdateQuery, QueryOptions, SaveOptions } from 'mongoose';

export abstract class DAO<T> {
  constructor(protected readonly model: Model<T>) { }

  async create(doc: Partial<T>, options?: SaveOptions) {
    const createdDoc = new this.model(doc);
    return createdDoc.save(options);
  }

  async find(filter: FilterQuery<T> = {}, options?: QueryOptions) {
    return this.model.find(filter, null, options).lean();
  }

  async findOne(filter: FilterQuery<T>, options?: QueryOptions) {
    return this.model.findOne(filter, null, options).lean();
  }

  async updateOne(filter: FilterQuery<T>, update: UpdateQuery<T>, options?: QueryOptions) {
    return this.model.findOneAndUpdate(filter, update, { new: true, ...options });
  }

  async deleteOne(filter: FilterQuery<T>, options?: QueryOptions) {
    return this.model.findOneAndDelete(filter, options);
  }

  async deleteMany(filter: FilterQuery<T>) {
    return this.model.deleteMany(filter);
  }

  async findById(id: string, options?: QueryOptions) {
    return this.model.findById(id, options).lean();
  }

  async findByIdAndUpdate(id: string, update: UpdateQuery<T>, options?: QueryOptions) {
    return this.model.findByIdAndUpdate(id, update, { new: true, ...options });
  }

  async findByIdAndDelete(id: string, options?: QueryOptions) {
    return this.model.findByIdAndDelete(id, options);
  }

  async findPaginated(page: number, limit: number, options?: QueryOptions) {
    return this.model.find(options)
      .populate('typeCustomerId')
      .lean()
      .skip(page * limit)
      .limit(limit)
  }

  async findPaginatedByFields(page: number, limit: number, fields?: string[], options?: QueryOptions) {
    return this.model.find(options)
      .lean()
      .skip(page * limit)
      .limit(limit)
      .select(fields.join(' '));
  }
}