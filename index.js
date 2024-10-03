const express = require('express');
const app = express();
const port = process.env.port || 2400;
const path = require('path');
const cors = require('cors');
const authRoute = require('./routes/userroute');
const mongoose = require("mongoose");
const bodyparser = require('body-parser');
const employer = require("./model/jobmode")
const Notification = require("./model/notification");
const session = require('express-session');
const protected = require("./middleware/protected");
const MongoStore = require('connect-mongo');
require('dotenv').config();

mongoose.connect(process.env.CONNECTION_URI).then(()=>{console.log("Database Connected")}).catch((err)=>{console.log(err)});
app.use(cors({origin: "https://www.transperfectly.com/"}));
app.use(bodyparser.json());
app.use(express.json());
// Configure session middleware
app.use(session({
    secret: 'jobhive', // replace with a strong secret key
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({mongoUrl: process.env.CONNECTION_URI}),
    cookie: { secure: false } // set secure: true if using HTTPS
}));
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'assets')));
app.use('/api/auth',  authRoute);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); 


// authentication middleware


app.get('/', (req, res)=>{
  
    res.render('index')
})
app.get('/job', async(req, res)=>{

    try {
        const employers = await employer.find()
        res.render('jobs', {employers})

    } catch (error) {
        res.status(500).send('Error fetching jobs');

    }
});


app.get('/admin', (req, res)=>{
    res.render('adminlogin')
})

app.get('/dash/:adminId',protected, async(req, res)=>{
    try {
        const {adminId} = req.params; // Assuming req.user is populated by the authentication middleware

        // Find all jobs posted by this admin
        const jobs = await Notification.find({ user: adminId }).populate('user')

        //res.status(200).json(jobs);
        res.render('admin/dash', {jobs, user:req.session.user})
    } catch (error) {
        res.status(500).json({ message: 'Error fetching jobs', error });
    }
    //res.render('admin/dash', {user:req.session.user})
})

app.get('/service', async(req, res)=>{
    try {
        const employers = await employer.find()
        res.render('categories', {employers})

    } catch (error) {
        res.status(500).send('Error fetching jobs');

    }
   
})
app.get('/upload',protected ,(req, res)=>{
    if (!req.session.user) {
        return res.status(403).json({ message: 'Access denied' });
    }
    res.render('admin/upload', {user: req.session.user})
})

app.get('/manage/:adminId', async(req, res)=>{
    try {
        const {adminId} = req.params; // Assuming req.user is populated by the authentication middleware

        // Find all jobs posted by this admin
        const jobs = await employer.find({ postedBy: adminId });

        //res.status(200).json(jobs);
        res.render('admin/manage', {jobs, user:req.session.user})
    } catch (error) {
        res.status(500).json({ message: 'Error fetching jobs', error });
    }
})
  


app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ status: "Failed", message: err.message });
        }
        res.redirect('/admin'); // Redirect to login page after logout
    });
});
app.use((req, res, next) => {
    res.status(404).render('404');
});

app.listen(port, ()=>{
    console.log(`server running at http://localhost:${port}`)
})

module.exports = app



