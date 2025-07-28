// const mongoose = require('mongoose');
import mongoose from "mongoose";

const CompanySchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true 
    },
    address: { 
        type: String 
    },
    created_at: { 
        type: Date, 
        default: Date.now 
    }
});

// Virtual populate
CompanySchema.virtual('machines', {
  ref: 'Machine',
  localField: '_id',
  foreignField: 'company',
});

// Enable virtuals in JSON output
CompanySchema.set('toObject', { virtuals: true });
CompanySchema.set('toJSON', { virtuals: true });

const Company = mongoose.model('Company', CompanySchema);
export default Company;
