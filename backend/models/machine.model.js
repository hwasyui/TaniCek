// const mongoose = require('mongoose');
import mongoose from "mongoose";

const MachineSchema = new mongoose.Schema({
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    name: { 
        type: String, 
        required: true 
    },
    type: { 
        type: String 
    },
    company: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Company' 
    },
    location_lat: { 
        type: Number,
        required: true
    },
    location_lon: { 
        type: Number,
        required: true
    },
    userLogs: [
        { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'UserLog' 
        }
    ]
}, {
    timestamps: true
});

const Machine = mongoose.model('Machine', MachineSchema);
export default Machine;
