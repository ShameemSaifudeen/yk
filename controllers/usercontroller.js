const userhelpers = require('../helpers/userhelpers')
const user = require('../models/connection')
const otp = require('../otp/otp')
const ObjectId=require('mongodb').ObjectId
const adminHelper = require('../helpers/adminHelpers')


const client = require('twilio')(otp.accountId, otp.authToken)

let userSession, number, loggedUser,loggedUserId;
let count

module.exports = {

  getHome:async(req, res) => {
    userSession = req.session.userLoggedIn
    if(req.session.userLoggedIn){
     count=await userhelpers.getCartItemsCount(req.session.user.id)
     res.render('user/user', { userSession,count })
    }
    else{
      res.render('user/user', { userSession})
    }
  },
  getUserLogin: async(req, res) => {
    count=await userhelpers.getCartItemsCount(req.session.user.id)
    
    userSession = req.session.userLoggedIn

    res.render("user/user", { userSession,count });
  },
  getUserOtpLogin: (req, res) => {


    res.render("user/otplogin", { userSession });
  },
  postUserOtpLogin: async (req, res) => {
    console.log(req.body.number);

    number = req.body.number;
    let users = await user.user.find({ phonenumber: number }).exec()
    loggedUser = users
    console.log(users);
    if (users == false) {
      console.log("falsehi");
      res.redirect('/login')
    } else {
      client.verify.v2
        .services(otp.serviceId)
        .verifications.create({ to: `+91 ${number}`, channel: "sms" })
        .then((verification) =>
          console.log(verification.status))
        .then(() => {
          const readline = require("readline").createInterface({
            input: process.stdin,
            output: process.stdout,
          })

        })
      res.render('user/otp-entering')

    }




  },

  postOtpVerify: (req, res) => {
    console.log(req.body);
    otpNumber = req.body.otp

    client.verify.v2
      .services(otp.serviceId)
      .verificationChecks.create({ to: `+91 ${number}`, code: otpNumber })
      .then((verification_check) => {
        console.log(verification_check.status);
        console.log(verification_check);
        if (verification_check.valid == true) {
          req.session.user = loggedUser
          req.session.user.id=loggedUser._id
          loggedUserId=loggedUser._id
          console.log(loggedUser);
          console.log("otphi");
          req.session.userLoggedIn = true;
          userSession = req.session.userLoggedIn


          res.render('user/user', { userSession })


        } else {
          console.log("otpnothi");

          res.redirect('/otp_verify')
        }

      }
      )
  },
  getOtpVerify: (req, res) => {
    res.render("user/otp-entering")
  },

  postUserLogin: (req, res) => {
    userhelpers.doLogin(req.body).then((response) => {
      let loggedInStatus = response.loggedInStatus;
      let blockedStatus = response.blockedStatus;
      console.log(loggedInStatus);
      if (loggedInStatus == true) {
        req.session.user = response;
        req.session.userLoggedIn = true;
        userSession = req.session.userLoggedIn;
        res.redirect('/')

      } else {
        console.log(loggedInStatus);
        console.log(blockedStatus);

        blockedStatus
        res.render('user/login', { loggedInStatus, blockedStatus })
      }
    })

  },
  getSignUp: (req, res) => {

    res.render("user/signup");
  },
  postSignUp: (req, res) => {
    userhelpers.doSignUp(req.body).then((response) => {

      var emailStatus = response.emailStatus
      if (emailStatus == false) {

        res.redirect('/login')
      } else {

        res.render('user/signup', { emailStatus })
      }

    })
  },
  getShop: async(req, res) => {
    console.log(req.session.user.id);
    
    count=await userhelpers.getCartItemsCount(req.session.user.id)
    viewCategory=await adminHelper.viewAddCategory()

    userhelpers.shopListProduct().then((response) => {
      // console.log(response);
      res.render('user/shop', { response, userSession,count,viewCategory })
    })


  },

  getProductDetails: async(req, res) => {
    count=await userhelpers.getCartItemsCount(req.session.user.id)

    console.log(req.params.id);
    userhelpers.productDetails(req.params.id).then((data) => {
      console.log(data);
      res.render('user/eachproduct',{data,count})
    })
  },

  getAddToCart: (req, res) =>{
    console.log(req.params.id);
    console.log(req.session.user.id);

    userhelpers.addToCart(req.params.id,req.session.user.id).then((data)=>{
      console.log(data);
      res.json({status:true})
    })

  },



  getViewCart: async(req, res) =>{
    console.log(req);
let total=await userhelpers.totalCheckOutAmount(req.session.user.id)
    let count=await userhelpers.getCartItemsCount(req.session.user.id)

    let cartItems= await userhelpers.viewCart(req.session.user.id)
  
    res.render('user/view-cart',{cartItems,userSession,count,total})
   
  },
  postchangeProductQuantity:async(req,res)=>{
    // let count=await userhelpers.getCartItemsCount(req.session.user.id)
    console.log(req.body);
    await userhelpers.changeProductQuantity(req.body).then((response)=>{
      console.log("hhhhhhhhhhhhhhhhhhhh");
      console.log(response+"controllers");
      res.json(response)
      

    })

    
  },


  getDeleteCart:(req,res)=>{
    console.log(req.body);
userhelpers.deleteCart(req.body).then((response) => {
  res.json(response)
})
  }
,
getProceedToCheckOut:(req,res)=>{

},




  getLogout: (req, res) => {
    req.session.user = null;
    req.session.userLoggedIn = false

    res.redirect('/login');

  },

  // shopProduct:(req,res)=>{
  //   userhelpers.shopListProduct().then((response)=>{
  //     console.log(response);
  //     res.render('user/shop',{response})
  //   })

  // },
}