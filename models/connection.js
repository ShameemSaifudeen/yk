const mongoose = require("mongoose");
const { MessagingConfigurationInstance } = require("twilio/lib/rest/verify/v2/service/messagingConfiguration");
const db =mongoose 
 .connect("mongodb://0.0.0.0:27017/ecommerce", {
        useNewUrlParser: true,
        useUnifiedTopology: true })   
 .then(() => console.log("Database connected!"))
 .catch(err => console.log(err));





const userschema= new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
      },
      Password: {
        type: String,
        required: true,
        // minlength: 5,
        
      },
      email: {
        type: String,
        required: true,
        unique: true,
      },
      phonenumber:{
        type:Number,
        // minlength:10,
        unique:true,
      },
      blocked:{
        type:Boolean,default:false
    },
   CreatedAt:{
     type:Date,
     deafault:Date.now,
   },
})


const categorySchema = new mongoose.Schema({
  categoryName:{
    type:String,
    required: true,
  

  }
})

const productSchema=new mongoose.Schema({
  Productname:{
    type:String
  },
  ProductDescription:{
    type:String
  },
  Quantity:{
    type:Number
  },
  Image:{
    type:String,
   

  },
  Price:{
type:Number
  },
  category:{
    type:String
  }
  

})
const cartSchema = new mongoose.Schema(
  {
    user:{
      type:mongoose.Schema.Types.ObjectId,
      ref: 'user'
    },

    cartItems:[
      {
        productId:{type: mongoose.Schema.Types.ObjectId, ref: 'product'},
        Quantity:{type:Number, default:1},
        Price:{type:Number}
      }
    ],

  }
)
const addressSchema=new  mongoose.Schema({

    
  userid:{
    type:mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  Address:[
    {
      fname:{type:String},
      lname:{type:String},
      street:{type:String},
      apartment:{type:String},
      city:{type:String},
      state:{type:String},
      pincode:{type:Number},
      mobile:{type:Number},
      email:{type:String}
    }
  ]


})
const orderSchema = new mongoose.Schema({

  userid:{
    type:mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  orders: [{
  
      
          name:String,
          productDetails:Array,
          paymentMethod: String,
          paymentStatus: String,
          totalPrice: Number,
          totalQuantity: Number,
          shippingAddress: Object,
          paymentmode:String,
          status: {
              type: Boolean,
              default: true
          },
          createdAt: {
              type: Date,
              default: new Date()
          }
      }
  ]
})


//  module.exports=db
 
 

 module.exports={
  user:mongoose.model('user',userschema),
  categories:mongoose.model('categories',categorySchema),
  product:mongoose.model('product',productSchema),
  cart:mongoose.model('cart',cartSchema),
  order:mongoose.model('order',orderSchema),
  address:mongoose.model('address',addressSchema)
  
 }

