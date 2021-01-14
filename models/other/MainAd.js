const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mainAdSchema = new Schema({
    image: String,
    type: Number,
    destination: Schema.Types.ObjectId
});


const mainAdModel = mongoose.model('MainAd', mainAdSchema);

module.exports = mainAdModel;
