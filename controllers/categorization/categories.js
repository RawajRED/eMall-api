const Category = require('../../models/categorization/Category');

exports.getCategories = (req, res, next) => {
    Category.find({})
    .then(resp => res.json(resp))
    .catch(err => next(err))
}

exports.getCategory = (req, res, next) => {
    Category.findOne({_id: req.params.id})
    .then(resp => res.json(resp))
    .catch(err => next(err))
}

exports.createCategory = (req, res, next) => {
    Category.create(req.body)
    .then(resp => resp.toJSON())
    .then(resp => res.json(resp))
    .catch(err => next(err))
}

exports.deleteCategory = (req, res, next) => {
    Category.deleteOne(req.body)
    .then(resp => res.json(resp))
    .catch(err => next(err));
}