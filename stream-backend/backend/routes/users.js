require("dotenv").config()
const router = require("express").Router()

let User = require("../models/user.model")
require("dotenv").config()

const bcrypt = require("bcrypt")
//let DeleteUser = require("../models/delete_user.model")
const mongoose = require("mongoose")
const Token = require("../models/token.model")
const OTP = require("../models/otp.model")
const crypto = require("crypto")
const nodemailer = require("nodemailer")
const url = require("url")
const nodemail = process.env.EMAIL
const nodePass = process.env.EMAIL_PASS

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: nodemail,
    pass: nodePass,
  },
})
router.route("/dummy").get(async (req, res) => {
  var username = req.body.username
  console.log("username=" + username)
  await User.find({ username: username })
    .then((ress) => {
      console.log(ress[0].followers)
      res.json({ done: 1 })
    })
    .catch((err) => {
      console.log(err)
      res.json({ done: 0, error: 1 })
    })
})
router.route("/unfollow").post(async (req, res) => {
  const from_username = req.body.from_username
  const to_username = req.body.to_username
  const token = req.body.token
  const email = req.body.email
  var from_array = []
  var to_array = []
  var nfrom = 0
  var nto = 0
  var flag = true
  var flag1 = false
  await Token.find({ email: email }, { _id: 0 }).then((ress) => {
    if (ress[0].token == token) {
      flag1 = true
    } else {
      return res.json({ done: 0, auth: 1 })
    }
  })
  if (flag1) {
    await User.find({ username: from_username })
      .then((ress) => {
        if (ress.length == 0) {
          flag = false
          res.json({ from_username: 1, done: 0 })
        } else {
          from_array = ress[0].following
          nfrom = ress[0].nfollowing
        }
      })
      .catch((err) => {
        res.json({ done: 0, error: err })
      })
    await User.find({ username: to_username })
      .then((ress) => {
        if (ress.length == 0) {
          flag = false
          res.json({ to_username: 1, done: 0 })
        } else {
          to_array = ress[0].followers
          nto = ress[0].nfollowers
        }
      })
      .catch((err) => {
        res.json({ done: 0, error: err })
      })
    if (flag) {
      if (to_array.includes(from_username)) {
        nto -= 1
        nfrom -= 1
        from_array = from_array.filter(function (item) {
          return item !== to_username
        })
        to_array = to_array.filter(function (item) {
          return item !== from_username
        })
        await User.updateOne(
          { username: from_username },
          { $set: { nfollowing: nfrom, following: from_array } }
        )
          .then(async () => {
            await User.updateOne(
              { username: to_username },
              { $set: { nfollowers: nto, followers: to_array } }
            )
              .then(() => res.json({ done: 1 }))
              .catch((err) => res.json({ done: 1, err: err }))
          })
          .catch((err) => res.json({ done: 0, err: err }))
      } else res.json({ done: 0, nofollow: 1 })
    }
  }
})
router.route("/follow").post(async (req, res) => {
  const from_username = req.body.from_username
  const to_username = req.body.to_username
  const token = req.body.token
  const email = req.body.email
  var from_array = []
  var to_array = []
  var nfrom = 0
  var nto = 0
  var flag = true
  var flag1 = false
  await Token.find({ email: email }, { _id: 0 }).then((ress) => {
    if (ress[0].token == token) {
      flag1 = true
    } else {
      return res.json({ done: 0, auth: 1 })
    }
  })
  if (flag1) {
    await User.find({ username: from_username })
      .then((ress) => {
        if (ress.length == 0) {
          flag = false
          res.json({ from_username: 1, done: 0 })
        } else {
          from_array = ress[0].following
          nfrom = ress[0].nfollowing
        }
      })
      .catch((err) => {
        res.json({ done: 0, error: err })
      })
    await User.find({ username: to_username })
      .then((ress) => {
        if (ress.length == 0) {
          flag = false
          res.json({ to_username: 1, done: 0 })
        } else {
          to_array = ress[0].followers
          nto = ress[0].nfollowers
        }
      })
      .catch((err) => {
        res.json({ done: 0, error: err })
      })
    if (flag) {
      if (!to_array.includes(from_username)) {
        nfrom += 1
        nto += 1
        to_array.push(from_username)
        from_array.push(to_username)
        await User.updateOne(
          { username: from_username },
          { $set: { nfollowing: nfrom, following: from_array } }
        )
          .then(async () => {
            await User.updateOne(
              { username: to_username },
              { $set: { nfollowers: nto, followers: to_array } }
            )
              .then(() => res.json({ done: 1 }))
              .catch((err) => res.json({ done: 1, err: err }))
          })
          .catch((err) => res.json({ done: 0, err: err }))
      } else res.json({ done: 0, already: 1 })
    }
    to_array = []
    from_array = []
  }
})
router.route("/show").get(async (req, res) => {
  var email = req.query.email
  await User.find({ email: email })
    .then((users) => res.json(users))
    .catch((err) => res.status(400).json("Error: " + err))
})
router.route("/").get((req, res) => {
  User.find()
    .then((users) => res.json(users))
    .catch((err) => res.status(400).json("Error: " + err))
})
router.route("/check/duplicate").post(async (req, res) => {
  const email = req.body.email
  const username = req.body.username
  await OTP.deleteMany({ email: email })
  var flag = true
  await User.find({ email: email })
    .then((ress) => {
      if (ress.length > 0) {
        flag = false
        res.json({ email: 1, done: 0 })
      }
    })
    .catch((err) => {
      res.json({ done: 0, error: err })
    })

  await User.find({ username: username })
    .then((ress) => {
      if (ress.length > 0) {
        flag = false
        res.json({ username: 1, done: 0 })
      }
    })
    .catch((err) => {
      res.json({ done: 0, error: err })
    })

  if (flag) {
    const rand = crypto.randomBytes(6).toString("hex")
    const hashedPassword = await bcrypt.hash(rand, 10)
    const newOTP = new OTP({ email: email, password: hashedPassword })
    console.log(newOTP)
    await newOTP
      .save()
      .then(() => {
        var mailOptions = {
          from: nodemail,
          to: email,
          subject: "Hotel Atlantis - OTP",
          html:
            "This is your OTP : " +
            rand +
            "<br/><br/>Regards,<br/>Hotel Atlantis",
        }
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error)
          } else {
            console.log("Email sent: " + info.response)
          }
        })
        res.json({ done: 1 })
      })
      .catch((err) => res.json({ done: 0, error: err }))
  }
})
router.route("/pass/forgot").post(async (req, res) => {
  const email = req.body.email
  const randomPassword = crypto.randomBytes(5).toString("hex")
  const hashedPassword = await bcrypt.hash(randomPassword, 10)
  console.log("email = " + email)
  await User.find({ email: email }, { _id: 0 })
    .then(async (response) => {
      if (response.length > 0) {
        await User.updateOne(
          { email: email },
          { $set: { password: hashedPassword } }
        )
          .then(() => {
            var mailOptions = {
              from: nodemail,
              to: email,
              subject: "Hotel Atlantis - Forgot Password",
              html:
                "Use this password and change your password after successful login <br/>" +
                randomPassword.toString(),
            }
            transporter.sendMail(mailOptions, function (error, info) {
              if (error) {
                console.log(error)
              } else {
                console.log("Email sent: " + info.response)
              }
            })
            res.json({ done: 1 })
          })
          .catch((err) => {
            console.log(err)
            res.json({ error: 1, done: 0 })
          })
      } else {
        res.json({ notExist: 1, done: 0 })
      }
    })
    .catch((err) => {
      console.log(err)
      res.json({ error: 1, done: 0 })
    })
})
router.route("/pass/change/").post(async (req, res) => {
  const email = req.body.email
  const token = req.body.token
  const pass = req.body.password

  var flag1 = false
  await Token.find({ email: email }, { _id: 0 }).then(async (ress) => {
    if (ress[0].token == token) {
      flag1 = true
    } else {
      res.json({ done: 0 })
    }
  })
  if (flag1) {
    const hashedPassword = await bcrypt.hash(pass, 10)
    User.updateOne({ email: email }, { $set: { password: hashedPassword } })
      .then(() => {
        var mailOptions = {
          from: nodemail,
          to: email,
          subject: "Hotel Atlantis - Password Change",
          html: "Password Change Successful",
        }
        console.log("here")
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error)
          } else {
            console.log("Email sent: " + info.response)
          }
        })
        res.json({ done: 1 })
      })
      .catch(() => res.json({ done: 0 }))
  }
})
router.route("/delete/email/").get((req, res) => {
  const adr = "http://localhost:4000" + req.url.toString()
  const q = url.parse(adr, true)
  const key = q.query.key
  const email = q.query.email

  var flag = true
  DeleteUser.find({ email: email }, { _id: 0 })
    .then((ress) => {
      if (ress.length > 0 && ress[0].key != key) {
        flag = false
      }
    })
    .catch((err) => {
      console.log(err)
      alert(err)
      flag = false
    })

  User.deleteOne({ email: email })
    .then((ress) => {
      DeleteUser.deleteOne({ email: email }).then(() => {
        Token.deleteMany({ email: email })
          .then(() => {
            res.sendFile(process.cwd() + "/Success.html")
          })
          .catch(() => {
            res.sendFile(process.cwd() + "/Failure.html")
          })
      })

      console.log("done")
    })
    .catch((err) => {
      console.log(err)
      alert(err)
      flag = false
    })
  if (!flag) res.sendFile(process.cwd() + "/Failure.html")
})
/*
app.post("/verify/refresh/", (req, res) => {
  if (req.body.token) {
    Refresh.find({ token: req.body.token }, { _id: 0 })
      .then((tokens) => {
        if (tokens.length > 0) res.json({ logged: true })
        else res.json({ logged: false })
      })
      .catch(() => res.sendStatus(500))
  } else res.json({ logged: false })
})
app.get("/", (req, res) => {
  User.find()
    .then((users) => res.json(users))
    .catch((err) => res.status(400).json("Error: " + err))
})
*/
router.route("/login").post(async (req, res) => {
  const email = req.body.email
  await User.find({ email: email }, { password: 1, _id: 0 })
    .then(async (passwordRaw) => {
      var flag = true
      if (passwordRaw.length == 0) {
        flag = false
        res.json({ isAllowed: false })
      }
      if (flag) {
        const hashedPassword = passwordRaw[0].password
        const requestedPassword = req.body.password
        try {
          if (await bcrypt.compare(requestedPassword, hashedPassword)) {
            const id = crypto.randomBytes(20).toString("hex")
            const newToken = new Token({ token: id, email: email })
            await Token.deleteOne({ email: email })
              .then(async () => {
                await newToken
                  .save()
                  .then(() => {
                    res.json({
                      isAllowed: true,
                      token: id,
                    })
                  })
                  .catch(() => {
                    res.json({ isAllowed: false })
                  })
              })
              .catch(() => {
                res.json({ isAllsowed: false })
              })
          } else {
            console.log("not allowed / in else")
            res.json({ isAllowed: false })
          }
        } catch (err) {
          console.log(err)
          res.sendStatus(500)
        }
      }
    })
    .catch((err) => {
      console.log("not found " + err)
      res.json({ isAllowed: false })
    })
})

router.route("/signup").post(async (req, res) => {
  const email = req.body.email
  const firstName = req.body.firstName
  const lastName = req.body.lastName
  const password = req.body.password
  const username = req.body.username
  const following = req.body.following
  const followers = req.body.followers
  const nfollowing = req.body.nfollowing
  const nfollowers = req.body.nfollowers
  const otp = req.body.otp
  console.log(email)
  console.log(otp)
  var f = true
  OTP.find({ email: email })
    .then(async (ress) => {
      if (ress.length == 0) {
        res.json({ done: 0, invalid: 1 })
        f = false
      } else {
        const hashedPassword = ress[0].password
        if (await bcrypt.compare(otp, hashedPassword))
          await OTP.deleteMany({ email: email })
            .then(() => {
              console.log("done")
            })
            .catch(() => (f = false))
        else {
          f = false
          res.json({ done: 0, error: 1 })
        }
      }
    })
    .catch(() => {
      f = false
    })
  console.log(true)
  if (f) {
    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = new User({
      email: email,
      firstName: firstName,
      lastName: lastName,
      password: hashedPassword,
      username: username,
      following: following,
      followers: followers,
      nfollowing: nfollowing,
      nfollowers: nfollowers,
    })

    await newUser
      .save()
      .then(async () => {
        console.log("saved the user")
        res.json({ done: 1 })
      })
      .catch((err) => {
        console.log(err)
        res.json({ done: 0 })
      })
  }
})
router.route("/logout").post(async (req, res) => {
  var email = req.body.email
  console.log("made it here")
  await Token.deleteOne({ email: email })
    .then(() => {
      res.json({ done: 1 })
    })
    .catch(() => res.json({ done: 0 }))
})

module.exports = router
