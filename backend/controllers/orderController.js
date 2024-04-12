const { response, request } = require("express");
const errorHandler = require("../utils/errorHandler");
const Order = require("../models/order");
const Product = require("../models/product");

const { asyncHandler } = require("../middlewares/asyncHandler");

//create new order => create new order

const createOrder = asyncHandler(async (req, res, next) => {
  const {
    orderItems,
    shippingInfo,
    itemsPrice,
    taxAmount,
    shippingAmount,
    totalAmount,
    paymentMethod,
    paymentInfo,
  } = req.body;

  const order = await Order.create({
    orderItems,
    shippingInfo,
    itemsPrice,
    taxAmount,
    shippingAmount,
    totalAmount,
    paymentMethod,
    paymentInfo,
    user: req.user._id,
  });
  res.status(201).json({
    order,
  });
});

const myOrders = asyncHandler(async (req, res, next) => {
  const order = await Order.find({ user: req.user._id });

  // if (!order) {
  //   return next(new errorHandler("Order not found", 404));
  // }
  res.status(200).json({
    order,
  });
});

//get order details => get order details

const getOrderDetails = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    return next(new errorHandler("Order not found", 404));
  }
  res.status(200).json({
    success: true,
    order,
  });
});

//get all orders => get all orders

const getAllOrders = asyncHandler(async (req, res, next) => {
  const order = await Order.find();

  if (!order) {
    return next(new errorHandler("Order not found", 404));
  }
  res.status(200).json({
    success: true,
    order,
  });
});

//update order admin => update order

const updateOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new errorHandler("No Order found with this ID", 404));
  }

  if (order?.orderStatus === "Delivered") {
    return next(new errorHandler("You have already delivered this order", 400));
  }

  // Update products stock
  order?.orderItems?.forEach(async (item) => {
    const product = await Product.findById(item?.product?.toString());
    if (!product) {
      return next(new errorHandler("No Product found with this ID", 404));
    }
    product.stock = product.stock - item.quantity;
    await product.save({ validateBeforeSave: false });
  });

  order.orderStatus = req.body.status;
  order.deliveredAt = Date.now();

  await order.save();

  res.status(200).json({
    success: true,
  });
});

//delete order admin => delete order

const deleteOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new errorHandler("No Order found with this ID", 404));
  }
  if (order?.orderStatus === "Delivered") {
    return next(new errorHandler("You have already delivered this order", 400));
  }
  await order.deleteOne();
  res.status(200).json({
    success: true,
  });
});

async function getSalesData(startDate, endDate) {
  const salesData = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      },
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        },
        totalSales: { $sum: "$totalAmount" }, // Corregido aquí
        numOrders: { $sum: 1 },
      },
    },
  ]);



  const salesMap = new Map();
  let totalSales = 0;
  let totalNumOrders = 0;

  salesData.forEach((entry) => {
    const date = entry?._id.date;
    const sales = entry?.totalSales;
    const numOrders = entry?.numOrders;
    console.log("________________________________________________________________")
    console.log(numOrders);
    salesMap.set(date, { sales, numOrders });
    totalSales += sales;
    totalNumOrders += numOrders;
  });


  console.log("________________________________________________________________")
  console.log(totalSales);
  

  // Generate an array of dates between start & end Date
  const datesBetween = getDatesBetween(startDate, endDate);

  // Create final sales data array with 0 for dates without sales
  const finalSalesData = datesBetween.map((date) => ({
    date,
    sales: (salesMap.get(date) || { sales: 0 }).sales,
    numOrders: (salesMap.get(date) || { numOrders: 0 }).numOrders,
  }));

  return { salesData: finalSalesData, totalSales, totalNumOrders };
}

function getDatesBetween(startDate, endDate) {
  const dates = [];
  let currentDate = new Date(startDate);

  while (currentDate <= new Date(endDate)) {
    const formattedDate = currentDate.toISOString().split("T")[0];
    dates.push(formattedDate);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

const getSales = asyncHandler(async (req, res, next) => {
  const startDate = new Date(req.query.startDate);
  const endDate = new Date(req.query.endDate);

  startDate.setUTCHours(0, 0, 0, 0);
  endDate.setUTCHours(23, 59, 59, 999);

  const { salesData, totalSales, totalNumOrders } = await getSalesData(
    startDate,
    endDate
  );

  res.status(200).json({
    totalSales,
    totalNumOrders,
    sales: salesData,
  });
});

module.exports = {
  createOrder,
  getOrderDetails,
  myOrders,
  getAllOrders,
  updateOrder,
  deleteOrder,
  getSales,
};
