const userhelpers = require('../helpers/userhelpers')
const user = require('../models/connection')
const otp = require('../thirdparty/otp')
const ObjectId = require('mongodb').ObjectId
const adminHelper = require('../helpers/adminHelpers')


const client = require('twilio')(otp.accountId, otp.authToken)

let userSession, number, loggedUser, loggedUserId, homeList;
let count, numberStatus, otpStatus


module.exports = {

  getHome: async (req, res) => {
    userSession = req.session.userLoggedIn
    if (req.session.userLoggedIn) {
      count = await userhelpers.getCartItemsCount(req.session.user.id)
      homeList = await userhelpers.shopListProduct()
      res.render('user/user', { userSession, count, homeList })
    }
    else {
      homeList = await userhelpers.shopListProduct()

      res.render('user/user', { userSession, homeList })
    }
  },
  getUserLogin: async (req, res) => {
    count = await userhelpers.getCartItemsCount(req.session.user.id)

    userSession = req.session.userLoggedIn

    res.render("user/user", { userSession, count, homeList });
  },
  getUserOtpLogin: (req, res) => {

    numberStatus = true
    res.render("user/otplogin", { userSession, numberStatus });
  },
  postUserOtpLogin: async (req, res) => {
    console.log(req.body.number);

    number = req.body.number;
    let users = await user.user.find({ phonenumber: number }).exec()
    console.log(users._id + "itshere");

    loggedUser = users

    if (users == false) {
      console.log("falsehi");
      numberStatus = false
      res.render("user/otplogin", { userSession, numberStatus })
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
      otpStatus = true
      res.render('user/otp-entering', { otpStatus })

    }




  },

  postOtpVerify: (req, res) => {

    otpNumber = req.body.otp



    client.verify.v2
      .services(otp.serviceId)
      .verificationChecks.create({ to: `+91 ${number}`, code: otpNumber })
      .then((verification_check) => {
        console.log(verification_check.status);
        console.log(verification_check);
        if (verification_check.valid == true) {
          console.log("hellllllllllllllllo");
          console.log(loggedUser);
          console.log(ObjectId(loggedUser[0]._id));

          let id = loggedUser[0]._id

          req.session.user = { loggedUser, id }

          console.log(loggedUser);
          console.log("otphi");
          req.session.userLoggedIn = true;
          userSession = req.session.userLoggedIn


          res.redirect('/')


        } else {
          console.log("otpnothi");
          otpStatus = false
          res.render('user/otp-entering', { otpStatus })
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
  getShop: async (req, res) => {
    console.log(req.query.page+"_______________________________________________________");
    let pageNum=req.query.page 
    let currentPage=pageNum
    let perPage=6
    console.log(req.session.user.id);

    count = await userhelpers.getCartItemsCount(req.session.user.id)
    viewCategory = await adminHelper.viewAddCategory()
    documentCount=  await userhelpers.documentCount()
    console.log(documentCount+"ppppppppppppp");
    let pages=Math.ceil(parseInt(documentCount) /perPage)
    console.log(pages+"!!!!!!!!!!!");

    userhelpers.shopListProduct(pageNum).then((response) => {
      console.log(response);
      
      res.render('user/shop', { response, userSession, count, viewCategory ,currentPage,documentCount,pages})
    })


  },

  getProductDetails: async (req, res) => {
    count = await userhelpers.getCartItemsCount(req.session.user.id)

    console.log(req.params.id);
    userhelpers.productDetails(req.params.id).then((data) => {
      console.log(data);
      res.render('user/eachproduct', { userSession, data, count })
    })
  },

  getAddToCart: (req, res) => {
    console.log(req.params.id);
    console.log(req.session.user.id);

    userhelpers.addToCart(req.params.id, req.session.user.id).then((data) => {
      console.log(data);
      res.json({ status: true })
    })

  },



  getViewCart: async (req, res) => {
    // console.log(req);
    let userId = req.session.user
    let total = await userhelpers.totalCheckOutAmount(req.session.user.id)
    let count = await userhelpers.getCartItemsCount(req.session.user.id)

    let cartItems = await userhelpers.viewCart(req.session.user.id)
    // console.log(cartItems);

    res.render('user/view-cart', { cartItems, userId, userSession, count, total })

  },
  postchangeProductQuantity: async (req, res) => {
    // let count=await userhelpers.getCartItemsCount(req.session.user.id)
    // console.log(req.body);
    await userhelpers.changeProductQuantity(req.body).then(async (response) => {
      console.log("hhhhhhhhhhhhhhhhhhhh");
      console.log(response + "controllers");
      response.total = await userhelpers.totalCheckOutAmount(req.body.user)

      res.json(response)


    })


  },


  getDeleteCart: (req, res) => {
    console.log(req.body);
    userhelpers.deleteCart(req.body).then((response) => {
      res.json(response)
    })
  }
  ,
  checkOutPage:async (req, res) => {
    
    let users = req.session.user.id
    
   
      let cartItems =  await userhelpers.viewCart(req.session.user.id)
      console.log(cartItems);
      let total = await userhelpers.totalCheckOutAmount(req.session.user.id)
      userhelpers.checkOutpage(req.session.user.id).then((response)=>{
      

        res.render('user/checkout',{users,cartItems,total,response})
  })

},
postcheckOutPage:async (req, res) => {

  
 let total = await userhelpers.totalCheckOutAmount(req.session.user.id)
let order= await userhelpers.placeOrder(req.body, total).then((response) => {
          
        
         

   if (req.body['payment-method'] == 'COD') {
     res.json({ codstatus: true })

   } else {
     userhelpers.generateRazorpay(req.session.user.id, total).then((order) => {
       console.log(order.id);

       console.log(order.amount);
       res.json(order)

     })
   }
 })


},
postVerifyPayment: (req, res) => {
  console.log(req.body);
  userhelpers.verifyPayment(req.body).then(()=>{
    console.log(req.body);
   
    userhelpers.changePaymentStatus(req.session.user.id,req.body['order[receipt]']).then(()=>{

      res.json({status:true})

    }).catch((err)=>{
 console.log(err);
 res.json({status:false ,err})
    })

  })

  
},
getOrderPage: (req, res) => {
  userhelpers.orderPage(req.session.user.id).then((response) => {

    res.render('user/orderslist',{response})
  })

},



getAddresspage: async (req, res) => {

   
  console.log(req.session.user.id);



  res.render('user/add-address')

},
postAddresspage:  (req, res) => {
         
    
  userhelpers.postAddress(req.session.user.id,req.body).then(()=>{

  
    res.redirect('/check_out')
  })

},


  getLogout: (req, res) => {
    req.session.user = null;
    req.session.userLoggedIn = false

    res.redirect('/login');

  },

}