const cloudinary = require('cloudinary');
const dotenv = require('dotenv');

dotenv.config({ path: "backend/.env"});

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


const upload_file = (file,folder) => {
    return new Promise((resolve, reject) => {
        cloudinary.v2.uploader
        .upload(
            file,
            { resource_type: "auto", folder }, // Objeto de configuración
            (error, result) => { // Función de devolución de llamada
              if (error) {
                // Manejar el error
                reject(error);
              } else {
                // Procesar el resultado
                resolve({
                  public_id: result.public_id,
                  url: result.url,
                });
              }
            }
           
        )
    });
}


const deleteFile = async (file) => {
    const res = await cloudinary.v2.uploader.destroy(file);
    if(res?.result ==="ok") return true;
}


module.exports = {
    upload_file,
    deleteFile
};