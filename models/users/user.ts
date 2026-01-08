import mongoose, { Schema } from "mongoose";


const userSchema = new Schema({
    name: String,
    avatarUrl: String,
    role: {
        type: String,
        enum: ['ADMIN', 'CUSTOMER'],
        default: 'CUSTOMER'
    },
    credentials: {
       type: mongoose.Types.ObjectId,
       ref:'credential',
       required:true
    }
},{timestamps:true})

const User=mongoose.model("user",userSchema)