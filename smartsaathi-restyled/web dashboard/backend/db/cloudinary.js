const cloudinary = require('cloudinary').v2;

const cloudinaryConnect = async() => {
    try{
    cloudinary.config({ 
        cloud_name: process.env.CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    console.log('Server connected to cloudinary')
    } catch(error){
        console.log(error)
        console.log('Failed to connect to cloudinary')
    }
}

module.exports = cloudinaryConnect;