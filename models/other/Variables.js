const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const variablesSchema = new Schema({
    homeAd: Number,
    bannerAd: Number,
    dealOfTheDay: Number,
    shipping: Number
});


const variablesModel = mongoose.model('Variable', variablesSchema);

module.exports = variablesModel;
