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
        weather_main: { type: String },       // e.g., "Rain"
        description: { type: String },        // e.g., "moderate rain"
        humidity: { type: Number },           // % e.g., 60
        temp_max: { type: Number },           // in Kelvin by default
        pressure: { type: Number },           // ground level pressure, hPa
        cloudiness: { type: Number }          // % cloud coverage
    },
}, {timestamps: true});

export default mongoose.model('UserLog', userLogSchema);
