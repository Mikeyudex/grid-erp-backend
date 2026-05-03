const mongoose = require('mongoose');
const { ProductCategorySchema } = require('./dist/apps/core/products/category/category.schema.js');
console.log(mongoose.model('ProductCategory', ProductCategorySchema).collection.name);
