import mongoose from "mongoose";
import bcrypt from 'bcrypt';
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
    password: {
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
    company_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    socialId: {
        type: String,
        default: null
    },
    image: {
        type: Buffer, 
    }, 
},{timestamps: true} );

UserSchema.pre("save", async function() {
    if ((this.password && this.isNew) || this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
});

const User = mongoose.model('User', UserSchema);
export default User;
