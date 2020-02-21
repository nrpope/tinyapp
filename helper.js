const bcrypt = require('bcrypt');

const generateRandomString = function() {
  let result = '';
  const chars =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 1; i < 7; ++i) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
const isUsersLink = function(object, id) {
  let usersObject = {};
  for (let key in object) {
    if (object[key].userID === id) {
      usersObject[key] = object[key];
    }
  }
  return usersObject;
};

const getUserByEmail = function(email, database) {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user].id;
    }
  }
};

//Password Validation using bcrypt
const checkPassword = function(loginEmail, loginPassword, user) {
  if (
    user.email === loginEmail &&
    bcrypt.compareSync(loginPassword, user.password)
  ) {
    return true;
  }
  return false;
};

module.exports = {
  generateRandomString,
  getUserByEmail,
  checkPassword,
  isUsersLink
};
