const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
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
    description: {
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
    }
});

const categoryModel = mongoose.model('Category', categorySchema);

module.exports = categoryModel;