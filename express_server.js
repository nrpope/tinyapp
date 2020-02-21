const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(function(req, res, next) {
  res.locals.user_id = req.cookies['user_id'] || false;
  next();
});

//DATABASE --------------------------->
const users = {
  userRandomID: {
    id: 'aJ48lW',
    email: 'user@example.com',
    password: 'test1'
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk'
  }
};
const urlDatabase = {
  b6UTxQ: { longURL: 'https://www.tsn.ca', userID: 'aJ48lW' },
  i3BoGr: { longURL: 'https://www.google.ca', userID: 'aJ48lW' }
};
//Function junction ------------------------->
function checkExistingEmail(email) {
  for (let userID in users) {
    if (users[userID].email === email) {
      return true;
    }
  }
  return false;
}

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
const checkPassword = function(loginEmail, loginPassword, objectDb) {
  for (let user in objectDb) {
    if (
      objectDb[user].email === loginEmail &&
      bcrypt.compareSync(loginPassword, objectDb[user].password)
    ) {
      return true;
    }
  }
  return false;
};

//GET REQUESTS--------------------------------->

//create new short url by entering in domain name
app.get('/urls/new', (req, res) => {
  let userId = req.cookies.user_id;
  let user = users[userId];
  let templateVars = {
    urls: urlDatabase,
    user: user
  };
  res.render('urls_new', templateVars);
});
//shows list of short && long urls
app.get('/urls', (req, res) => {
  let userId = req.cookies['user_id'];
  let templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get('/urls/:id', (req, res) => {
  let templateVars = {
    urlObj: urlDatabase[req.params.id],
    shortURL: req.params.id
  };
  console.log('templatevars', templateVars);
  res.render('urls_show', templateVars);
});

//edit the longURL name from the database
app.get('/urls/:shortURL/edit', (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
});
//goes to edit page from shortURL address
app.get('/urls/:shortURL', (req, res) => {
  let templateVars = {
    user: req.cookies.user_id,
    urlObj: urlDatabase[req.params.shortURL],
    shortURL: req.params.shortURL
  };
  res.render('urls_show', templateVars);
});
//login page GET
app.get('/login', (req, res) => {
  res.render('login');
});

//go to register page
app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/u/:shortURL', (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
});

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

//POST REQUESTS-------------------------------->

//updates LongURL
app.post('/urls/:id', (req, res) => {
  res.redirect('/urls');
});

//updates longURL
app.post('/urls/:shortURL/edit', (req, res) => {
  const userID = req.cookies.user_id;
  const shortURL = req.params.shortURL;
  let usersObj = isUsersLink(urlDatabase, userID);
  //check if shortURL exists for current user:
  if (usersObj[shortURL]) {
    urlDatabase[shortURL].longURL = req.body.longURL;
    res.redirect('/urls');
  } else {
    res.status(403).send('You do not have access to edit this link');
  }
});

//accepts login cookie
app.post('/login', (req, res) => {
  let foundUser = checkExistingEmail(req.body.email);
  if (foundUser) {
    if (foundUser.password === req.body.password) {
      res.cookie('user_id', foundUser.id);
      res.redirect('/urls');
    } else {
      res.status(403).send("Passwords don't match");
    }
  } else {
    res
      .status(403)
      .send(
        'That password does not exist. Please try again or register as new user'
      );
    res.redirect('/urls');
  }
});
app.post('/login', function(req, res) {
  let loginEmail = req.body.loginemail;
  let loginPassword = req.body.loginPassword;
  let userID = getUserByEmail(loginEmail, users);
  let passwordCheck = checkPassword(loginEmail, loginPassword, users);
  console.log('passwordcheck', passwordCheck);
  if (userID && passwordCheck) {
    req.session.user_id = userID;
    res.redirect('/urls');
  } else {
    res.send('Invalid email or password combination.');
  }
});

//creates a new shortURL with a randomly generated
app.post('/urls', (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: req.cookies.user_id
  };
  res.redirect('http://localhost:8080/urls/' + shortURL);
});
//deletes the URL from the database
app.post('/urls/:id/delete', (req, res) => {
  const UrlObj = urlDatabase[req.params.id];
  console.log(req.cookies);
  if (UrlObj.userID === req.cookies.user_id) {
    console.log('Before', urlDatabase);
    delete urlDatabase[req.params.id];
    console.log('After', urlDatabase);
    res.redirect('/urls');
  } else {
    res.status(403).send('Must be logged in to delete URLs');
  }
});
//clears the user_id cookies
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  let randomString = generateRandomString();
  let { email, password } = req.body;
  if (!email || !password) {
    res.status(400).send('Please enter both an email and password to register');
    res.redirect('/register');
  } else if (checkExistingEmail(email, users)) {
    res.status(400).send('This email is already in use');
    res.redirect('/register');
  } else {
    let userID = generateRandomString();
    users[userID] = {
      id: userID,
      email: email,
      password: bcrypt.hashSync(password, 10)
    };
    res.cookie('user_id', userID);
    res.redirect('/urls');
  }
});

//Server run code------------------------------->
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
