const { dbConnection } = require("../database/config");
const Product = require("../models/product");
const products = require("./data");


dbConnection();




const seedProducts = async () => {
    try {
        await Product.deleteMany({});
        await Product.insertMany(products);
        console.log('Data Imported');

        process.exit();
        
    } catch (error) {
        console.log(error);
        process.exit();
    }

};

seedProducts();