const mongoose = require('mongoose');
const config = require("config");
const dbgr = require("debug")("development:mongoose");


mongoose
.connect(`${config.get("MONGODB_URI")}/scatch`)
.then(function(){
    dbgr("connected");  //to check whether it is running in terminal write : $env:DEBUG= "development:*"
})
.catch(function(err){
    dbgr(err);
})

module.exports = mongoose.connection;