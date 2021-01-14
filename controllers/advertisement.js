const MainAd = require('../models/other/MainAd');

exports.createMainAd = (req, res, next) => {
    // Ad Types
    //   0 - Product
    //   1 - Store
    const mainAd = {
        image: req.body.image,
        type: req.body.type,
        destination: req.body.destination
    }
    MainAd.create(mainAd)
    .then(resp => resp.toJSON())
    .then(resp => res.json(resp))
    .catch(err => next(err));
}

exports.getMainAds = (req, res, next) => {
    MainAd
        .find()
        .then(resp => res.json(resp))
        .catch(err => next(err));
}