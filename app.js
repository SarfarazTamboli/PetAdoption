const express = require('express');
const mongoose = require('mongoose');
const path = require("path");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});


const userRoutes = require("./routes/user");
const {connectMongoDb}=require("./connection/connection");

connectMongoDb();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, "views"));
app.use("/static", express.static("static"))
app.use('/uploads', express.static('uploads', { maxAge: '1d' }));


app.use("/",userRoutes);
app.use("/api",userRoutes);


  app.listen(3000, () => console.log('Server running on http://localhost:3000'));
