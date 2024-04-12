const { response, request } = require("express");
const Product = require("../models/product");
const Order = require("../models/order");

const { asyncHandler } = require("../middlewares/asyncHandler");
const APIFilters = require("../utils/apiFilters");
const ErrorHandler= require("../utils/errorHandler");
// const sendErrorResponse = require("../utils/errorHandler");






const getProducts = asyncHandler(async (req, res, next) => {
  const resPerPage = 4;
  const apiFilters = new APIFilters(Product, req.query).search().filters();


  let products = await apiFilters.query;
  let filteredProductsCount = products.length;

  
  apiFilters.pagination(resPerPage);
  products = await apiFilters.query.clone();

  res.status(200).json({
    resPerPage,
    filteredProductsCount,
    products,
  });
});

const newProduct = asyncHandler(async (req, res, next) => {
  console.log(req.body);
  req.body.user = req.user._id;
  const product = await Product.create(req.body);
  // console.log(product);
  res.status(200).json({
    product,
  });
});

const getProductsById = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const product = await Product.findById(id).populate('reviews.user');


  res.status(200).json({
    product,
  });
});

const getAdminProduct = asyncHandler(async (req, res, next) => {
 
  const products = await Product.find();


  res.status(200).json({
    products,
  });
});

const deleteProduct = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const product = await Product.findByIdAndDelete(id);
  res.status(200).json({
    product,
    message: "Producto eliminado",
  });
});

const updateProduct = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  let product = await Product.findById(id);

  if (!product) {
    ErrorHandler(res, 403, 'Usuario no autorizado');
  }
  product = await Product.findByIdAndUpdate(id, req.body, { new: true });

  res.status(200).json({
    product,
    message: "Producto actualizado",
  });
});


//create product review => create product review

const createProductReview = asyncHandler(async (req, res, next) => {
  const {rating, comment, productId} = req.body;
  const review = {
    user: req?.user?._id,
    rating: Number(rating),
    comment,
    
  }
  const product = await Product.findById(productId);

  if (!product) {
    ErrorHandler(res, 403, 'Usuario no autorizado');
  }
  
  const isReviewed = product?.reviews?.find((r) => r.user.toString() === req?.user?._id.toString());

  if(isReviewed) {
    product.reviews.forEach((review) => {
      if(review.user.toString() === req?.user?._id.toString()) {
        review.rating = rating;
        review.comment = comment;
      }
    })
  } else {
    product.reviews.push(review);
    product.numReviews = product.reviews.length;
  }

  product.ratings = product.reviews.reduce((acc, item) => acc + item.rating, 0) / product.reviews.length; 

  await product.save({ validateBeforeSave: false });
  // console.log(product);
  res.status(200).json({
    succes : true
  });
});


const getProductReviews = asyncHandler(async (req, res, next) => {
 const product = await Product.findById(req.query.id);
  if (!product) {
    ErrorHandler(res, 403, 'Usuario no autorizado');
  }

  res.status(200).json({
    reviews: product.reviews,
  });
});

const deleteProductReview = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.query.productId);

  if (!product) {
    ErrorHandler(res, 403, 'Usuario no autorizado');
  }

  const reviews = product?.reviews?.filter(
    (review) => review._id.toString() !== req?.query?.id.toString()
  );

  const numOfReviews = reviews.length;

  const ratings =
    numOfReviews === 0
      ? 0
      : product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        numOfReviews;

  product = await Product.findByIdAndUpdate(
    req.query.productId,
    { reviews, numOfReviews, ratings },
    { new: true }
  );

  res.status(200).json({
    success: true,
    product,
  });

});


const canUserReview = asyncHandler(async (req, res, next) => {

    const orders = await Order.find({
      user: req.user._id,
    "orderItems.product" : req.query.productId,
    });

    if (orders.length === 0) {
      return res.status(200).json({ canReview: false });
    }

    res.status(200).json({
      canReview: true,
    })

});

module.exports = {
  getProducts,
  newProduct,
  getProductsById,
  updateProduct,
  deleteProduct,
  createProductReview,
  getProductReviews,
  deleteProductReview,
  canUserReview,
  getAdminProduct
};
