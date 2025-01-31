const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {type: String,enum: ['user', 'admin'],default: 'user',},
  });

  const petSchema = new mongoose.Schema({
    petName: { type: String, required: true },
    petType: { type: String, required: true },
    petAge: { type: Number, required: true },
    petBreed: { type: String, required: true },
    petDescription: { type: String },
    petPrice: { type: Number },
    petImage: { type: String },
});


const orderSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },


  paymentMethod: { type: String, required: true },
  paymentStatus: { type: String, default: 'Pending' },  // Can be 'Pending' or 'Completed'
  transactionId:{ type: String, required: true },
  cardNumber: { type: String, required: false },  // Store only if payment method is credit card
  expirationDate: { type: String, required: false },  // Store only if payment method is credit card
  cvv: { type: String, required: false },  // Store only if payment method is credit card
  pet_id: {type: mongoose.Schema.Types.ObjectId, required: true,refPath: 'petType', },
  petType: { type: String, required: true },
  petName: { type: String, required: true },
  petAge: { type: Number, required: true },
  petBreed: { type: String, required: true },
  petPrice: { type: Number },
  orderDate: { type: Date, default: Date.now },
});

  
  const User = mongoose.model('User', userSchema);
  const Dogs = mongoose.model('Dogs', petSchema);
  const Cats = mongoose.model('Cats', petSchema);
  const Birds = mongoose.model('Birds', petSchema);
  const Order = mongoose.model('Order', orderSchema);

module.exports ={
  User,
  Dogs,
  Cats,
  Birds,
  Order,
}