var express = require('express');
var router = express.Router();
var productHelpers=require('../helpers/product-helpers')
var userHelpers=require('../helpers/user-helpers');
const nocache = require('nocache');


const verifyLogin = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    if (req.xhr) {
      res.status(401).json({ error: "Please log in to continue." });
    } else {
      res.redirect("/login");
    }
  }
};

/* GET home page. */
router.get('/',async function(req, res, next) {
  
 let user =req.session.user
 let cartCount=null
 if(req.session.user){
  cartCount=await userHelpers.getCartcount(req.session.user._id)}

  productHelpers.getAllproducts().then((products)=>{

    
  res.render('user/view-products',{admin:false,products,user,cartCount})
  
  })
});
router.get('/login',nocache(),(req,res)=>{
  if (req.session.user){
    res.redirect('/')
  }else{
   
    res.render('user/login',{err:req.session.userloginErr})
    req.session.userloginErr=null
 
  }
})
router.get('/signup',(req,res)=>{

  res.render('user/signup',{signErr:req.session.signupErr})
  req.session.signupErr=null
})

router.post('/signup',(req,res)=>{
userHelpers.doSignup(req.body).then((response)=>{
 if(response){
  console.log(response)
  res.render('user/login')
 } 
 else{
  req.session.signupErr="Must fill all input field"
  
  res.redirect('/signup') 
 }
})
})
router.post('/login',(req,res)=>{
userHelpers.doLogin(req.body).then((response)=>{
  let {email,Password}=req.body
  if(!email || !Password){
    res.redirect('/login')
  }else{
  if(response.status){
    
    req.session.user=response.user
    req.session.user.loggedIn=true
res.redirect('/')
  }
else{
 req.session.userloginErr="invalid username or password"

  res.redirect('/login')
}
}
})
})

router.get('/logout',(req,res)=>{
  req.session.user=null
  res.redirect('/')
})

router.get('/cart', verifyLogin, async (req, res) => {
  let products = await userHelpers.getCartProducts(req.session.user._id)
  if(products.length===0){
    res.render('user/cart-empty')
  }else{
  
 
   let total=await userHelpers.getTotalAmount(req.session.user._id)
   if(total.length>0){
  }
  res.render('user/cart', { products, user: req.session.user,total })
  
}
})

router.get('/add-to-cart/:id',verifyLogin, (req, res) => {
  userHelpers.addToCart(req.params.id, req.session.user._id).then((response) => {
    res.json({ status: true })
  })
})

router.post("/change-product-quantity", async(req, res, next) => {
  userHelpers.changeProductQuantity(req.body).then(async(response) => {
   response.total=await userHelpers.getTotalAmount(req.body.user)
   if (response.total !== undefined && response.total !== null) {
    // Do something with the total value
    console.log("Total value:", response.total);
  } else {
    console.log("Total value is undefined or null.");
  }
  
      res.json(response);
  });
})


router.get('/place-order', verifyLogin, async(req, res) => {


 total=await userHelpers.getTotalAmount(req.session.user._id)

    res.render('user/place-order',{total,user:req.session.user})

});

router.post('/place-order', async(req,res)=>{
  let products=await userHelpers.getCartProductList(req.body.userId)
  let totalprice=await userHelpers.getTotalAmount(req.body.userId)
  if(products.length===0){
    res.render('user/place-order', {user: req.session.user, orderErr: 'Your cart is empty.'})
  }else{
    userHelpers.placeOrder(req.body,products,totalprice).then((response)=>{
      res.json({status:true})
    })
  }
})


router.get('/order-success',(req,res)=>{
  res.render('user/order-success',{user:req.session.user})
})
router.get('/order',verifyLogin,async(req,res)=>{
  let orders=await userHelpers.getUserOrder(req.session.user._id)
  res.render('user/orders',{user:req.session.user,orders})
})
router.get('/view-order-products/:id',verifyLogin,async(req,res)=>{
  let products=await userHelpers.getOrderProducts(req.params.id)
  console.log(req.params.id)
  console.log(products)
  res.render('user/view-order-products',{user:req.session.user,products})
})

module.exports = router;
