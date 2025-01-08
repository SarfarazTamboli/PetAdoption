const jwt = require('jsonwebtoken');


function authMiddleware(req, res, next) {
  const token = req.cookies.authToken;
  if (!token) {
    return res.redirect('/login');
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.clearCookie('authToken');
    res.redirect('/login');
  }
}

function authMiddlewareDashboard(req, res, next) {
  const token = req.cookies.authToken;
 
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    res.redirect('/dashboard');
  } catch (err) {
    res.clearCookie('authToken');
    res.redirect('home');
  }
}

function authAdmin(req, res, next) {
  const token = req.cookies.authToken;

  if (!token) {
    return res.redirect('/login'); // Redirect if no token is present.
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET); // Decode and verify the token.

    // Check if the user's role is 'admin'.
    if (verified.role === 'admin') {
      return next(); // Proceed if the user is an admin.
    } else {
      return res.render('home'); // Redirect if the role is not 'admin'.
    }
  } catch (err) {
    // Clear the cookie and redirect if verification fails.
    console.error('JWT verification failed:', err);
    res.clearCookie('authToken');
    return res.redirect('/login');
  }
}


module.exports = { authMiddleware,authAdmin,authMiddlewareDashboard};
