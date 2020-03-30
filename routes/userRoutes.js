const router = require("express").Router();
const { User } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");

/*-----------------------------------------------------------------------*/

//@route     POST api/register
//@desc      Register a user
//@access    Public
router.post(
  "/register",
  [
    check("name", "Please add name").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("username", "Please add a unique username").not().isEmpty(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, username, password } = req.body;
    try {
      let user = await User.findOne({ email });

      if (user) {
        return res.status(400).json({ msg: "User already exists" });
      }

      user = new User({
        name,
        email,
        username,
        password,
      });

      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const payload = {
        user: {
          id: user.id,
        },
      };
      jwt.sign(
        payload,
        "coderbooksecret",  //Must put in .env before deployment
        {
          expiresIn: 360000,  //Must switch to 3600 before deployment
        },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (e) {
      console.error(e.message);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;

/*-----------------------------------------------------------------------*/

//Route to register a new user with password
// router.post("/users/register", (req, res) => {
//   User.register(
//     new User({
//       firstName: req.body.firstName,
//       lastName: req.body.lastName,
//       username: req.body.username,
//       email: req.body.email,
//     }),
//     req.body.password,
//     (err) => {
//       if (err) throw err;
//       res.sendStatus(200);
//     }
//   );
// });

//Route to log in a user with password that returns: user from login
//isLoggedIn, postings, user, token
// router.post("/users/login", (req, res) => {
//   User.authenticate()(req.body.username, req.body.password, (err, user) => {
//     if (err) throw err;
//     res.json({
//       isLoggedIn: !!user,
//       firstName: user.firstName,
//       lastName: user.lastName,
//       email: user.email,
//       dateAccountCreated: user.dateAccountCreated,
//       postings: user.postings,
//       user: user.username,
//       token: jwt.sign({ id: user._id }, "coderbooksecretkey"),
//     });
//   });
// });
//
// module.exports = router;
