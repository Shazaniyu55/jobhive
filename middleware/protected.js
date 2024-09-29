const protected = (req, res, next)=>{
    if(req.session.user){
        next()
       
    }else{
        res.redirect('/admin')
    }
}

module.exports = protected