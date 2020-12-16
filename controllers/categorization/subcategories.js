const Subcategory = require('../../models/categorization/SubCategory');

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

exports.createSubcategory = (req, res, next) => {
    Subcategory.create(req.body)
    .then(resp => resp.toJSON())
    .then(resp => res.json(resp))
    .catch(err => next(err))
}

exports.deleteSubcategory = (req, res, next) => {
    Subcategory.deleteOne(req.body)
    .then(resp => res.json(resp))
    .catch(err => next(err));
}