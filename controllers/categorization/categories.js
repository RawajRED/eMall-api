const Category = require('../../models/categorization/Category');


exports.createCategory = (req, res, next) => {
    Category.create(req.body)
    .then(resp => resp.toJSON())
    .then(resp => res.json(resp))
    .catch(err => next(err))
}

exports.findCategory = (req, res, next) => {
    const criteria = req.body.criteria;
    Category.find({$or: [
        {
            "name.en": {$regex: criteria, $options: "i"}
        },
        {
            "name.ar": {$regex: criteria, $options: "i"}
        }
    ]})
    .limit(20)
    .skip(req.body.skip)
    .then(resp => res.json(resp))
    .catch(err => next(err));
}

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

exports.editCategory = (req, res, next) => {
    Category.findOneAndUpdate({_id: req.body._id}, req.body.data, {new: true})
    .then(resp => resp ? res.json(resp) : next({status: 404, message: 'Category'}))
    .catch(err => next(err))
}

exports.deleteCategory = (req, res, next) => {
    Category.deleteOne(req.body)
    .then(resp => resp.deletedCount > 0 ?  res.json(resp) : next({status: 404, message: `Invalid Category ID`}))
    .catch(err => next(err));
}