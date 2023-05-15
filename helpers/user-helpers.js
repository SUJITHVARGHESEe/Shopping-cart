var db = require('../connection/connection')
var collection = require('../collection/constans')
const bcrypt = require('bcrypt')
const { ObjectId} = require('mongodb')
const productHelpers = require('./product-helpers')


module.exports = {
    doSignup: (userData) => {

        return new Promise(async (resolve, reject) => {
            let Data = {}
            if (userData.name && userData.Password && userData.email) {

                console.log(userData)
                userData.Password = await bcrypt.hash(userData.Password, 10)
                db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                    resolve(data.insertedId)


                })
            }
            else {
                resolve(Data.err)
            }
        })

    },

    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
            if (user) {
                bcrypt.compare(userData.Password, user.Password).then((status) => {
                    if (status) {
                        response.user = user
                        response.status = true
                        resolve(response)
                        console.log('login succes')
                    }
                    else {
                        response.Error = "Incorrect password or Email"
                        response.status = false
                        resolve(response)
                        console.log("login failed");

                    }
                })
            }
            else {
                response.status = false
                resolve(response)
                console.log("login failed");
            }
        })
    },
    addToCart: (proId, userId) => {
        let proObject = {
            item: new ObjectId(proId),
            quantity: 1,

        };
        let data = {}
        return new Promise(async (resolve, reject) => {
            if (userId && proId) {
                let userCart = await db
                    .get()
                    .collection(collection.CART_COLLECTION)
                    .findOne({ user: new ObjectId(userId) });
                if (userCart) {
                    let proExist = userCart.product.findIndex(
                        (product) => product.item == proId
                    );
                    if (proExist != -1) {
                        db.get()
                            .collection(collection.CART_COLLECTION)
                            .updateOne(

                                { user: new ObjectId(userId), 'product.item': new ObjectId(proId) },
                                {
                                    $inc: { "product.$.quantity": 1 },
                                }
                            )
                            .then(() => {
                                resolve();
                            });
                    }
                    else {
                        db.get()
                            .collection(collection.CART_COLLECTION)
                            .updateOne(
                                { user: new ObjectId(userId) },
                                {
                                    $push: { product: proObject },
                                }
                            )
                            .then((response) => {
                                resolve();
                            })
                            .catch((err) => {
                                return reject(err);
                            });
                    }
                } else {
                    let cartObj = {
                        user: new ObjectId(userId),
                        product: [proObject],
                    };
                    console.log(cartObj);

                    db.get()
                        .collection(collection.CART_COLLECTION)
                        .insertOne(cartObj)
                        .then(() => {
                            resolve();
                        })
                        .catch((err) => {
                            reject(err);
                        });
                }
            } else {
                resolve(data.Err = "")
            }
        });
    },
    getCartProducts: (userid) => {
        return new Promise(async (resolve, reject) => {
            let cartitems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: new ObjectId(userid) }
                },
                {
                    $unwind: '$product'
                },
                {
                    $project: {
                        item: '$product.item',
                        quantity: '$product.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: "product"
                    }
                }, {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                

            ]).toArray()
        
            resolve(cartitems)
        })
    },

    getCartcount: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let count = 0;
                let cart = await db
                    .get()
                    .collection(collection.CART_COLLECTION)
                    .findOne({ user: new ObjectId(userId) });
                if (cart) {
                    cart.product.forEach((product) => {
                        count += product.quantity;
                    });
                }
                resolve(count);
            } catch (error) {
                reject(error);
            }
        });
    },changeProductQuantity: (details) => {
        details.count = parseInt(details.count);
        details.quantity = parseInt(details.quantity);
    
        return new Promise((resolve, reject) => {
            if (details.count === -1 && details.quantity === 1) {
                db.get().collection(collection.CART_COLLECTION).updateOne({ _id:new  ObjectId(details.cart) },
                    {
                        $pull: { product: { item:new ObjectId(details.product) } }
                    }
                ).then((response) => {
                    resolve({ removeProduct: true });
                }).catch((error) => {
                    reject(error);
                });
            } else {
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: new ObjectId(details.cart), 'product.item': new ObjectId(details.product) },
                        {
                            $inc: { 'product.$.quantity': details.count }
                        }
                    ).then((response) => {
                        resolve({status:true});
                    }).catch((error) => {
                        reject(error);
                    });
            }
        });
    },
    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
          let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
            {
              $match: { user: new ObjectId(userId) }
            },
            {
              $unwind: '$product'
            },
            {
              $project: {
                item: '$product.item',
                quantity: { $toDouble: '$product.quantity' }
              }
            },
            {
              $lookup: {
                from: collection.PRODUCT_COLLECTION,
                localField: 'item',
                foreignField: '_id',
                as: "product"
              }
            }, {
              $project: {
                item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
              }
            },
            {
              $project: {
                item: 1, quantity: 1, product: 1,
                total: { $multiply: [{ $toDouble: '$quantity' }, { $toDouble: '$product.price' }] }
              }
            },
            {
              $group: { _id: null, total: { $sum: '$total' } }
            }
          ]).toArray();
          
          if (total.length > 0 && total[0].total) {
            resolve(total[0].total);
          } else {
            resolve(0);
          }
        });
      }
      ,
      getCartProductList: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: new ObjectId(userId) })
            if (cart) {
                resolve(cart.product)
            } else {
                resolve([])
            }
        })
    },
    
      
    placeOrder:(order,products,totalprice)=>{
return new Promise((resolve,reject)=>{
let status =order['payment-method'] ==='COD'?"placed":'pending'
let orderObj={
    deliveryDetails:{
        mobile:order.mobile,
        address:order.address,
        pincode:order.pincode
    },
    userId:new ObjectId(order.userId),
    paymentMethod:order['payment-method'],
    products:products,
    totalprice:totalprice,
    status:status
}
db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
    db.get().collection(collection.CART_COLLECTION).deleteOne({user: new ObjectId(order.userId)})
    resolve(response)
})

})
    },


    getUserOrder:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let orders =await db.get().collection(collection.ORDER_COLLECTION).find({userId: new ObjectId(userId)}).toArray()
            resolve(orders)
        })
    },
    getOrderProducts:(orderId)=>{
        
        return new Promise(async (resolve, reject) => {
            let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: new ObjectId(orderId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: "product"
                    }
                }, {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                

            ]).toArray()
        console.log(orderItems)
            resolve(orderItems)
        })
    }
    
}