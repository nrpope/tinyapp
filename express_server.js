const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(function(req, res, next) {
  res.locals.username = req.cookies['username'] || false;
  next();
});

const urlDatabase = {
  b2xVn2: 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

const generateRandomString = function() {
  let result = '';
  const chars =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 1; i < 7; ++i) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

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
  let templateVars = {
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies['username']
  };
  res.render('urls_new', templateVars);
});
//shows list of short && long urls
app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
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
    username: req.cookies['username']
  };
  res.render('urls_show', templateVars);
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
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

//creates a new shortURL with a randomly generated string
app.post('/urls', (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;

  res.redirect(`/urls/${shortURL}`);
});
//deletes the URL from the database
app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect('/urls');
});
//clears the username cookies
app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});
app.post('/register', (req, res) => {
  let randomString = generateRandomString();
  users[randomString] = {
    id: randomString,
    email: req.body.email,
    password: req.body.password
  };
  res.cookie('user_id', randomString);
  res.redirect('/urls');
});
//Server run code------------------------------->
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
