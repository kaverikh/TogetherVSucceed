const fs = require("fs");
const bodyParser = require("body-parser");
const jsonServer = require("json-server");
const jwt = require("jsonwebtoken");

const server = jsonServer.create();
const userdb = JSON.parse(fs.readFileSync("./db.json", "utf-8"));

server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.use(jsonServer.defaults());

const SECRET_KEY = "72676376";

const expiresIn = "1h";

function createToken(payload) {
  return jwt.sign(payload, SECRET_KEY, { expiresIn });
}

function isLoginAuthenticated({ email, password }) {
  let user = JSON.parse(fs.readFileSync("./db.json", "utf-8"));
  let data = user.users.findIndex(
    (user) => user.email === email && user.password === password
  );
  return data !== -1;
}

function isRegisterAuthenticated({ email }) {
  return userdb.users.findIndex((user) => user.email === email) !== -1;
}

server.post("/api/auth/register", (req, res) => {
  console.log(req.body);
  
  const { email, password, lname, fname, username, gyear } = req.body;
  if (isRegisterAuthenticated({ email })) {
    const status = 401;
    const message = "Email already exist";
    res.status(status).json({ status, message });
    return;
  }

  fs.readFile("./db.json", (err, data) => {
    if (err) {
      const status = 401;
      const message = err;
      res.status(status).json({ status, message });
      return;
    }
    data = JSON.parse(data.toString());

    data.users.push({
      fname,
      lname,
      username,
      email,
      password,
      gyear,
    });

    let writeData = fs.writeFile(
      "./db.json",
      JSON.stringify(data),
      (err, result) => {
        if (err) {
          const status = 401;
          const message = err;
          res.status(status).json({ status, message });
          return;
        }
      }
    );
  });
  res.status(200).json({ message: "Registeration successful" });
});

server.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  let profile = {};

  if (!isLoginAuthenticated({ email, password })) {
    const status = 401;
    let message = "Incorrect Email or Password";
    res.status(status).json({ status, message });
    return;
  }

  fs.readFile("./db.json", async (err, data) => {
    if (err) {
      const status = 401;
      const message = err;
      res.status(status).json({ status, message });
      return;
    }
    data = JSON.parse(data.toString());
    for (let i = 0; i < data.users.length; i++) {
      if (data.users[i].email === email) {
        profile = data.users[i];
      }
    }
    const access_token = createToken({ email, password });
    res.status(200).json({ message: "success", ...profile, access_token });
  });
});

server.post("/api/form/addexperience", (req, res) => {
  console.log(req.body);
  const {
    postedBy,
    companyName,
    mode,
    branch,
    cgpa,
    backlogs,
    rounds,
    platform,
    nQuestions,
    questions,
    tips,
  } = req.body;



  fs.readFile("./db.json", (err, data) => {
    if (err) {
      const status = 401;
      const message = err;
      res.status(status).json({ status, message });
      return;
    }
    data = JSON.parse(data.toString());

    data.expirenceList.push({
      postedBy,
      companyName,
      mode,
      branch,
      cgpa,
      backlogs,
      rounds,
      platform,
      nQuestions,
      questions,
      tips,
    });

    let writeData = fs.writeFile(
      "./db.json",
      JSON.stringify(data),
      (err, result) => {
        if (err) {
          const status = 401;
          const message = err;
          res.status(status).json({ status, message });
          return;
        }
      }
    );
  });
  res.status(200).json({ message: "Experience added successfully" });
});

server.post("/api/viewexperience",(req, res) => {
  fs.readFile("./db.json", (err, data) => {
    if (err) {
      const status = 401;
      const message = err;
      res.status(status).json({ status, message });
      return;
    }
    data = JSON.parse(data.toString());

    let expirenceList = data.expirenceList;
    res.status(200).json([...expirenceList])
})})



server.listen(5000, () => {
  console.log("Running fake api json server");
});