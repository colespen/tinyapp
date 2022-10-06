const express = require("express");
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const app = express();
const PORT = 8080; // default port 8080
////    tell Express app to use EJS as its templating engine ---->
app.set("view engine", "ejs");

////////////////////////////////////////////////////
////    Middleware which translates and parses body
////////////////////////////////////////////////////

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

////////////////////////////////////////////////////
////    In-memory Object 
////////////////////////////////////////////////////

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};


const users = {
};

////////////////////////////////////////////////////
////    Functions temp location
////////////////////////////////////////////////////

////    short-URL-Code generator
const generateRandomString = () => {
  // 6 characters long
  // generate letters and integers combined together randomly
  let tinyID = '';
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const charLength = chars.length;
  for (let i = 0; i < 6; i++) {
    tinyID += chars.charAt(Math.floor(Math.random() *
      charLength));
  }
  return tinyID;
};

////    looks up user info by email
const lookupUserByEmail = (email) => {

  for (const id in users) {

    if (users[id].email === email) {
      return users[id]; // return on matching ID user object!!
    }
  }
  return null;        //OUTSIDE of Loop!!!
};



////////////////////////////////////////////////////
////    GET Routes
////////////////////////////////////////////////////

app.get("/", (req, res) => {
  res.send("Hello there human.");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const id = req.cookies.user_id;
  const user = users[id];
  const templateVars = {
    urls: urlDatabase,
    user
  };
  ////    (loop through urls keys in index.ejs)
  ////    render method responds to requests by sending template an object with data template needs -> obj is passed to EJS templates
  // console.log(urlDatabase);
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => { ///FIX REDIRECT****
  const id = req.cookies.user_id;
  const user = users[id];
  const templateVars = {
    user
  };
  // if (!user) {
  //   return res.redirect("/login");
  // }
  res.render("urls_new", templateVars);
});

////    Express route parameters pass data from frontend to backend via request url
app.get("/urls/:id", (req, res) => {
  const id = req.cookies.user_id;
  const user = users[id];
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  //params is allowing access of keys or values within the url
  const url = urlDatabase[id]; 
  // undefined if not found
  // direct lookup in objects
  if (!url) { // if !undefined
    return res.send("URL not found.");
  }
  ////    link new short ID to longURL
  res.redirect(url);
});

app.get("/register", (req, res) => {
  const id = req.cookies.user_id;
  const user = users[id];

  if (user) { //if undefined
    return res.redirect("/urls");
  }
  res.render("urls_register", { user: null });
  ////    pass unnamed obj with empty user property
});

app.get("/login", (req, res) => {
  const id = req.cookies.user_id;
  const user = users[id]
  if (user) {
   return res.redirect("/urls");
  }
  res.render("urls_login", { user: null });
});



////////////////////////////////////////////////////
////    POST Routes
////////////////////////////////////////////////////

//// <form> submit assigned via action and method attributes
app.post("/urls", (req, res) => {
  console.log('---------- Added:\n', req.body);

  const id = req.cookies.user_id;
  const user = users[id];
  const tinyID = generateRandomString();
  
  //--> add new key: value to obj
  urlDatabase[tinyID] = req.body.longURL; 
  console.log("* * * * * * * * * * * ", req.body.longURL);

  // if (!user) {
  //   return res.send("Must be a TinyApp user to use this!");
  // } ****************** FIX res.send() above
  res.redirect(`/urls/${tinyID}`);
});

////   Removes URL resource (key:value pair) from obj with delete button
app.post("/urls/:id/delete", (req, res) => {
  console.log("---------- Resource removed:\n", req.params);

  const keyDel = req.params.id;
  delete urlDatabase[keyDel];

  res.redirect("/urls");
});

////    Edits existing URLs resource * * * * * * * * *
app.post("/urls/:id", (req, res) => {
  console.log('---------- Edited:\n');

  const id = req.params.id;
  const valueMod = req.body.longURLupdate;
  console.log("-----------------------------", req.body.longURL);
  urlDatabase[id] = valueMod;
  res.redirect("/urls");
});

////    Sets username cookie 
app.post("/login", (req, res) => {
  console.log('---------- User login:\n', req.body);

  const { email, password } = req.body;
  const userMatch = lookupUserByEmail(email);

  if (!email || !password) {
    return res.render("urls_403", { user: null });
  }
  if (!userMatch) {
    return res.render("urls_403", { user: null });
  }
  if (userMatch.password !== password) {
    return res.render("urls_403", { user: null });
  }
  const id = userMatch.id;  
  //access id ----- already exists, dont need new cookie
  res.cookie("user_id", id); //set cookie
  res.redirect("/urls");
});

////    Clears username cookie
app.post("/logout", (req, res) => {
  console.log('--------- User logout:');
  
  const id = req.cookies.user_id;
  res.clearCookie("user_id", id);
  res.redirect("/urls");
});

////    Adds new user to object
app.post("/register", (req, res) => {
  console.log('---------- User added:');
  const { email, password } = req.body;

  const genId = generateRandomString() + "userid";

  const userMatch = lookupUserByEmail(email);

  if (!email || !password) {
    return res.render("urls_400", { user: null });
  }
  if (userMatch) {
    return res.render("urls_400", { user: null });
  }
  users[genId] = {
    id: genId,
    email,
    password
    //destructured above, const { / / / /} = obj
  };
  res.cookie("user_id", genId);
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



