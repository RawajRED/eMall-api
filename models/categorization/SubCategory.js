const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subcategorySchema = new Schema({
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
    },
    iconType: String,
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
    }
});

const subcategoryModel = mongoose.model('Subcategory', subcategorySchema);

module.exports = subcategoryModel;