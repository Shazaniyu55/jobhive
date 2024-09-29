const Admin  = require('../model/adminmodel');
const employer = require("../model/jobmode")
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cloudinary = require("../cloudinary");
const streamifier = require('streamifier');
const Notification = require('../model/notification');
require('dotenv').config();

// Set up Nodemailer
const transporter = nodemailer.createTransport({
    service:  process.env.SERVICE,
    auth:{
        user: process.env.EMAIL,
        pass :process.env.EMAIL_PASS,
    },
    tls:{
        rejectUnauthorized: false
    }
  });

const logIn = async(req, res)=>{
    try {
        const { email, password } = req.body;
        const user = await Admin.findOne({ email });
        if (!user) {
            return res.status(401).json({ status: "Failed", message: "invalid email or password" });
        }

        req.session.user ={
            id: user._id,
            email: user.email,
            username: user.username
        }




                // Send success response
                res.status(200).json({
                    status: "Success",
                    message: "Login successful",
                    user:{
                      id: user.id,
                      email:user.email,
                      username: user.username
                    }
                });

                

    } catch (error) {
        console.error("Error during login:", error);

        // Handle errors and ensure only one response
        if (!res.headersSent) {
            res.status(500).json({ status: "Failed", message: error.message });
        }   
    }
    
    
};


const signUp = async (req, res) => {
    try {
      const { username, email, password } = req.body;
  
      if (!username || !email || !password) {
        return res.status(400).json({ status: "Failed", message: "Please fill out all fields." });
      }else{
        createuser()
      }
  
  

      async function createuser(){

         // Create a new user with the provided data and the image URL if available
      const user = new Admin({
        username,
        email,
        password
      });


        try {
            await user.save();


 
            res.status(200).json({
                status: "Success",
                message: "Login successful",
                user
            });
            
        } catch (error) {
            console.error('Error saving product:', error);
                res.status(500).send('Error saving product');
        }
      }
  
     
  
      
  
     
    } catch (error) {
      console.error("Error during signup:", error);
  
      // Handle errors and ensure only one response
      if (!res.headersSent) {
        res.status(500).json({ status: "Failed", message: error.message });
      }
    }
};


const postJob = async(req, res)=>{

    const {title,postername,companyname, jobtype,  state, address, description, adminId, hourlyrate} = req.body
 
    if (title ==="" || postername === "" || companyname ===""  || jobtype === "" || hourlyrate=== "" || state === "" || address === "" || description ==="" || adminId == "") {
     res.json("these fields are required")
     
    } else{
      // Check if file is uploaded
      if (!req.file) {
        return res.status(400).send('No file uploaded.');
      }

      // Convert the buffer to a readable stream
      const stream = streamifier.createReadStream(req.file.buffer);
         // Upload file to Cloudinary
         const fileUploadResult = await new Promise((resolve, reject) => {
          stream.pipe(
            cloudinary.uploader.upload_stream({ resource_type: 'auto' }, (error, result) => {
              if (error) {
                console.error('Error uploading to Cloudinary:', error);
                reject('Failed to upload file.');
              } else {
                resolve(result);
              }
            })
          );
        });


     var newEmployer = new employer({
         title:req.body.title,
         state: req.body.state,
         address: req.body.address,
         description:req.body.description,
         postedBy: req.body.adminId,
         jobtype: req.body.jobtype,
         postername: req.body.postername,
         companyname:req.body.companyname,
         hourlyrate: req.body.hourlyrate,
         posterimg:fileUploadResult.secure_url || "https://res.cloudinary.com/damufjozr/image/upload/v1703326116/imgbin_computer-icons-avatar-user-login-png_t9t5b9.png"
     })
 
     try{
             
         await newEmployer.save();
         res.status(200).json({status: "success", message: "Job posted successfully"})
     }catch(error){
        res.status(400).json({status: "failed", message: "Job posted fail"})
     }
 
    }
 
 
 
 
 }
 
 const getAdminJobs = async (req, res) => {
    try {
        const {adminId} = req.params; // Assuming req.user is populated by the authentication middleware

        // Find all jobs posted by this admin
        const jobs = await employer.find({ postedBy: adminId });

        if (!jobs.length) {
            return res.status(404).json({ message: 'No jobs found for this admin' });
        }

        //res.status(200).json(jobs);
        res.render('admin/manage', {jobs})
    } catch (error) {
        res.status(500).json({ message: 'Error fetching jobs', error });
    }
};

 const deleteJob = async (req, res) => {
    try {
        const adminId = req.body.adminId; // Assuming admin's ID is stored in req.user
        const { jobId } = req.params;

        // Check if jobId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({ message: 'Invalid job ID' });
        }

        // Find the job by ID
        const job = await employer.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Check if the job was posted by the admin
        if (!job.postedBy.equals(adminId)) {
            return res.status(403).json({ message: 'Unauthorized to delete this job' });
        }

        // Delete the job
        await employer.findByIdAndDelete(jobId);

        //res.status(200).json({ message: 'Job deleted successfully' });
        res.redirect(`dash/${adminId}`)
    } catch (error) {
        console.error('Error deleting job:', error); // Log the error for debugging
        res.status(500).json({ message: 'Error deleting job', error: error.message });
    }
}; 


 const getAllJobs = async(req, res, next)=>{
     const employers = await employer.find({})
     if(!employers){
         res.json("error")
     }else{
        
         res.json(employers)
     }
}
 
 
 
 const search = async (req, res) => {
     const criteria = req.body;
     const query = {};
 
     if (criteria.title) {
         query.title = { $regex: new RegExp(criteria.title, 'i') }; // Correct regex usage
     }
 
     try {
         const result = await employer.find(query);
         //res.status(200).json({result});
       
         res.render('search', {result})
     } catch (error) {
         res.status(500).json({ error: 'An error occurred while searching for jobs.' });
     }
 };
 
 
 const searchState = async (req, res) => {
     const criteria = req.body;
     const query = {};
 
     if (criteria.state) {
         query.state = { $regex: new RegExp(criteria.state, 'i') }; // Correct regex usage
     }
 
     try {
         const result = await employer.find(query);
         res.render('search', {result})
     } catch (error) {
         res.status(500).json({ error: 'An error occurred while searching for jobs.' });
     }
 };

 const createNotification = async (userId, message, type) => {
  try {
    const notification = new Notification({
      message,
      type,
      user: userId
    });

    await notification.save();
    console.log('Notification created:', notification);
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

//  const applyJob = async (req, res) => {
//     try {
//       const { jobId, jobTitle, fullname, experience, email } = req.body;
//       console.log(jobId, jobTitle, fullname, experience, email);
  
//       // Check if file is uploaded
//       if (!req.file) {
//         return res.status(400).send('No file uploaded.');
//       }
  
//       // Convert the buffer to a readable stream
//       const stream = streamifier.createReadStream(req.file.buffer);
  
//       // Upload file to Cloudinary
//       const fileUploadResult = await new Promise((resolve, reject) => {
//         stream.pipe(
//           cloudinary.uploader.upload_stream({ resource_type: 'auto' }, (error, result) => {
//             if (error) {
//               console.error('Error uploading to Cloudinary:', error);
//               reject('Failed to upload file.');
//             } else {
//               resolve(result);
//             }
//           })
//         );
//       });

//       await createNotification(jobId, `${fullname} applied ${jobTitle}`, 'info'); 
//       const adminId = await Admin.findById(jobId)
//       console.log(adminId.email)
      
//       // Create email content
//       const mailOptions = {
//         from: process.env.EMAIL_USER,
//         to: `${adminId.email}`, // Admin email
//         subject: 'New Job Application',
//         text: `
//           New job application received.
  
//           User Fullname: ${fullname}
//           Job ID: ${jobId}
//           Job Title: ${jobTitle}
//           Experience: ${experience}
//           Email: ${email}
  
//           Resume URL: ${fileUploadResult.secure_url}
//         `,
//       };

//       const applicantMail = {
//         from: process.env.EMAIL_USER,
//         to:`${email}`,
//         subject: `Your application for ${jobTitle} was received `
//       }
  
//       // Send email
//       await transporter.sendMail(mailOptions);
//       await transporter.sendMail(applicantMail);
  
//       // Respond to client
//       res.status(200).json({status: 'success',message: 'Application submitted successfully.'});
  
//     } catch (error) {
//       console.error('Error processing application:', error);
//       res.status(500).send('Internal Server Error');
//     }
//   }

const applyJob = async (req, res) => {
  try {
    const { jobId, jobTitle, fullname, experience, email } = req.body;

    // Check if file is uploaded
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    // Check if file is a PDF, PNG, or JPEG
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg'];
    const fileType = req.file.mimetype;
    if (!allowedTypes.includes(fileType)) {
      return res.status(400).send('Only PDF, PNG, and JPEG files are allowed.');
    }

    // Convert the buffer to a readable stream
    const stream = streamifier.createReadStream(req.file.buffer);

    // Upload file to Cloudinary
    const fileUploadResult = await new Promise((resolve, reject) => {
      stream.pipe(
        cloudinary.uploader.upload({ resource_type: 'auto' }, (error, result) => {
          if (error) {
            console.error('Error uploading to Cloudinary:', error);
            reject('Failed to upload file.');
          } else {
            resolve(result);
          }
        })
      );
    });

    console.log('File upload result:', fileUploadResult);

    await createNotification(jobId, `${fullname} applied ${jobTitle}`, 'info'); 
    const adminId = await Admin.findById(jobId);
    console.log('Admin email:', adminId.email);
    
    // Create email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: `${adminId.email}`, // Admin email
      subject: 'New Job Application',
      text: `
        New job application received.

        User Fullname: ${fullname}
        Job ID: ${jobId}
        Job Title: ${jobTitle}
        Experience: ${experience}
        Email: ${email}

        Resume URL: ${fileUploadResult.secure_url}
      `,
    };

    const applicantMail = {
      from: process.env.EMAIL_USER,
      to: `${email}`,
      subject: `Confirmation: Your Application for the ${jobTitle} Position`,
      text: `Dear ${fullname},

              Thank you for applying for the ${jobTitle} position with us!

              We have successfully received your application, and our team will review your qualifications shortly. We appreciate your interest in joining our organization.

              Here are the details of your application:

              Job Title: ${jobTitle}
              Full Name: ${fullname}
              Experience: ${experience}
              Email: ${email}
              If your profile matches our requirements, we will reach out to you to discuss the next steps.

              Thank you once again for your application. We wish you the best of luck!

           `
    };
  
    // Send email
    await transporter.sendMail(mailOptions);
    await transporter.sendMail(applicantMail);
  
    // Respond to client
    res.status(200).json({ status: 'success', message: 'Application submitted successfully.' });
  
  } catch (error) {
    console.error('Error processing application:', error);
    res.status(500).send('Internal Server Error');
  }
};



module.exports ={signUp, logIn, postJob, searchState, search, getAllJobs, deleteJob, getAdminJobs, applyJob}