import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcryptjs'

const credentialSchema = new Schema(
    {
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
    },
    { timestamps: true }
);

credentialSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 12);
});

const Credentials = mongoose.model("credential", credentialSchema)
export default Credentials;