const express = require("express");
const router = express.Router();
const multer = require('multer');



const storage = multer.memoryStorage(); // Store files in memory temporarily
const upload = multer({ storage });



const{HandelGetHome}=require('../controller/user');
const{HandelGetAboutus}=require('../controller/user');
const{HandelGetDashboard}=require('../controller/user');
const{HandelGetSignup}=require('../controller/user');
const{HandelGetLogin}=require('../controller/user'); 
const{HandelGetLogout}=require('../controller/user');   
const{HandelGetAllAdminSignup}=require('../controller/user');
const{HandelGetAllAdminAdd}=require('../controller/user');
const{HandelGetAllEdit}=require('../controller/user');
const{HandelAllGetUpdate}=require('../controller/user');
const{HandelAllUserSignup}=require('../controller/user');
const{HandelAllUserLogin}=require('../controller/user');
const{HandelAllAdminAddPet}=require('../controller/user');
const{HandelAllAdminSignup}=require('../controller/user');
const{HandelAllPetsFech}=require('../controller/user');
const{HandelAllInformation}=require('../controller/user');
const{HandelGetAllPassword}=require('../controller/user');
const{HandelPassword}=require('../controller/user');
const{HandelAllDelete}=require('../controller/user');
const{HandelAllUpdate}=require('../controller/user');
const{authAdmin,authMiddlewareDashboard}=require('../Middleware/middleware');

router.get('/pets/:category', HandelAllPetsFech);
router.get("/",authMiddlewareDashboard);
router.get("/home",HandelGetHome);
router.get("/About_Us",HandelGetAboutus);
router.get("/dashboard",HandelGetDashboard);
router.get("/signup",HandelGetSignup);
router.get("/login",HandelGetLogin);
router.get("/logout",HandelGetLogout);
router.get("/Add",authAdmin,HandelGetAllAdminAdd);
router.get("/Regester",HandelGetAllAdminSignup);
router.get("/Database",HandelAllInformation);
router.get("/edit",HandelGetAllEdit);
router.get("/update-pet/:petType/:id",HandelAllGetUpdate);

router.post("/signup", HandelAllUserSignup);
router.post("/login", HandelAllUserLogin);
router.post('/pets', upload.single('petImage'), HandelAllAdminAddPet);
router.post("/Regester",HandelAllAdminSignup);
router.post('/update-pet/:id', upload.single('petImage'), HandelAllUpdate);


router.delete("/api/pets/:category/:id",HandelAllDelete);


module.exports = router;