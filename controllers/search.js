const Product = require('../models/seller/product/Product');
const Store = require('../models/seller/Store');
const Category = require('../models/categorization/Category');
const Subcategory = require('../models/categorization/SubCategory');

exports.searchInput = (req, res, next) => {
    const criteria = req.body.criteria;
    const promises = [];
    promises.push(Store.find({title: {$regex: criteria, $options: "i"}}).limit(10).select('title logo').lean().exec())
    promises.push(Product.find({isDeleted : false, isStoreDeleted: false, $or: [
        {
            "title.en": {$regex: criteria, $options: "i"}
        },
        {
            "title.ar": {$regex: criteria, $options: "i"}
        }
    ]}).limit(10).select('title images').lean().exec());
    promises.push(Category.find({$or: [
        {
            "name.en": {$regex: criteria, $options: "i"}
        },
        {
            "name.ar": {$regex: criteria, $options: "i"}
        }
    ]}).limit(10).select('name image').lean().exec())
    promises.push(Subcategory.find({$or: [
        {
            "name.en": {$regex: criteria, $options: "i"}
        },
        {
            "name.ar": {$regex: criteria, $options: "i"}
        }
    ]}).limit(10).select('name image').lean().exec())
    Promise.all(promises)
    .then(resp => {
        res.json(resp);
    })
    .catch(err => next(err))
}