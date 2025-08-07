import mongoose from 'mongoose';

const userLogSchema = new mongoose.Schema({
    machine: { type: mongoose.Schema.Types.ObjectId, 
        ref: 'Machine', 
        required: true },
    user: { type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true },
    note: { type: String },
    weather: {
        weather_main: { type: String },       
        description: { type: String },       
        humidity: { type: Number },           
        temp_max: { type: Number },          
        pressure: { type: Number },           
        cloudiness: { type: Number }          
    },
    location_lat: { 
        type: Number,
        required: true
    },
    location_lon: { 
        type: Number,
        required: true
    },
}, {timestamps: true});

export default mongoose.model('UserLog', userLogSchema);
