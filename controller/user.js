const {User} = require("../model/user");
const {Dogs} = require("../model/user");
const {Cats} = require("../model/user");
const {Birds} = require("../model/user");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sharp = require('sharp'); 
const path = require("path");

const processImage = (buffer, filename) => {
  return new Promise((resolve, reject) => {
    const filepath = path.join(__dirname, "../uploads", filename);

    sharp(buffer)
      .resize({ width: 800 }) // Resize image to 800px width
      .jpeg({ quality: 50 }) // Compress image to 50% quality
      .toFile(filepath, (err) => {
        if (err) {
          reject("Image processing failed.");
        } else {
          resolve(filename);
        }
      });
  });
};


async function HandelGetHome(req, res)  {
  res.status(200).render('home')
};

async function HandelGetAboutus(req, res)  {
  res.status(200).render('aboutus')
};

async function HandelGetDashboard(req, res) {
  try {
    const token = req.cookies.authToken;

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (decodedToken.role === 'admin') {
      return res.status(200).render('dashboard', { user: decodedToken});
    }
    
    res.status(200).render('dashboard'); // Pass pets to the EJS template
  } catch (error) {
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

async function HandelGetAllPassword(req, res)  {
  res.status(200).render('password')
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
    const { petName, petType, petAge, petDescription,petBreed } = req.body;

    if (!petName || !petType || !petAge || !petDescription||!petBreed) {
      return res.render("Admin", { error: "All fields are required.", success: null });
    }

    if (!req.file) {
      return res.render("Admin", { error: "Image is required.", success: null });
    }

    const filename = `${Date.now()}-${req.file.originalname}`;

    // Call the image processing function
    await processImage(req.file.buffer, filename);

    // Check if all fields are provided

    // Create and save the pet
    if(petType==="Dog"){
      const Dog = new Dogs({
        petName,petType,petAge,petDescription,petBreed,petImage: filename, // Store the filename of the processed image
      });

      await Dog.save();
    }

    else if(petType==="Cat"){
      const Cat = new Cats({
        petName,petType,petAge,petDescription,petBreed,petImage: filename, // Store the filename of the processed image
      });

      await Cat.save();
    }

    else if(petType==="Bird"){
      const Bird = new Birds({
        petName,petType,petAge,petDescription,petBreed,petImage: filename, // Store the filename of the processed image
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


async function HandelPassword(req, res) {
  const correctPassword = "9175127796"; // Convert the correct password to a string
  const { password } = req.body;

  if (password === correctPassword) {
    res.redirect('/Databasee');
  } else {
    res.render('password', { error: 'Invalid password. Try again!' }); // Pass error message to the form
  }
}


  module.exports ={
    HandelGetHome,
    HandelGetDashboard,
    HandelGetAboutus,
    HandelGetSignup,
    HandelGetLogin,
    HandelGetLogout,
    HandelGetAllAdminAdd,
    HandelGetAllAdminSignup,
    HandelGetAllPassword,
    HandelAllUserSignup,
    HandelAllUserLogin,
    HandelAllAdminAddPet,
    HandelAllAdminSignup,
    HandelAllPetsFech,
    HandelAllInformation,
    HandelPassword,
};