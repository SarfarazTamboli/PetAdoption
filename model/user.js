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
    petImage: { type: String },
});
  
  const User = mongoose.model('User', userSchema);
  const Dogs = mongoose.model('Dogs', petSchema);
  const Cats = mongoose.model('Cats', petSchema);
  const Birds = mongoose.model('Birds', petSchema);

module.exports ={
  User,
  Dogs,
  Cats,
  Birds,
}