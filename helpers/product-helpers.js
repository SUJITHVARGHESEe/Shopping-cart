var db=require('../connection/connection')
var collection=require('../collection/constans')

var ObjectId=require('mongodb').ObjectId
const fs =require('fs')
module.exports={
    addProduct:(product,callback)=>{
        db.get().collection('product').insertOne(product).then((data)=>{
callback(data.insertedId)
        })
    },
    Login:(admindetails)=>{
        
        return new Promise((resolve,reject)=>{
          let response={}

if(admindetails.name && admindetails.email==="name@gmail.com" && admindetails.Password==='11'){
    response.user=admindetails.name
   response.status=true
   console.log("djjds",response.user)
   console.log("login success")
   resolve(response)
}else{
    response.status=false
    console.log("login failed")
   resolve(response)
}
        })
    },
    getAllproducts:()=>{
        return new Promise(async(resovle,reject)=>{
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray().then((product)=>{
                resovle(product)
            })
        })
    },
    deleteProduct:(proId)=>{
        return new Promise((resolve ,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:new ObjectId(proId)}).then((response)=>{
                fs.unlink('./public/product-images/' + proId + '.jpg',(err)=>{
                    if(err){
                        reject(err)
                    }else{
                        resolve(response)
                    }
                })
               
            })
        })
    },
    editProduct:(proid)=>{
        return new Promise(async(resolve,reject)=>{
           let  product= await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:new ObjectId(proid)}).then((product)=>{
            resolve(product)
           })
        })
         },
         updateProduct:(prodetails,proid)=>{
            return new Promise((resolve,reject)=>{
                product=db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:new ObjectId(proid)},
                {
                    $set:{name:prodetails.name,
                    category:prodetails.category,
                price:prodetails.price}
        
                }).then((responce)=>{
                    resolve(responce)
                })
            })
        
         }
}