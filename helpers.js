////////    Helper Function Module

////    looks up user info by email
const getUserByEmail = function(email, usersDatabase) {
  for (const user in usersDatabase) {
    if (usersDatabase[user].email === email) {
      return usersDatabase[user];
    }
  }
  return undefined; //was null
};

////    short-URL-Code generator
const generateRandomString = () => {
  
  let tinyID = '';
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const charLength = chars.length;
  for (let i = 0; i < 6; i++) {
    tinyID += chars.charAt(Math.floor(Math.random() *
      charLength));
  }
  return tinyID;
};

////    filter URLs by matching userID's
const urlsForUser = (currentUser, database) => {
  let urls = {};
  const ids = Object.keys(database); //making array

  for (const id of ids) {
    // console.log(url_arr[u].userID);
    const url = database[id]; // each indiv obj in list
    if (url.userID === currentUser) {
      urls[id] = url;
    }
  }
  return urls;
};

module.exports = { 
  getUserByEmail, generateRandomString, urlsForUser
};