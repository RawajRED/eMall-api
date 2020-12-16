const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    mainAdmin :{
        type : Boolean,
        required :true,
        default :false
    }
    password: {
        type: String,
        required: true
    },
    suspendedStores: {
        type: [Schema.Types.ObjectId],
        ref: 'Store'
    },
    suspendedClients: {
        type: Schema.Types.ObjectId,
        ref: 'Client'
    }
});

const adminModel = mongoose.model('Admin', adminSchema);

module.exports = adminModel;