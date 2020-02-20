const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
//const bcyrpt = require('bcrypt');

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(function(req, res, next) {
  res.locals.user_id = req.cookies['user_id'] || false;
  next();
});

const urlDatabase = {
  b6UTxQ: { longURL: 'https://www.tsn.ca', userID: 'aJ48lW' },
  i3BoGr: { longURL: 'https://www.google.ca', userID: 'aJ48lW' }
};

function checkExistingEmail(email) {
  for (let userID in users) {
    if (users[userID].email === email) return users[userID];
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

function urlsForUser(id) {
  const longURL = urlDatabase[req.params.id];
  let urlDatabase = '';
  for (var userID in longURL) {
    if (longURL.userID === req.cookies.user_id);
  }
  return false;
}

const users = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur'
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk'
  }
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
  let templateVars = { urlObj: urlDatabase[req.params.id] };
  res.render('urls_show', templateVars);
});

//edit the longURL name from the database
app.get('/urls/:shortURL/edit', (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
});
//goes to edit page from shortURL address
app.get('/urls/:shortURL', (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: req.cookies.user_id
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

//accepts login cookie
app.post('/login', (req, res) => {
  let foundUser = checkExistingEmail(req.body.email);
  if (foundUser) {
    res.cookie('user_id', foundUser.id);
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

//creates a new shortURL with a randomly generated

app.post('/urls', (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[id] = {
    shortURL: shortURL,
    longURL: longURL,
    userID: req.cookies.user_id
  };
  res.redirect('http://localhost:8080/urls/' + shortURL);
});
//deletes the URL from the database
app.post('/urls/:id/delete', (req, res) => {
  const UrlObj = urlDatabase[req.params.id];
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
  let email = req.body.email;
  if (!email || !req.body.password) {
    res.status(400).send('Please enter both an email and password to register');
    res.redirect('/register');
  } else if (checkExistingEmail(email)) {
    res.status(400).send('This email is already in use');
    res.redirect('/register');
  } else {
    users[randomString] = {
      id: req.body.id,
      email,
      password: req.body.password
    };
    res.cookie('user_id', email);
    res.redirect('/urls');
  }
});

//Server run code------------------------------->
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
