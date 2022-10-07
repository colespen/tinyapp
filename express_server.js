const express = require("express");
const cookieSession = require('cookie-session');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const { getUserByEmail, generateRandomString, urlsForUser
} = require('./helpers');

const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

/////////////////////////////////////////////////////////
////    Middleware which translates and parses body
/////////////////////////////////////////////////////////

app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'usercookie',
  keys: ['74hf7', 'AA88s7s7*DHj3#']
}));
app.use(morgan('dev'));

/////////////////////////////////////////////////////////
////    In-memory Object
/////////////////////////////////////////////////////////

const urlDatabase = {
};

const users = {
};


/////////////////////////////////////////////////////////
////    GET Routes
/////////////////////////////////////////////////////////

app.get("/", (req, res) => {

  const id = req.session.user_id;
  const user = users[id];

  const templateVars = {
    urls: null,
    user
  };
  res.render("urls_home", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/urls", (req, res) => {
  
  const id = req.session.user_id;
  const user = users[id];
 
  if (!user) {
    return res.render("urls_gologin", { user: null });
  }
  const userUrls = urlsForUser(user.id, urlDatabase);

  const templateVars = {
    urls: userUrls,
    user
  };
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {

  const id = req.session.user_id;
  const user = users[id];
  const templateVars = {
    user
  };
  if (!user) {
    return res.render("urls_gologin", { user: null });
  }
  res.render("urls_new", templateVars);
});


app.get("/urls/:id", (req, res) => {

  const userId = req.session.user_id;
  const user = users[userId];

  const urlID = req.params.id;
  const url = urlDatabase[urlID];

  if (!url) {
    return res.send("ID does not exist!");
  }
  if (!user || url.userID !== user.id) {
    return res.send("You don't have permission to edit this.");
  }
  const templateVars = {
    urlId: urlID,
    longURL: url.longURL,
    user
  };
  res.render("urls_show", templateVars);
});


app.get("/u/:id", (req, res) => {

  const id = req.params.id;
  const url = urlDatabase[id].longURL;

  if (!url) {
    return res.send("URL not found.");
  }
  res.redirect(url);
});


app.get("/register", (req, res) => {

  const userId = req.session.user_id;
  const user = users[userId];

  if (user) {
    return res.redirect("/urls");
  }
  res.render("urls_register", { user: null });
});


app.get("/login", (req, res) => {

  const userId = req.session.user_id;
  const user = users[userId];
  if (user) {
    return res.redirect("/urls");
  }
  res.render("urls_login", { user: null });
});



/////////////////////////////////////////////////////////
////    POST Routes
/////////////////////////////////////////////////////////


app.post("/urls", (req, res) => {
  
  const userId = req.session.user_id;
  const user = users[userId];
  const tinyID = generateRandomString();

  urlDatabase[tinyID] = req.body;
  urlDatabase[tinyID].userID = user.id;
  
  if (!user) {
    return res.send("Must be a TinyApp user to use this!");
  }
  res.redirect(`/urls/${tinyID}`);
});


app.post("/urls/:id/delete", (req, res) => {
  
  const urlID = req.params.id;
  const url = urlDatabase[urlID];

  const userId = req.session.user_id;
  const user = users[userId];

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


app.post("/urls/:id", (req, res) => {
 
  const urlID = req.params.id;
  const url = urlDatabase[urlID];

  const newURL = req.body.longURLupdate;

  const userId = req.session.user_id;
  const user = users[userId];

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

  res.redirect("/urls");
});


app.post("/login", (req, res) => {
 
  const { email, password } = req.body;
  const userMatch = getUserByEmail(email, users);

  if (!email || !password) {
    return res.render("urls_403", { user: null });
  }
  if (!userMatch) {
    return res.render("urls_403", { user: null });
  }
  const passMatch =
    bcrypt.compareSync(password, userMatch.password);
  if (!passMatch) {
    return res.render("urls_403", { user: null });
  }
  const id = userMatch.id;

  req.session.user_id = id;
  res.redirect("/urls");
});


app.post("/logout", (req, res) => {

  req.session = null;
  res.redirect("/");
});


app.post("/register", (req, res) => {
 
  const { email, password } = req.body;
  const genId = generateRandomString();
  const userMatch = getUserByEmail(email, users);
 
  if (!email || !password) {
    return res.render("urls_400", { user: null });
  }
  if (userMatch) {
    return res.render("urls_400", { user: null });
  }
  const hashedPass = bcrypt.hashSync(password, 10);

  users[genId] = {
    id: genId,
    email,
    password: hashedPass
  };

  req.session.user_id = genId;
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});