const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const governatesSchema = new Schema({
    title: {
        en: String,
        ar: String
    },
    price: {
        type: Number,
        default: 0
    }
});


const governatesModel = mongoose.model('Governate', governatesSchema);

module.exports = governatesModel;
