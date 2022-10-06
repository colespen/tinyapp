const express = require("express");
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');

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
    userID: "aJ48lWuser",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lWuser",
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
////    filter URLs by matching userID's
const urlsForUser = (currentUser) => {
  let urls = {};
  const ids = Object.keys(urlDatabase); //making array

  for (const id of ids) {
    // console.log(url_arr[u].userID);
    const url = urlDatabase[id]; // each indiv obj in list
    if (url.userID === currentUser) {
      urls[id] = url;
    }
  }
  return urls;
};


////////////////////////////////////////////////////
////    GET Routes
////////////////////////////////////////////////////

app.get("/", (req, res) => {
  const id = req.cookies.user_id;
  const user = users[id];
  const templateVars = {
    urls: urlDatabase,
    user
  };
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const id = req.cookies.user_id;
  const user = users[id];

  // 

  const templateVars = {
    urls: urlDatabase,
    user
  };
  //  ******************** FIX below!
  // if (!user) {
  //   return res.send("Please login first!");
  //  }
  ////    (loop through urls keys in index.ejs)
  ////    render method responds to requests by sending template an object with data template needs -> obj is passed to EJS templates
  res.render("urls_index", templateVars);
  // console.log("* * * * * * * * * * * ", urlDatabase);
});


app.get("/urls/new", (req, res) => { ///FIX !user REDIRECT*********
  const id = req.cookies.user_id;
  const user = users[id];
  const templateVars = {
    user
  };
  if (!user) {
    return res.redirect("/login");
  }
  // console.log("GET* * * * * * * * * * * * * * * * * * *",templateVars)
  res.render("urls_new", templateVars);
});


app.get("/urls/:id", (req, res) => {
  const user_id = req.cookies.user_id;
  const user = users[user_id];

  const urlID = req.params.id;
  const url = urlDatabase[urlID];

  if (!url) {
    return res.send("ID does not exist!");
  }
  // console.log("* * * * * * * * * * * * * * * ", {users, urlDatabase}, url);
  if (!user || url.userID !== user.id) {
    return res.send("You don't have permission to edit this.");
  }
  const templateVars = {
    urlId: urlID,
    longURL: url.longURL, //(removed longURL)
    user
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  //params is allowing access of keys or values within the url
  // console.log("GET* * * * * * * * * * * * * * * *",urlDatabase);
  const url = urlDatabase[id].longURL;

  if (!url) { // if !undefined  (direct lookup in obj's)
    return res.send("URL not found.");
  }

  ////    link new short ID to longURL
  res.redirect(url);
});

app.get("/register", (req, res) => {
  const user_id = req.cookies.user_id;
  const user = users[user_id];

  if (user) { //if undefined
    return res.redirect("/urls");
  }
  res.render("urls_register", { user: null });
  ////    pass unnamed obj with empty user property
});

app.get("/login", (req, res) => {
  const user_id = req.cookies.user_id;
  const user = users[user_id];
  if (user) {
    return res.redirect("/urls");
  }
  res.render("urls_login", { user: null });
});



////////////////////////////////////////////////////
////    POST Routes
////////////////////////////////////////////////////

//// <form> submit assigned via action and method attributes
app.post("/urls", (req, res) => { //*********** FIX !user redirect
  // console.log('---------- Added:\n', req.body);
  const user_id = req.cookies.user_id;
  const user = users[user_id];
  const tinyID = generateRandomString();

  //--> add new key: value to obj
  urlDatabase[tinyID] = req.body; //removed.longURL
  urlDatabase[tinyID].userID = user.id; //removed.longURL
  // console.log("* * * * * * * * * * * * * *", urlDatabase);
  if (!user) {
    return res.send("Must be a TinyApp user to use this!");
  }
  res.redirect(`/urls/${tinyID}`);
});

////   Removes URL resource (key:value pair) from obj with delete button
app.post("/urls/:id/delete", (req, res) => {
  // console.log("---------- Resource removed:\n", req.params);
  const urlID = req.params.id;
  const url = urlDatabase[urlID];

  const user_id = req.cookies.user_id;
  const user = users[user_id];

  if (!url) {
    return res.send("ID does not exist!");
  }
  if (!user) {
    return res.send("You must be logged in first.");
  }
  if (url.userID !== user.id) {
    return res.send("You don't have permission to delete that.");
  }

  delete urlDatabase[urlID];

  res.redirect("/urls");
});

////    Edits existing URLs resource *
app.post("/urls/:id", (req, res) => {
  // console.log('POST* * * * * * * * * * * * * * * * * Edited:\n');
  const urlID = req.params.id;
  const url = urlDatabase[urlID];

  const newURL = req.body.longURLupdate;

  const user_id = req.cookies.user_id;
  const user = users[user_id];

  if (!url) {
    return res.send("ID does not exist!");
  }
  if (!user) {
    return res.send("You must be logged in first.");
  }
  if (url.userID !== user.id) {
    return res.send("You don't have permission to do that.");
  }


  urlDatabase[urlID].longURL = newURL;


  console.log("* * * * * * * * * * * * * * * ", urlID);
  res.redirect("/urls");
});

////    Sets username cookie 
app.post("/login", (req, res) => {
  // console.log('---------- User login:\n', req.body);

  const { email, password } = req.body;
  const userMatch = lookupUserByEmail(email);

  if (!email || !password) {
    return res.render("urls_403", { user: null });
  }
  if (!userMatch) {
    return res.render("urls_403", { user: null });
  }
  const passMatch = //checking matching
  bcrypt.compareSync(password, userMatch.password);
  if (!passMatch) {
    return res.render("urls_403", { user: null });
  }
  const id = userMatch.id;

  res.cookie("user_id", id); //set cookie
  res.redirect("/urls");
});

////    Clears username cookie
app.post("/logout", (req, res) => {
  // console.log('--------- User logout:');

  const id = req.cookies.user_id;
  console.log(id);
  res.clearCookie("user_id", id);
  res.redirect("/urls");
});

////    Adds new user to object
app.post("/register", (req, res) => {
  // console.log('---------- User added:');
  const { email, password } = req.body;
  const genId = generateRandomString() + "user";
  const userMatch = lookupUserByEmail(email);

  if (!email || !password) {
    return res.render("urls_400", { user: null });
  }
  if (userMatch) {
    return res.render("urls_400", { user: null });
  }
  // encrypt pass.
  const hashedPass = bcrypt.hashSync(password, 10);

  users[genId] = {
    id: genId,
    email,
    password: hashedPass
  };

  res.cookie("user_id", genId);
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



