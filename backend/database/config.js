// connect to mongodb in nodejs
const mongoose = require("mongoose");

const dbConnection = async () => {
  try {
    const url =
      "mongodb+srv://mcoronado:b6NevxMuzfVs2c8A@clustercafe.ty5ca93.mongodb.net/nuevoprueba";
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Conexión exitosa a MongoDB");
  } catch (error) {
    console.error("Error al conectar a MongoDB:", error);
  }

};

module.exports = {
  dbConnection,
};
