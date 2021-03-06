require("dotenv").config();
const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const { OAuth2Client } = require("google-auth-library");
const User = require("./db/User");
const Paths = require("./db/Path");

/**
 * Google OAuth Client
 */
const app = express();
const port = process.env.PORT || 3001;
const googleOAuthClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * Handles CORS config
 * Need to specify the remote origin, see: https://stackoverflow.com/questions/63251837/express-session-cookie-not-being-set-when-using-react-axios-post-request
 */
app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));

/**
 * Manages session information stored in Cookie
 */
app.enable("trust proxy");
app.use(
  cookieSession({
    name: "the-rift-session",
    secret: process.env.SESSION_SECRET,
    maxAge: 24 * 60 * 60 * 1000 * 60, // 60 days
    httpOnly: true,
    secureProxy: true,
  })
);

/**
 * Ensures a user is authenticated
 * This middleware can be used in specific routes
 */
const isAuthenticated = async (req, _res, next) => {
  const currentUser = await User.findById(req.session.userId);
  if (currentUser) {
    req.currentUser = currentUser;
    next();
  } else {
    next(new Error(`You're not logged in!`));
  }
};

app.get("/", (req, res) => {
  res.send("hallo");
});

/**
 * If the user is authenticated, it returns their user profile.
 */
app.get("/me", isAuthenticated, (req, res) => {
  res.status(200).json(req.currentUser);
});

app.get("/return", async (req, res) => {
  const {
    query: { input },
  } = req;
  const regexp = new RegExp("^" + input, "i");
  const results = await Paths.find({ id: regexp });
  res.status(200).json(results);
});

app.post("/new", async (req, res) => {
  const {
    body: { name, age },
  } = req;
  const NewPath = new Paths({ id, content, creator, nsfw, links });
  await NewPath.save();
  res.status(200).json(NewPath);
});

/**
 * Logs the user in or creates them an account
 * Sets the session information for subsequent requests
 */
app.post("/authenticate", async (req, res) => {
  const {
    body: { token },
  } = req;

  const ticket = await googleOAuthClient.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const { email, picture, given_name, family_name } = ticket.getPayload();

  // Finds a user or creates one
  const user =
    (await User.findOne({ email })) ||
    (await new User({
      firstname: given_name,
      lastname: family_name,
      email,
      avatar: picture,
    }).save());

  // Sets the userId on the session
  req.session.userId = user._id;
  res.status(200).json(user);
});

/**
 * Starts the server
 */
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
