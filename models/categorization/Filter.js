const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const filterSchema = new Schema({
    name: {
        en: {
            type: String,
            required: true
        },
        ar: {
            type: String,
            required: true
        }
    },
    icon: {
        type: String,
        required: true
    },
    iconType: String,
    image: String,
    subcategory: {
        type: Schema.Types.ObjectId,
        ref: 'Subcategory'
    }
});

const filterModel = mongoose.model('Filter', filterSchema);

module.exports = filterModel;