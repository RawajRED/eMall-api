const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const variantTypeSchema = new Schema({
    title: {
        en: {
            type: String,
            required: true
        },
        ar: {
            type: String,
            required: true
        },
    },
    options: {
        type: [String],
        required: true
    }
});

const variantTypeModel = mongoose.model('VariantType', variantTypeSchema);

module.exports = variantTypeModel;