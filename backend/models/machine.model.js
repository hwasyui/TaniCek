const mongoose = require('mongoose');

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
    location_lat: { 
        type: Number 
    },
    location_lon: { 
        type: Number 
    },
    created_at: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Machine', MachineSchema);
