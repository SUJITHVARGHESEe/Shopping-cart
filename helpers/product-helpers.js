var db=require('../connection/connection')
var collection=require('../collection/constans')
module.exports={
    addProduct:(product,callback)=>{
        db.get().collection('product').insertOne(product).then((data)=>{
callback(data.insertedId)
        })
    },
    getAllproducts:()=>{
        return new Promise(async(resovle,reject)=>{
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray().then((product)=>{
                resovle(product)
            })
        })
    }
}