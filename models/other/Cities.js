const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const citiesSchema = new Schema({
    title: {
        en: String,
        ar: String
    },
    price: {
        type: Number,
        default: 0
    }
});


const citiesModel = mongoose.model('City', citiesSchema);

module.exports = citiesModel;
