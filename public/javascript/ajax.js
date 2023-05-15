
  function addCart(proid) {
  $.ajax({
    url: "/add-to-cart/" + proid,
    method: 'get',
    success: (response) => {
      if (response.status) {
        let count = $('#cart-count').html()
        count = parseInt(count) + 1
        $('#cart-count').html(count)
      }
    }
  })
}



function changeQuantity(cartId, productId, userId, count) {
  console.log("fjisiisisisi",userId)
  let quantity = parseInt(document.getElementById(productId).innerHTML)
  count = parseInt(count)
  $.ajax({
      url: '/change-product-quantity',
      data: {
          cart: cartId,
          product: productId,
          user: userId,
          count: count,
          quantity: quantity
      },
      method: 'post',
      success: (response) => {
          if (response.removeProduct) {
              alert('product removed from cart')
              location.reload()
          }
          else {
            document.getElementById(productId).innerHTML = quantity + count;
            document.getElementById('total').innerHTML = response.total
            



              
          }
      }
  })
}

// place order.hbs file 

$('#checkout-form').submit((e) => {
  e.preventDefault()
  $.ajax({
      url: '/place-order',
      method: 'post',
      data: $('#checkout-form').serialize(),
      success: (response) => {
       
          if (response.status) {
           
            location.href = '/order-success'
          }else{
            location.reload()
          }
          
      }
  })
})