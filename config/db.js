const mongoose=require('mongoose')

const connectDB=async ()=>{
    try
    {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log('connected with database')
    }
    catch(err)
    {
        console.log(' DB connection fail')
        console.log(err)
    }
}

module.exports=connectDB