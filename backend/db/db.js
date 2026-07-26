const mongoos = require('mongoose');
const connectDB = async()=>{
    try {
        const connUri = process.env.MONGO_URI;
        if (!connUri) {
            console.error("CRITICAL ERROR: MONGO_URI environment variable is not defined!");
            process.exit(1);
        }
        await mongoos.connect(connUri)
        console.log("Connected to MongoDB successfully!!!")
    } catch (error) {
        console.log("Not Connected!!", error)
    }
}
module.exports = connectDB