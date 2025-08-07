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
    image: {
        type: Buffer, 
    }
}, {timestamps: true});

CompanySchema.virtual('machines', {
    ref: 'Machine',
    localField: '_id',
    foreignField: 'company',
});

CompanySchema.set('toObject', { virtuals: true });
CompanySchema.set('toJSON', { virtuals: true });

const Company = mongoose.model('Company', CompanySchema);
export default Company;
