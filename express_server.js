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
                    // (loop through urls keys in index)

  ////    render method responds to requests by sending template and object with data template needs -> obj is paaed to EJS templates
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
  ////    Express route parameters pass data from frontend to backend via request url
app.get("/urls/:id", (req, res) => {

  ////    creating variable that stores objects key values from client GETs
  const templateVars = 
  { id: req.params.id, longURL: urlDatabase[req.params.id] };

  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  ////    pull last key (newest) ??better way??
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
  console.log(req.body); // Log the POST request body to the console
  let tinyID = generateRandomString();
  urlDatabase[tinyID] = req.body.longURL;
  res.redirect(`/urls/${tinyID}`);
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
  let tinyCode = '';
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const charLength = chars.length;
  for (let i = 0; i < 6; i++) {
    tinyCode += chars.charAt(Math.floor(Math.random() *
      charLength));
  }
  return tinyCode;
};
console.log(generateRandomString());