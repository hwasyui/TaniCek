const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    isAdmin:{
        default: false,
        type: Boolean
    },
    isDeveloper: { 
        default: false,
        type: Boolean
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    company_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
});

module.exports = mongoose.model('User', UserSchema);
