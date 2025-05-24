const express = require('express');
const router = express.Router();
const 
{
    signUp, 
    logIn,
    getAllJobs,
    postJob,
    search,
    searchState,
    getAdminJobs,
    deleteJob,
    applyJob

} = require('../controller/authcontroller');
const multer = require("multer");

const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage });

// post
router.post('/register', signUp);
router.post('/login', logIn);
router.post('/postjob',upload.single('image'), postJob);
router.post('/search', search);
router.post('/searchstate', searchState);
router.post('/deletejob/:jobId', deleteJob);
router.post('/applyjob',upload.single('image'), applyJob);

// get
router.get('/getjobs', getAllJobs);
router.get('/my-jobs/:adminId', getAdminJobs);
router.get('/upload', )


module.exports = router