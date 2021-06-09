const Subcategory = require('../../models/categorization/SubCategory');
const Filter = require('../../models/categorization/Filter');

exports.getSubcategories = (req, res, next) => {
    Subcategory.find({})
    .then(resp => res.json(resp))
    .catch(err => next(err))
}

exports.getSubcategory = (req, res, next) => {
    Subcategory.findOne({_id: req.params.id})
    .then(resp => res.json(resp))
    .catch(err => next(err))
}

exports.getSubcategoriesByCategory = (req, res, next) => {
    Subcategory.find({category: req.params._id})
    .then(resp => res.json(resp))
    .catch(err => next(err))
}

exports.createSubcategory = (req, res, next) => {
    Subcategory.create(req.body)
    .then(resp => resp.toJSON())
    .then(resp => res.json(resp))
    .catch(err => next(err))
}

exports.editSubcategory = (req, res, next) => {
    Subcategory.findOneAndUpdate({_id: req.body._id}, req.body.data, {new: true})
    .then(resp => resp ? res.json(resp) : next({status: 404, message: 'Subcategory problem'}))
    .catch(err => next(err))
}

exports.deleteSubcategory = (req, res, next) => {
    Subcategory.deleteOne(req.body)
    .then(resp => resp.deletedCount > 0 ?  res.json(resp) : next({status: 404, message: `Invalid Subcategory ID`}))
    .catch(err => next(err));
}

exports.getAllFilters = (req, res, next) => {
    Filter.find()
    .then(filters => res.json(filters))
    .catch(err => next(err))
}

exports.getFilters = (req, res, next) => {
    Filter.find({subcategory: req.params.subcategory})
    .then(filters => res.json(filters))
    .catch(err => next(err))
}

exports.createFilter = (req, res, next) => {
    Filter.create(req.body)
    .then(resp => resp.toJSON())
    .then(filter => res.json(filter))
    .catch(err => next(err));
}