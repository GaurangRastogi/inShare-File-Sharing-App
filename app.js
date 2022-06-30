const express=require('express'); //package import and we call it using express variable
const path=require('path')
const app=express(); //app is now object of express class....
const PORT=process.env.PORT||3000; 

//Express specific configuratioin
app.use('/static',express.static('static'));    //serve static files
app.use(express.urlencoded())       //middlewarre-> help in bringing form data to express 

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '/index.html'));
});

//To start the server
app.listen(PORT,()=>{       
    console.log(`The application started at port ${PORT}`);
});


