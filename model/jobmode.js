const mongoose = require("mongoose");

const employerSchema = new mongoose.Schema(

    {
      title:{
        type: String,
        required: true

      },
      jobtype:{
        type: String,
      },
      hourlyrate:{
        type: String
      },
      postername:{
        type:String
      },
      posterimg:{
        type:String
      },
      companyname:{
        type:String
      },
      state:{
        type: String,
      },
      address:{
        type:String,
      }
      ,
      description:{
        type:String,
        required: true
      },
      postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'admin' },


    },

    {timestamps:true}


)

const Employ = mongoose.model("jobs", employerSchema)
module.exports = Employ