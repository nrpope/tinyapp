const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const {
  generateRandomString,
  getUserByEmail,
  checkPassword,
  isUsersLink
} = require('./helper');

app.use(cookieSession({ name: 'session', keys: ['lighthouse'] }));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

const getUser = function(req) {
  const id = req.session.user_id;
  const user = id ? users[id] : null;
  return user;
};
//DATABASE --------------------------->
const users = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: bcrypt.hashSync('purple-monkey-dinosaur', 10)
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk'
  }
};
const urlDatabase = {
  b6UTxQ: { longURL: 'www.tsn.ca', userID: 'userRandomID' },
  i3BoGr: { longURL: 'www.google.ca', userID: 'aJ48lW' }
};

//GET REQUESTS--------------------------------->
//landing page. Will redirect based on cookie status
app.get('/', (req, res) => {
  const user = getUser(req);
  if (user) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

// Generate a new short URL from a long URL
app.get('/urls/new', (req, res) => {
  const user = getUser(req); // check if the cookie already exists
  if (user) {
    let templateVars = { user };
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

// Urls page that shows user's generated short and long URLs:
app.get('/urls', (req, res) => {
  const id = req.session.user_id;
  const user = id ? users[id] : null; // check if the cookie already exists with a legit id
  if (user) {
    let templateVars = { urls: isUsersLink(urlDatabase, id), user };
    res.render('urls_index', templateVars);
  } else {
    res.status(403).send('Please login or register first.');
  }
});

//shows urls by random string ID
app.get('/urls/:id', (req, res) => {
  let templateVars = {
    urlObj: urlDatabase[req.params.id],
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id]['longURL'],
    user: getUser(req)
  };
  res.render('urls_show', templateVars);
});

//edit the longURL name from the database
app.get('/urls/:shortURL/edit', (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
});

//goes to edit page from shortURL address
app.get('/urls/:shortURL', (req, res) => {
  const { shortURL } = req.params;
  const id = req.session.user_id;
  const user = id ? users[id] : null; // check if the cookie already exists with a legit id
  if (user && urlDatabase[shortURL]) {
    let templateVars = {
      shortURL,
      longURL: urlDatabase[shortURL].longURL,
      user
    };
    res.render('urls_show', templateVars);
  } else {
    res.send('Requested page was not found');
  }
});

//login page GET
app.get('/login', (req, res) => {
  const id = req.session.user_id;
  const user = id ? users[id] : null;
  let templateVars = { user };
  res.render('login', templateVars);
});

//go to register page
app.get('/register', (req, res) => {
  const id = req.session.user_id;
  const user = id ? users[id] : null; // check if the cookie already exists with a legit id
  let templateVars = { user };
  res.render('register', templateVars);
});

//goes from shortURL link to webpage
app.get('/u/:shortURL', (req, res) => {
  const { shortURL } = req.params;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(`http://${longURL}`);
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
  const userID = req.session.user_id;
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
  let loginEmail = req.body.email;
  let loginPassword = req.body.password;
  let userID = getUserByEmail(loginEmail, users);
  let passwordCheck = checkPassword(loginEmail, loginPassword, users[userID]);
  if (userID && passwordCheck) {
    req.session.user_id = userID;
    res.redirect('/urls');
  } else {
    res.send('Invalid email or password combination.');
  }
});

//creates a new shortURL with a randomly generated
app.post('/urls', (req, res) => {
  const { longURL } = req.body;
  const shortURL = generateRandomString();
  const userID = req.session.user_id;
  urlDatabase[shortURL] = {
    longURL,
    userID
  };
  res.redirect(`/urls/${shortURL}`);
});

//deletes the URL from the database
app.post('/urls/:shortURL/delete', (req, res) => {
  const { shortURL } = req.params;
  const userID = req.session.user_id;
  if (userID) {
    delete urlDatabase[shortURL];
  } else {
    res.send('Unauthorized request');
  }
  res.redirect('/urls');
});

//clears the user_id from cookies
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});
//create new user
app.post('/register', function(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).send('An email or password needs to be entered.');
    return;
  } else if (getUserByEmail(email, users)) {
    res.status(400).send('Email is already in use.');
    return;
  } else {
    const userID = generateRandomString();
    users[userID] = {
      id: userID,
      email: email,
      password: bcrypt.hashSync(password, 10)
    };
    req.session.user_id = userID;
    res.redirect('/urls');
  }
});

//Server run code------------------------------->
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
