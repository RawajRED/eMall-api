const Product = require('../../../models/seller/product/Product');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

exports.createProduct = (req, res, next) => {
    const product = req.body;
    Product.create(product)
    .then(resp => {
        console.log(resp)
        return resp.toJSON()
    })
    .then(prod => res.json(prod))
    .catch(err => next(err));
}

exports.getProductById = (req, res, next) => {
    Product.findOne({_id: req.params.id})
    .populate({
        path: 'store',
        select: 'logo title categories'
    })
    .then(resp => res.json(resp))
    .catch(err => next(err))
}

exports.findProduct = (req, res, next) => {
    Product.find(req.body)
    .then(resp => res.json(resp))
    .catch(err => next(err));
}

exports.deleteProduct = (req, res, next) => {
    Product.remove(req.body)
    .then(resp => res.json(resp))
    .catch(err => next({status: 500, message: 'Internal Server Error'}))
}