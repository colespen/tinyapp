const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
////    tell Express app to use EJS as its templating engine ---->
app.set("view engine", "ejs");
////    middleware which translates and parses body
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


////////////////////////////////////////////////
////    GET Routes
////////////////////////////////////////////////

app.get("/", (req, res) => {
  res.send("Hello there human.");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  // (loop through urls keys in index.ejs)
  ////    render method responds to requests by sending template and object with data template needs -> obj is paaed to EJS templates
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

////    Express route parameters pass data from frontend to backend via request url
app.get("/urls/:id", (req, res) => {

  ////    creating variable that stores object's key:values from client GETs
  const templateVars =
    { id: req.params.id, longURL: urlDatabase[req.params.id] };

  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const newKey = req.params.id;
  //params is allowing access of keys or values within the url
  const longURL = urlDatabase[newKey];
  ////    link new short ID to longURL
  res.redirect(longURL);
});


////////////////////////////////////////////////
////    POST Routes
////////////////////////////////////////////////

//// <form> submit assigned via action and method attributes
app.post("/urls", (req, res) => {
  console.log('------ Added:\n', req.body); // Log the POST request body to the console

  let tinyID = generateRandomString();
  urlDatabase[tinyID] = req.body.longURL; //--> add new key: value to obj

  res.redirect(`/urls/${tinyID}`);
});

////   removes URL resource (key:value pair) from obj with delete button
app.post("/urls/:id/delete", (req, res) => {
  console.log("------ Resource removed:\n", req.params);

  const keyDel = req.params.id;
  delete urlDatabase[keyDel];

  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  console.log('------ Edited:\n', req.params, req.body);

  const keyMod = req.params.id;
  const valueMod = req.body.longURLupdate;
  urlDatabase[keyMod] = valueMod;
  res.redirect("/urls");
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


////////////////////////////////////////////////
////    short-URL-Code function temp location
////////////////////////////////////////////////

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