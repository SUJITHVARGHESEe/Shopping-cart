var express = require('express');
var router = express.Router();
var productHelpers = require('../helpers/product-helpers');


/* GET users listing. */
const verifyAdmin=(req,res,next)=>{
  if(req.session.admin){
    next()
  }else{
    res.render('admin/login')
  }
 }
router.get('/', function(req, res, next) {
  productHelpers.getAllproducts().then((products) => {
    console.log(products); 
    res.render('admin/view-products', {admin: true, products,adminname:req.session.admin});
  });
});
router.get('/adminlogin',(req,res)=>{
  res.render('admin/login',{admin:true})
  
})

 router.post('/adminlogin', (req, res) => {
  productHelpers.Login(req.body).then((response) => {
    let {name,email,Password}=req.body
    if(!name){
      req.session.loginErr="Fill the Name field"
      res.render('admin/login',{loginErr:req.session.loginErr})
      delete req.session.loginErr; // Delete the loginErr property after rendering the file
    }else{
    if (response.status) {
      req.session.admin = response.user
      req.session.admin.loggedIn=true
      console.log(req.session.admin)
      res.redirect('/admin/')
    } else {
      res.render('admin/login')
    }
  }
  })
})

router.get('/adminlogout',(req,res)=>{
 
  req.session.admin=null
  res.render('admin/login',{admin:true})
})
router.get('/add-product',verifyAdmin , (req, res) => {
  res.render('admin/add-product',{admin:true ,adminname:req.session.admin});
});

router.post('/add-product', (req, res) => {
  if (!req.files || !req.files.image) {
    let error = "Please upload an image";
    res.render('admin/add-product', {error});
  } else {
    let {name, category, price} = req.body;
    if (!name || !category || !price) {
      let error = "Please fill all the fields";
      res.render('admin/add-product', {error});
    } else {
      // console.log(req.body);
      // console.log(req.files.image);
      productHelpers.addProduct(req.body, (id) => {
        let image = req.files.image;
        image.mv('./public/product-images/' + id + '.jpg', (err, done) => {
          if (!err) {
            res.render('admin/add-product');
          } else {
            console.log(err);
            next(err);
          }
        });
      });
    }
  }
});

router.get('/delete-product/:id',verifyAdmin,(req,res)=>{
let proId=req.params.id
productHelpers.deleteProduct(proId).then((response)=>{
  res.redirect('/admin/')
})
})
router.get('/edit-product/:id',(req,res)=>{
  productHelpers.editProduct(req.params.id).then((product)=>{
    // console.log(product)
    res.render('admin/edit-product',{product,adminname:req.session.admin})
  })
    
   })  
   router.post('/edit-product/:id',(req,res)=>{
    productHelpers.updateProduct(req.body,req.params.id).then((responce)=>{
      res.redirect('/admin')
      let  id=req.params.id
    if(image=req.files?.image){
    image.mv('./public/product-images/'+id+'.jpg')
    }
    })
     })
module.exports = router;
