const express = require('express')
const path = require('path');
const mongodb = require('mongodb')
const app = express()
const cors = require('cors')
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const e = require('express');
const io = new Server(server);
const MongoClient = require('mongodb').MongoClient
var cookieParser = require('cookie-parser');
const session = require('express-session');


//dependencies
const port = 8080
const connectionString = 'mongodb://localhost:27017';


const pic1="https://static.independent.co.uk/s3fs-public/thumbnails/image/2018/04/09/20/istock-157528129.jpg?width=990&auto=webp&quality=75&crop=982:726,smart"
const pic2="https://media.istockphoto.com/photos/large-american-style-pepperoni-and-cheese-pizza-in-cardboard-delivery-picture-id1256339158?b=1&k=20&m=1256339158&s=170667a&w=0&h=XFNxZmudE_SZqqz3-nrIM6dCvvfuxU8xrvDLYkFHFAg="
const pic3= "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQEuY4JiA0nqqSTCsDqF2Ui7DNpQOJvS5hGZA&usqp=CAU"
const pic4 = pic3

const ad1={
  "id":[1,2],
  "ad_name":"Time For Coffee",
  "Pictures":[pic1,pic1],
  "text_lines": ["Do you love coffee?","This is your time ","Drink now!!!","Coffee with love"],
  "ad_time":10000,
  "template":1,
  "calender": {
      "date":[new Date('January 1, 2021 00:00:00'), new Date('December 31, 2022 00:00:00')],
      "days":[1,2,3,4,5],
      "hours":[01,23]
  }
}
const ad2={
  "id":[1,3],
  "ad_name":"Time For Pizza",
  "Pictures":[pic2],
  "text_lines": ["Do you love pizza?","What is your favorite topping?","Buy now!!!","Best Pizza in the world","discount code:pizza3030","S Pizza","M Pizza","L Pizza", "Pizza lovers only", "top10Pizzas"],
  "ad_time":10000,
  "template":2,
  "calender" : {
      "date":[new Date('March 1, 2021 00:00:00'), new Date('April 30, 2022 23:59:00')],
      "days":[2,3,4,5],
      "hours":[01,19]
  }
}
const ad3={
  "id":[3,2],
  "ad_name":"Empty add",
  "Pictures":[],
  "text_lines": [],
  "ad_time":10000,
  "template":3,
  "calender" : {
      "date":[new Date('May 1, 2021 00:00:00'), new Date('June 15, 2022 23:59:00')],
      "days":[0,1,2,3,4,5,6],
      "hours":[01,19]
  }
}
const ad4={
  "id":[1],
  "ad_name":"Time For Drinks",
  "Pictures":[],
  "text_lines": ["Jin or Vodka?","Beer or wine?"],
  "ad_time":10000,
  "template":1,
  "calender" : {
      "date":[new Date('Marc 29, 2021 00:00:00'), new Date('April 15, 2022 23:59:00')],
      "days":[1,2,3,4],
      "hours":[15,19]
  }
}
const ad5={
  "id":[3],
  "ad_name":"Time For Burger",
  "Pictures":[pic4,pic4],
  "text_lines": ["Do you love meat?","What is your favorite topping?","Buy now!!!","Best burger in the world","discount code:burger4040","vegan options","special sides"],
  "ad_time":10000,
  "template":2,
  "calender" : {
      "date":[ new Date('April 1, 2021 00:00:00'), new Date('April 30, 2023 23:59:00')],
      "days":[1,2,3],
      "hours":[01,23]
  }
}
const adds =[ad1,ad2,ad3,ad4,ad5];
let db



app.use(express.static(__dirname + 'script.js'));
app.use("/static", express.static('./static/'));
app.use(express.json());
app.use(express.urlencoded());
app.use(session({
    resave:false, 
    saveUninitialized:true, 
    secret:"uniqeId",
  }))

app.get('/', (req, res) => {
  //disconnect connect id
  res.sendFile(path.join(__dirname + '/client.html'));
})
app.get('/Admin', (req, res) => {
  db.collection('admin').findOne({session:req.sessionID},(err,result)=>{
    if(result) {
      res.sendFile(path.join(__dirname + '/adminPannel.html'));
    } else {
      res.sendFile(path.join(__dirname + '/login.html'));
    }
  });
})

app.get('/addAd', (req, res) => {
  //disconnect connect id
  res.sendFile(path.join(__dirname + '/addAd.html'));
})
app.get('/getAd', (req, res) => {

  const checkIfDateIsValid = (item) => {
    const now = new Date();
    let isValidDate = false;
    let isValidDay = false;
    let isValidHour = false;

    if(now.getTime() > item.calender.date[0] && now.getTime() < item.calender.date[1]) isValidDate = true;
    isValidDay = item.calender.days.includes(now.getDay())  
    if(now.getHours() >= item.calender.hours[0] && now.getHours() <= item.calender.hours[1]) isValidHour = true;

    return isValidDate && isValidDay && isValidHour;
  }
  const { query: {screen}} = req;
  const screenId = Number.parseInt(screen);
  db.collection('adds').find({id: screenId}).toArray((error,result) => {
    const filteredAds = result.filter((item) => checkIfDateIsValid(item));
    res.send(filteredAds);
  })
})


app.get('/admin/getAllAdds', (req, res) => {
  db.collection('adds').find().toArray((error,result) => {
    res.send(result);
  })
})

app.get('/admin/getAllUsers', (req, res) => {
  db.collection('users').find().toArray((error,result) => {
    res.send(result);
  })
})

app.post('/admin/login', (req, res) => {
  const { body } = req;
  const { username, password } = body;

  db.collection('admin').findOne({username: username}, (error, task)=> {
    if(task){
      if(task.username === username && task.password === password){
        db.collection('admin').updateOne({username: username},{
          $set:{
            session:req.sessionID
          }
        })
        res.sendFile(path.join(__dirname + '/adminPannel.html'));
      }
  } else {
    res.sendStatus(404);
  }
  })
})

app.get('/deleteAd', (req, res) => {
  const { query: {id} } = req;
  db.collection('admin').findOne({session:req.sessionID},(err,result)=>{
    db.collection('adds').deleteOne({_id: mongodb.ObjectId(id)});
  res.send("delete ad successfully")
  });
})

app.post('/addAd/add', (req, res) => {
  const { body } = req;
  db.collection('admin').findOne({session:req.sessionID},(err,result)=>{
    db.collection('adds').insertOne(body);
  res.send("ad added successfully")
  });
})

app.post('/updateAd', (req, res) => {
  const { body } = req;
  const {_id, nameAd} = body;
  db.collection('admin').findOne({session:req.sessionID},(err,result)=>{
    db.collection('adds').updateOne({_id: mongodb.ObjectId(_id)},{$set:{ad_name:nameAd}});
    res.send("ad updated successfully")
  });
})

app.post('/changePassword', (req, res) => {
  const { body } = req;
  const {newName, oldName, newPassword } = body;
  db.collection('admin').findOne({session:req.sessionID},(err,result)=>{
  if(newName!="" && newPassword!=""){
    db.collection('admin').updateOne({username: oldName}, {$set:{password:newPassword , username: newName}})
    res.send("username and password changed successfully")
  }
  else{
    if(newName=="" && newPassword=="")
      return;
    if(newName==""){
      db.collection('admin').updateOne({username: oldName}, {$set:{password:newPassword}})
    res.send("password changed successfully")
    }

    if(newPassword==""){
      db.collection('admin').updateOne({username: oldName}, {$set:{username: newName}})
    res.send("username changed successfully")
    }
  }
})});



io.on('connection', (socket) => {
 const userId = new mongodb.ObjectID();
 db.collection('users').insertOne({
    _id: userId,
    id: socket.id,
    screen: 0,
    connected: true
    })
  console.log('client connected')
    socket.on('disconnect', () => {
      db.collection('users').updateOne({id: socket.id}, {$set: {connected: false}})
      console.log('client disconnected')
    })

    socket.on('screenUpdate', (screenId) => {
      db.collection('users').updateOne({id: socket.id}, {$set: {screen: screenId}})

    })
})

server.listen(port, () => {
  MongoClient.connect(connectionString, (err, client) => {
    if (err) return console.error(err)
    db = client.db('adds-project')
    db.collection('adds').drop()
    db.collection('adds').insertMany(adds)
    db.collection('users').drop()
    db.collection('admin').drop()
    db.collection('admin').insertOne({username: "admin", password: "admin"});
    console.log('Connected to Database')
  })
  console.log(`listening at http://localhost:${port}`)
})