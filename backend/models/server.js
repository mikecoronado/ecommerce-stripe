const express = require("express");
var bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const { model } = require("mongoose");
const { dbConnection } = require("../database/config");
const { errorHandler } = require("../middlewares/errors");
dbConnection;

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT;
    this.nodeenv = process.env.NODE_ENV;
    this.products = "/api/producto";
    this.users = "/api/user";
    this.orders = "/api/orders";
    this.payment = "/api/payment";

    this.conectarDB();

    this.middlewares();
    //rutas aplicacion
    this.routes();
  }
  async conectarDB() {
    await dbConnection();
  }

  middlewares() {
    //cors
    this.app.use(cors());
    // this.app.use(cors());
    //lectura parse de body
    this.app.use(express.json({
       limit: "10mb",
       verify: (req,res,buf) => {
        req.rawBody = buf.toString();
      },
      }));
    // this.app.use(notFound);
    this.app.use(errorHandler);

    this.app.use(express.urlencoded({ extended: true }));
    //BODYPARSER, LEERFORM
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(cookieParser());

    process.on("uncaughtException", (err, req, res, next) => {
      console.log(err);
      process.exit(1);
    });

    this.app.use(function (err, req, res, next) {
      console.error(err.message); // Log error message in our server's console
      if (!err.statusCode) err.statusCode = 500; // If err has no specified error code, set error code to 'Internal Server Error (500)'
      res.status(err.statusCode).send({ error: err.message });
    });
  }

  routes() {
    this.app.use(this.products, require("../routes/products"));
    this.app.use(this.users, require("../routes/user"));
    this.app.use(this.orders, require("../routes/order"));
    this.app.use(this.payment, require("../routes/payment"));
  }
  listen() {
    this.app.listen(this.port, () => {
      console.log("servidor ccorriendo en el puerto", this.port, this.nodeenv);
    });
  }
}

module.exports = Server;
