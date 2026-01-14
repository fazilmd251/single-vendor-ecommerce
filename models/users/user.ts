import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcryptjs';


const userSchema = new Schema({
    name: String,
    avatarUrl: String,
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 25,
        select: false,
    },
    phone: {
        type: String,
    },
    role: {
        type: String,
        enum: ['ADMIN', 'CUSTOMER'],
        default: 'CUSTOMER'
    }
}, { timestamps: true })

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 12);
});

const User = mongoose.model("user", userSchema)

export default User;