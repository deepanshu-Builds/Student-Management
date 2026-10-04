const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
    {
        name : {
            type : String,
            required : [true , "Name is required"],
            trim : true,
            minlenght : 2,
            maxlenght : 50
        },
        email : {
            type : String,
            required :[true , "Email is required"],
            unique : true,
            kowercase : true,
            trim : true,
            index : true

        },
        password : {
            type : String,
            required :[true , "Password is required"],
            select : false
        },
        employeeId: {
            type : String,
            required :[true , "Employee ID is required"],
            unique : true,
            trim : true
        },
        department : {
            type : String,
            required : [true , "Department is required"],
            trim : true
        },
        role : {
            type : String,
            required : [true , " Role is required"],
            default : "teacher"
        },
        isActive : {
            type : Boolean,
            default : true
        }
        },
        {
            timestamps : true
        }

    

);
module.exports =  mongoose.model("User" , userSchema)