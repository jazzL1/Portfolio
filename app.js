const express = require("express");
const app = express();
const path = require("path");
const port = 80;

const {toDoItem, user} = require('./schemas.js');
const isLoggedIn = require('./middleware.js');
const catchAsync = require('./utilities/catchAsync.js');
const ExpressError = require('./utilities/ExpressError.js');
const {formatDate, sortCategories, defaultDate} = require('./public/helperFunctions.js');

const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');
const mongoose = require('mongoose');


async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/toDoList');
}
main()
.then(() => {console.log('Successfully connected to database')})
.catch(err => console.log(err));

require('dotenv').config({ path: path.resolve(__dirname, '.env') });

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }));

passport.use(new LocalStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    }
));
app.use(passport.session());
app.use(methodOverride('_method'));


app.get("/", (req, res) => {
  res.render("resume");
});

app.get('/toDo', (req, res) => {
  res.render('login');
});

app.post('/toDo', passport.authenticate('local', {failureRedirect: '/toDo'}), (req,res) => {
  res.redirect('/toDo/list');
})

app.get('/toDo/register', (req, res) => {
  res.render('register');
});

app.post('/toDo/register', catchAsync(async (req, res) => {
  try {
      const registeredUser = await user.register(new user({ username : req.body.username}), req.body.password);
      req.logIn(registeredUser, () => {
          res.redirect('/toDo/list');
      });
  } catch (error) {
      res.redirect('/toDo/register');
  }
}));

app.get('/toDo/logout', (req, res) => {
  req.logout(() => {
      res.redirect('/toDo');
  });
  
});

app.get('/toDo/list', isLoggedIn, catchAsync(async (req, res) => {
  const currentUser = req.user;
  const username = currentUser.username;
  const currentUserToDos = await toDoItem.find({user: currentUser});
  const workToDos = []; 
  const personalToDos =[];
  const schoolToDos = [];
  for(toDo of currentUserToDos) {
      if(toDo.category === "work") {
          workToDos.push(toDo);
      }
      else if(toDo.category === "personal") {
          personalToDos.push(toDo);
      }
      else {
          schoolToDos.push(toDo);
      }
  }
  sortCategories(workToDos);
  sortCategories(personalToDos);
  sortCategories(schoolToDos);
  res.render('index', {workToDos, personalToDos, schoolToDos, formatDate, defaultDate, username});
}));

app.post('/toDo/list', isLoggedIn, catchAsync(async (req, res) => {
  const userSubmission =  req.body;
  const newToDo = await new toDoItem({task: userSubmission.task, priority:userSubmission.priority, category: userSubmission.category, completeBy: userSubmission.completeBy, user: req.user});
  await newToDo.save();
  res.redirect('/toDo/list');
}));

app.delete('/toDo/list/:id', isLoggedIn, catchAsync(async (req, res) => {
  if(req.body.complete) {
      await toDoItem.findByIdAndDelete(req.params.id);
  }
  res.redirect('/toDo/list');
}));

app.patch('/toDo/list/:id', isLoggedIn, catchAsync(async (req, res) => {
  const updates = req.body;
  await toDoItem.findByIdAndUpdate(req.params.id, {$set: updates});
  res.redirect('/toDo/list');
}));

app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
  const {message = "error", statusCode = 500} = err;
  res.status(statusCode).send(message);
})

app.listen(port, () => {
  console.log(`Listenting on port ${port}`);
});