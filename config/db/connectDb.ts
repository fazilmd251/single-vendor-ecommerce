import mongoose from 'mongoose'

export default async function connectDb(){
    try {
        await mongoose.connect(process.env.DB_URI||"")
        console.log("Databse connected Succesfully")
    } catch (error) {
        console.log("databse connction failed")
        console.log(error)
    }
}