const express = require("express");
const router = express.Router();
const multer = require('multer');


const storage = multer.memoryStorage(); // Use memory storage for buffer access

const upload = multer({ storage }); // Initialize multer with the memory storage



const{HandelGetHome}=require('../controller/user');
const{HandelGetAboutus}=require('../controller/user');
const{HandelGetDashboard}=require('../controller/user');
const{HandelGetSignup}=require('../controller/user');
const{HandelGetLogin}=require('../controller/user'); 
const{HandelGetLogout}=require('../controller/user');   
const{HandelGetAllAdminSignup}=require('../controller/user');
const{HandelGetAllAdminAdd}=require('../controller/user');
const{HandelAllUserSignup}=require('../controller/user');
const{HandelAllUserLogin}=require('../controller/user');
const{HandelAllAdminAddPet}=require('../controller/user');
const{HandelAllAdminSignup}=require('../controller/user');
const{HandelAllPetsFech}=require('../controller/user');
const{HandelAllInformation}=require('../controller/user');
const{HandelGetAllPassword}=require('../controller/user');
const{HandelPassword}=require('../controller/user');
const{authMiddleware,authAdmin,authMiddlewareDashboard}=require('../Middleware/middleware');

router.get('/pets/:category', HandelAllPetsFech);
router.get("/",authMiddlewareDashboard);
router.get("/home",HandelGetHome);
router.get("/About_Us",HandelGetAboutus);
router.get("/dashboard",authMiddleware,HandelGetDashboard);
router.get("/signup",HandelGetSignup);
router.get("/login",HandelGetLogin);
router.get("/logout",HandelGetLogout);
router.get("/Add",authAdmin,HandelGetAllAdminAdd);
router.get("/Regester",HandelGetAllAdminSignup);
router.get("/Database",HandelAllInformation);

router.post("/signup", HandelAllUserSignup);
router.post("/login", HandelAllUserLogin);
router.post('/pets', upload.single('petImage'), HandelAllAdminAddPet);
router.post("/Regester",HandelAllAdminSignup);


module.exports = router;