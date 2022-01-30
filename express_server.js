const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const bcrypt = require('bcryptjs');

app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}));


app.set("view engine", "ejs");

const generateRandomString = function() {
  return Math.random().toString(36).substr(2, 8);
  };

  const urlDatabase = {
    b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "aJ48lW"
    },
    i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "aJ48lW"
    }
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "$2a$10$9SaG0qG.sJR.9cZLIXTd/uXWEYvmJIcL4qo6dMahSLxnROEWZGHRi"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "$2a$10$9SaG0qG.sJR.9cZLIXTd/uXWEYvmJIcL4qo6dMahSLxnROEWZGHRi"
  }
}

app.get("/urls", (req, res) => {
  let obj1 = {};
  const loginID = req.cookies.id;
  for (let url in urlDatabase) {
    if (urlDatabase[url].urlID === loginID) {
      obj1[url] = urlDatabase[url];
    }
  }
  const userId = req.cookies["user_id"]
  const user = users[userId];
  let templateVars = {
    urls: obj1,
    user,
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL,
    userID: req.cookies.id,
  };
  res.redirect("/urls/" + shortURL);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {

  let obj1 = {};
  const loginID = req.cookies.id;
  for (let url in urlDatabase) {
    if (urlDatabase[url].urlID === loginID) {
      obj1[url] = urlDatabase[url];
    }
  }
  const userId = req.cookies["user_id"]
  const user = users[userId];
  let templateVars = {
    urls: obj1,
    user,
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    username: req.cookies["user_id"],
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});


app.post("/urls/:id" , (req, res) => {
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  let templateVars = {
    username: users[req.cookies.id],
  };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  let email = req.body.email;
  const password = req.body.password;
  console.log(password);
  for (let key in users) {
    if (users[key].email === email && bcrypt.compareSync(password, users[key].password)) {
      res.cookie("user_id", key);
      return res.redirect("/urls");
    }
  }
  res.status(400);
  res.send("Login failed");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  let templateVars = {
    username: users[req.cookies.id],
  };
  res.render("urls_registration", templateVars);
});
// Email check & error message

app.post("/register", (req, res) => {
  let userID = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;
  if (email === "" || password === "") {
    res.status(404);
    res.send("Email and Password cannot be blank");
  } else if (emailLookUp(email, users)) {
    res.status(400).send("Email already exists. Please login!!");
  } else {
    let hashedPassword = bcrypt.hashSync(password, 10);
    users[userID] = {
      password: hashedPassword,
      id: userID,
      email: email,
    };
    console.log(users);
    res.cookie("user_id", userID);
    res.redirect("/urls");
  
  }
});
const emailLookUp = (email, users) => {
  for (let key in users) {
    if (users[key].email === email) {
      return true;
    }
  }
  return false;
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});