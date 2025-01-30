const {User} = require("../model/user");
const {Dogs} = require("../model/user");
const {Cats} = require("../model/user");
const {Birds} = require("../model/user");
const {Order} = require("../model/user");
const mongoose = require('mongoose');
const cloudinary = require('../app');  // Adjust the path according to your folder structure

const { promises: fsPromises } = require('fs');
const nodemailer = require('nodemailer');
const path = require('path');
const ejs = require('ejs');
const puppeteer = require('puppeteer');



const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 

const uploadToCloudinary = (buffer, filename) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { resource_type: 'image', public_id: filename },
      (error, result) => {
        if (error) {
          reject('Image upload failed.');
        } else {
          resolve(result.secure_url); // Use the secure URL from Cloudinary
        }
      }
    ).end(buffer);
  });
};


const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE, // Using the environment variable
  auth: {
    user: process.env.EMAIL_USER, // Using the environment variable
    pass: process.env.EMAIL_PASS, // Using the environment variable
   },
 });



async function HandelGetHome(req, res)  {
  res.status(200).render('home')
};

async function HandelGetContact(req, res)  {
  res.status(200).render('contact')
};

async function HandelGetAboutus(req, res)  {
  res.status(200).render('aboutus')
};

async function HandelGetAllEdit(req, res)  {

  try {
    const token = req.cookies.authToken;

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (decodedToken.role === 'admin') {
      return res.status(200).render('edit', { user: decodedToken});
    }
    
    res.status(200).render('edit'); // Pass pets to the EJS template
  } catch (error) {
    console.error('Error to load Dashboard', error);
    res.status(500).send('Internal Server Error');
  }
};

async function HandelGetDashboard(req, res) {
  try {
    const token = req.cookies.authToken;

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (decodedToken.role === 'admin') {
      return res.status(200).render('dashboard', { user: decodedToken});
    }
    
    res.status(200).render('dashboard'); // Pass pets to the EJS template
  }   catch (error) {

    // If the token is expired, redirect to login
    if (error.name === 'TokenExpiredError') {
      return res.redirect('/login');
    }

    console.error('Error to load Dashboard', error);

    res.status(500).send('Internal Server Error');
  }
}

async function HandelGetSignup(req, res) {
  res.status(200).render('signup', { error: null, success: null });
};

async function HandelGetAllAdminAdd(req, res)  {
  res.status(200).render('Admin')
};
async function HandelGetAllAdminSignup(req, res)  {
  res.status(200).render('AdminRegester')
};

async function HandelGetLogin(req, res)  {
  res.status(200).render('login')
};

async function HandelGetLogout(req, res)  {
  res.clearCookie('authToken');
  res.redirect('/');
};

async function HandelGetBillingPage(req, res)  {
  const { petType, petId } = req.params;

  let petModel;

  

  // Determine the model based on the petType
  if (petType === 'Dog') {
    petModel = Dogs;
  } else if (petType === 'Cat') {
    petModel = Cats;
  } else if (petType === 'Bird') {
    petModel = Birds;
  } else {
    return res.status(400).send('Invalid pet type');
  }

  try {
    // Check if petId is valid
    if (!mongoose.Types.ObjectId.isValid(petId)) {
      return res.status(400).send('Invalid pet ID');
    }

    // Use findById for simplicity and automatic handling of ObjectId conversion
    const pet = await petModel.findById(petId);


    if (!pet) {
      return res.status(404).send('Pet not found');
    }

    // Send pet data to the view
    res.render('billing', { pet: pet, error: null });
  } catch (err) {
    console.log(err);
    res.render('billing', { error: "Data not found", pet: null });
  }
};





async function HandelGetAllPassword(req, res)  {
  res.status(200).render('password')
};


async function HandelAllGetUpdate(req, res) {
  const petId = req.params.id;
  const petType = req.params.petType;
  let petModel;

    // Determine which model to use based on the category
    if (petType === 'Dog') {
      petModel = Dogs;
    } else if (petType === 'Cat') {
      petModel = Cats;
    } else if (petType === 'Bird') {
      petModel = Birds;}

      try {
        // Fetch pet details from database using petId
        const pet = await petModel.findById(petId); // Use await instead of callback
        if (!pet) {
          return res.status(404).send('Pet not found');
        }
        res.render('update-pet', { pet }); // Pass pet details to the update page
      } catch (err) {
        console.log(err);
        res.status(500).send('Error fetching pet details.');
      }
};

async function HandelAllUserSignup(req, res) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.render('signup', { error: 'All fields are required.', success: null });
    }

    // Check if user already exists
    const existingUserByEmail = await User.findOne({ email });
    const existingUserByUsername = await User.findOne({ username });

    if (existingUserByUsername) {
      return res.render('signup', { error: 'Username is already taken.', success: null });
    }
    if (existingUserByEmail) {
      return res.render('signup', { error: 'Email is already in use.', success: null });
    }

    // Hash password and create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    // Render success message
    return res.render('signup', { error: null, success: 'Signup successful! Redirecting to login...' });
  } catch (err) {
    console.error(err);
    res.render('signup', { error: 'Server error. Please try again later.', success: null });
  }
};

async function HandelAllUserLogin(req, res) {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.render('login', { error: 'Username or Password is InValid.' });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.render('login', { error: 'Username or Password is InValid.' });

    // Generate JWT token
    const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Set token in cookies with explicit expiry
    res.cookie('authToken', token, { httpOnly: true, maxAge: 60 * 60 * 1000 }); // 1 hour
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    return res.render('login', { success: null });
  }
}


async function HandelAllAdminSignup(req, res) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.render('AdminRegester', { error: 'All fields are required.', success: null });
    }

    const role = "admin";

    const existingUserByEmail = await User.findOne({ email });
  
    if (existingUserByEmail) {
      return res.render('AdminRegester', { error: 'Email is already in use.', success: null });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword, role });

    await user.save();

    return res.render('AdminRegester', { error: null, success: 'Signup successful! Redirecting to login...' });
  } catch (err) {
    console.error('Error occurred:', err);
    res.render('AdminRegester', { error: 'Server error. Please try again later.', success: null });
  }
};


async function HandelAllAdminAddPet(req, res) {
  try {
    const { petName, petType, petAge, petDescription,petBreed,petPrice } = req.body;

    if (!petName || !petType || !petAge || !petDescription||!petBreed||!petPrice) {
      return res.render("Admin", { error: "All fields are required.", success: null });
    }

    if (!req.file) {
      return res.render("Admin", { error: "Image is required.", success: null });
    }

    const filename = `${req.file.originalname}`;
    
    // Upload the image to Cloudinary
    const imageUrl = await uploadToCloudinary(req.file.buffer, filename);

  

    // Create and save the pet
    if(petType==="Dog"){
      const Dog = new Dogs({
        petName,petType,petAge,petDescription,petBreed,petPrice,petImage: imageUrl, // Store the filename of the processed image
      });

      await Dog.save();
    }

    else if(petType==="Cat"){
      const Cat = new Cats({
        petName,petType,petAge,petDescription,petBreed,petPrice,petImage: imageUrl, // Store the filename of the processed image
      });

      await Cat.save();
    }

    else if(petType==="Bird"){
      const Bird = new Birds({
        petName,petType,petAge,petDescription,petBreed,petPrice,petImage: imageUrl, // Store the filename of the processed image
      });

      await Bird.save();
    }
    res.render("Admin", { error: null, success: "Successfully added!" });
  } catch (error) {
    console.error("Error adding pet:", error);
    res.render("Admin", { error: error || "Server error. Please try again later.", success: null });
  }
}



async function HandelAllPetsFech(req, res) {
const category = req.params.category; // Extract category from the URL
try {
  if(category==='Dog'){
    const dogs = await Dogs.find({ petType: category });

    res.json(dogs); // Send matching pets as JSON
  }

  else if(category==='Cat'){
    const cats = await Cats.find({ petType: category });

    res.json(cats); // Send matching pets as JSON
  }

  else if(category==='Bird'){
    const bird = await Birds.find({ petType: category });

    res.json(bird); // Send matching pets as JSON
  }

} catch (error) {
  res.status(500).json({ message: 'Error fetching pets', error });
}
};

async function HandelAllInformation(req, res) {
  try {
    const token = req.cookies.authToken;
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (decodedToken.email === 'sarfarazght786@gmail.com' || decodedToken.email === 'alfiya@gmail.com') {
       // Fetch data from all collections
    const users = await User.find();
    const dogs = await Dogs.find();
    const cats = await Cats.find();
    const birds = await Birds.find();

    // Pass data to the EJS template
    res.render('information', { users, dogs, cats, birds });
    }

    else{
      return res.status(200).redirect('/dashboard');
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('An error occurred while fetching data');
  }
};


async function HandelAllDelete(req, res) {
  const { category, id } = req.params;

  try {
    let petModel;

    // Determine which model to use based on the category
    if (category === 'Dog') {
      petModel = Dogs;
    } else if (category === 'Cat') {
      petModel = Cats;
    } else if (category === 'Bird') {
      petModel = Birds;
    } else {
      return res.status(400).json({ message: 'Invalid pet category' });
    }

    // Delete the pet by its ID
    const pet = await petModel.findByIdAndDelete(id);

    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    res.status(200).json({ message: 'Pet deleted successfully' });
  } catch (error) {
    console.error('Error deleting pet:', error);
    res.status(500).json({ message: 'Server error' });
  }
};




async function HandelAllUpdate(req, res) {
  const petId = req.params.id;
  const { petName, petType, petBreed, petAge, petPrice } = req.body;
  let filename = req.file ? req.file.path : req.body.petImage;

  let petModel;
    
    // Upload the image to Cloudinary
    if (req.file) {
      // Upload the image to Cloudinary if a file is uploaded
      petImage = await uploadToCloudinary(req.file.buffer, filename);
    } else {
      // Use the existing petImage if no new file is uploaded
      petImage = req.body.petImage;
    }
  // Determine the model based on the petType
  if (petType === 'Dog') {
    petModel = Dogs;
  } else if (petType === 'Cat') {
    petModel = Cats;
  } else if (petType === 'Bird') {
    petModel = Birds;
  } else {
    return res.status(400).send('Invalid pet type');
  }

  try {
    // Update the pet in the database
    const updatedPet = await petModel.findByIdAndUpdate(
      petId,
      { petName, petType, petBreed, petAge, petPrice, petImage },
      { new: true } // Return the updated document
    );

    if (!updatedPet) {
      return res.status(404).send('Pet not found');
    }

    res.render('update-pet',{data:"Data is Updated",pet:updatedPet}); // Redirect to the pet details page
  } catch (err) {
    console.log(err);
    res.render('update-pet',{error:"Data is not Updated"});
  }
};



async function HandelPassword(req, res) {
  const correctPassword = "9175127796"; // Convert the correct password to a string
  const { password } = req.body;

  if (password === correctPassword) {
    res.redirect('/Databasee');
  } else {
    res.render('password', { error: 'Invalid password. Try again!' }); // Pass error message to the form
  }
}

let receipno=0;
let increment=1;
// POST route to handle the order confirmation
async function HandelAllPayment(req, res) {
  const {
    firstName,
    lastName,
    email,
    phone,
    paymentMethod,
    cardNumber,
    expirationDate,
    cvv,
    pet_id,
    petType,
    petName,
    petAge,
    petBreed,
    petPrice
  } = req.body;

  try {
    // Find the pet by its type and ID dynamically
    let pet;
    if (petType === 'Dog') {
      pet = await Dogs.findById(pet_id);
    } else if (petType === 'Cat') {
      pet = await Cats.findById(pet_id);
    } else if (petType === 'Bird') {
      pet = await Birds.findById(pet_id);
    }

    if (!pet) {
      res.render('billing',{message:'Pet not found'});
    }

     // Simulate payment processing
     const paymentStatus = 'Completed'; // In a real app, you would integrate with a payment gateway
     const transactionId = '1234567890'; // Simulated transaction ID
 
     if (firstName && lastName && email && phone && paymentMethod && pet_id && petType && petName && petAge && petBreed && petPrice) {
       const order = new Order({
         firstName, lastName, email, phone,paymentMethod, paymentStatus, transactionId, pet_id, petName, petType, petAge, petBreed, petPrice
       });
       await order.save();
 
       // Delete the pet from the database after the order is created
       if (petType === 'Dog') {
         await Dogs.findByIdAndDelete(pet_id);
       } else if (petType === 'Cat') {
         await Cats.findByIdAndDelete(pet_id);
       } else if (petType === 'Bird') {
         await Birds.findByIdAndDelete(pet_id);
       }
     }
    
     receipno+=increment
      // Generate PDF from HTML template
      const receiptHtml = await ejs.renderFile(path.join(__dirname, '..', 'views', 'receipt.ejs'), {
        firstName, lastName, email, petName, petType, petBreed, petAge, petPrice, paymentMethod, transactionId,receipno,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString()
      });
      

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(receiptHtml);
    const pdfPath = path.join(__dirname, 'receipt.pdf');
    await page.pdf({ path: pdfPath, format: 'A4' });
    await browser.close();
 
 
     const mailOptions = {
       from: process.env.EMAIL_USER, 
       to: email,
       subject: 'Pet Purchase Receipt',
       text: `Dear ${firstName},\n\nThank you for your purchase! Attached is your receipt.\n\nBest regards,\nPetAdopt Team`,
       attachments: [
         {
           filename: 'receipt.pdf',
           path: pdfPath,
         },
       ],
     };
 
     await transporter.sendMail(mailOptions);
 
     // Clean up the generated PDF asynchronously
     await fsPromises.unlink(pdfPath);
 
     // Respond with success
     res.render('billing', { message: 'Purchase successfully completed' });
   } catch (error) {
     console.error(error);
     res.render('billing', { message: 'Failed to Purchase' });
   }
 }

 async function HandelAllContact(req, res) {
  const { name, email, message } = req.body;

  const mailOptions = {
      from: email, // The sender's email (from the user)
      to:  process.env.EMAIL_USER, // The email you want to receive the message at
      subject: `Contact Message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
  };

  transporter.sendMail(mailOptions, (error) => {
      if (error) {
          console.log(error);
          res.render('billing', { message: 'something went wrong' });
      }
     
      res.render('billing', { message: 'Your message has been sent successfully!' });
  });
};





  module.exports ={
    HandelGetHome,
    HandelGetContact,
    HandelGetDashboard,
    HandelGetAboutus,
    HandelGetSignup,
    HandelGetLogin,
    HandelGetLogout,
    HandelGetAllAdminAdd,
    HandelGetAllAdminSignup,
    HandelGetAllPassword,
    HandelGetAllEdit,
    HandelAllGetUpdate,
    HandelGetBillingPage,
    HandelAllUserSignup,
    HandelAllUserLogin,
    HandelAllAdminAddPet,
    HandelAllAdminSignup,
    HandelAllPetsFech,
    HandelAllInformation,
    HandelAllDelete,
    HandelPassword,
    HandelAllUpdate,
    HandelAllPayment,
    HandelAllContact
}