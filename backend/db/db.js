const mongoos = require('mongoose');
const connectDB = async()=>{
    try {
        const connUri = process.env.MONGO_URI || 'mongodb+srv://deadlock:asrasr123@cluster0.mnhdnpb.mongodb.net/?retryWrites=true&w=majority';
        await mongoos.connect(connUri)
            console.log("Connected!!!")
    } catch (error) {
        console.log("Not Connected!!", error)
    }
}
module.exports = connectDB