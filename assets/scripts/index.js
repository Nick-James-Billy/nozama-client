'use strict';

// user require with a reference to bundle the file and use it in this file
// var example = require('./example');

// use require without a reference to ensure a file is bundled
require('./example');

const myApp = {
  BASE_URL: "http://localhost:3000"
};

//Account AJAX requests

//Makes Sign In AJAX request
//called by clicking sign-in button OR successfully signing up
let signIn = function(e){
  e.preventDefault();
  var formData = new FormData(e.target);
  $.ajax({
    url: myApp.BASE_URL + '/sign-in',
    method: 'POST',
    contentType: false,
    processData: false,
    data: formData,
  }).done(function(data) {
    // console.log(data);
    myApp.user = data.user;
    // console.log(myApp.user);
    $('.signed-out').hide();
    $('.signed-in').show();
    $('#sign-in-modal').modal('hide');
    setCart();
  }).fail(function(jqxhr) {
    console.error(jqxhr);
  });
};

let setSignUpListener = function(){
  //Create new user
  $('#sign-up').on('submit', function(e) {
    e.preventDefault();
    var formData = new FormData(e.target);
    $.ajax({
      url: myApp.BASE_URL + '/sign-up',
      method: 'POST',
      contentType: false,
      processData: false,
      data: formData,
    }).done(function(data) {
      // console.log(data);
      signIn(e);
      $('#sign-up-modal').modal('hide');
    }).fail(function(jqxhr) {
      console.error(jqxhr);
    });
  });
};

let setSignInListener = function(){
  //Login as existing user
  $('#sign-in').on('submit', function(e) {
    e.preventDefault();
    signIn(e);
  });
};

let setChangePasswordListener = function(){
  //Change password of currently logged-in user
  $('#change-password').on('submit', function(e) {
    e.preventDefault();
    var formData = new FormData(e.target);
    $.ajax({
      url: myApp.BASE_URL + '/change-password/' + myApp.user._id,
      method: 'PATCH',
      headers: {
        Authorization: 'Token token=' + myApp.user.token,
      },
      contentType: false,
      processData: false,
      data: formData,
    }).done(function(data) {
      // console.log(data);
      $('#change-password-modal').modal('hide');
    }).fail(function(jqxhr) {
      console.error(jqxhr);
    });
  });
};

let setSignOutListener = function(){
  //Log out
  $('#sign-out-button').on('click', function(e) {
    e.preventDefault();
    $.ajax({
      url: myApp.BASE_URL + '/sign-out/' + myApp.user._id,
      method: 'DELETE',
      headers: {
        Authorization: 'Token token=' + myApp.user.token,
      },
    }).done(function() {
      console.log("Logged Out!");
      $('.signed-out').show();
      $('.signed-in').hide();
    }).fail(function(jqxhr) {
      console.error(jqxhr);
    });
  });
};

//Purchase AJAX Requests
//------------------------------------------------------------------------

//Add index of item in cart array as an attribute to each item object in the cart
let addIndexToCartItems = function(){
  for (let i = 0; i < myApp.cart.items.length; i++){
    myApp.cart.items[i].index = i;
  }
};

//shows items in cart in cart dropdown
//only displays purchases with completed:false
let displayCart = function(items){
  let cartTemplate = require('./cart.handlebars');
  $('.cart').html(cartTemplate({items}));
  console.log('display purchases');
};

//gets purchase with completed: false, sets client cart equal to response,
//then calls function to display current cart
let setCart = function(){
  $.ajax({
      url: myApp.BASE_URL + '/currentCart',
      method: 'GET',
      headers: {
        Authorization: 'Token token=' + myApp.user.token,
      },
      dataType: 'json'
    })
    .done(function(data){
      console.log('get cart success');
      myApp.cart = data.purchases[0];
      console.log(myApp.cart);
      displayCart(myApp.cart.items);
    })
    .fail(function(jqxhr){
      console.error(jqxhr);
    });
};

//Shows purchase history in purchase histroy modal
let displayPurchases = function(response){
  let responsePurchases = response;
  console.log(responsePurchases);
  let purchaseListingTemplate = require('./purchase-listing.handlebars');
  $('.purchase-history').html(purchaseListingTemplate({responsePurchases}));
  console.log('display purchases');
};

//retrieves purchases with completed: true, then calls function to display them
let getPurchaseHistory = function(){
  $.ajax({
    url: myApp.BASE_URL + '/purchaseHistory',
    method: 'GET',
    headers: {
      Authorization: 'Token token=' + myApp.user.token,
    },
    dataType: 'json'
  })
  .done(function(data){
    console.log('get purchases success');
    console.log(data);
    displayPurchases(data.purchases);
  })
  .fail(function(jqxhr){
    console.error(jqxhr);
  });
};

//Updates cart (purchase with completed: false) in database to match cart object
//stored in myApp.cart
let updateCart = function(){
  $.ajax({
    url: myApp.BASE_URL + '/purchases/' + myApp.cart._id,
    method: 'PATCH',
    headers: {
      Authorization: 'Token token=' + myApp.user.token,
    },
    data: {
      "purchase":{
        "items": myApp.cart.items,
        "completed": myApp.cart.completed
      }
    }
  }).done(function() {
    console.log('task edit');
  }).fail(function(jqxhr) {
    console.error(jqxhr);
  });
};

//Takes an item to be added to the cart, pushes it into local cart items array,
//then updates cart in database and displays updated cart
let addItemToCart = function(item){
  myApp.cart.items.push(item);
  console.log(myApp.cart);
  updateCart();
  displayCart(myApp.cart.items);
};

//Items AJAX Requests
//------------------------------------------------------------------------
let displayItems = function(response){
  let responseItems = response.items;
  // console.log(responseItems);
  let itemListingTemplate = require('./item-listing.handlebars');
  $('.content').append(itemListingTemplate({responseItems}));
  // console.log('display items');
};

//creates a new cart in database (empty items array, default completed: false)
//then sets local cart to match new empty cart
let createCart = function() {
  $.ajax({
    url: myApp.BASE_URL + '/purchases',
    method: 'POST',
    headers: {
      Authorization: 'Token token=' + myApp.user.token,
    },
    processData: false,
    contentType: false,
    data: {},
  }).done(function(data) {
    console.log('create empty cart');
    setCart();
  }).fail(function(jqxhr) {
    console.error(jqxhr);
  });
};

//called on ready
//gets all items for sale from database and displays them
let indexItems = function(){
  $.ajax({
      url: myApp.BASE_URL + '/items',
      method: 'GET',
      dataType: 'json'
    })
    .done(function(data){
      // console.log(data);
      console.log('index items success');
      displayItems(data);
    })
    .fail(function(jqxhr){
      console.error(jqxhr);
    });
};

//Called by add-to-cart button click handler
//gets full item object from database, then adds it to the cart
let getItem = function(e){
  let itemId = $(e.target).attr('data-item-id');
  $.ajax({
      url: myApp.BASE_URL + '/items/' + itemId ,
      method: 'GET',
      dataType: 'json'
    })
    .done(function(data){
      console.log('get item success');
      addItemToCart(data.item);
    })
    .fail(function(jqxhr){
      console.error(jqxhr);
    });
};

//Called by checkout button in cart
//Changes completed status of current cart to true, updates cart in database,
//then creates a new cart to be displayed
let checkout = function() {
  myApp.cart.completed = true;
  updateCart();
  createCart();
};

$(document).ready(() => {
  indexItems();
  $('.signed-out').show();
  $('.signed-in').hide();
  $('#purchase-history-btn').on('click', getPurchaseHistory);
  $('.content').on('click', '.add-to-cart', getItem);
  $('.cart').on('click', '.checkout', checkout);
  setSignUpListener();
  setSignInListener();
  setChangePasswordListener();
  setSignOutListener();
  // $('body').on('click', '.add-to-cart', addToCart);
  // $('body').on('click', '.remove-to-cart', removePurchase);
});

// //Purchases AJAX Requests
// let createPurchase = function() {
//   $.ajax({
//     url: myApp.BASE_URL + '/purchases',
//     method: 'POST',
//     headers: {
//       Authorization: 'Token token=' + myApp.user.token,
//     },
//     processData: false,
//     contentType: false,
//     data: {},
//   }).done(function(data) {
//     // console.log(data);
//     console.log('create empty cart');
//     indexPurchases();
//     currentCartId = data.purchase._id;
//     // console.log(currentCartId);
//     // myApp.task = data.task;
//     // console.log('end create task');
//   }).fail(function(jqxhr) {
//     console.error(jqxhr);
//   });
// };
//
// let clearPurchases = function() {
//   $('.purchase').empty();
// };
//
// let displayPurchases = function(response){
//   let responsePurchases = response.purchases;
//   console.log(responsePurchases);
//   let purchaseListingTemplate = require('./purchase-listing.handlebars');
//   $('.purchase-history').html(purchaseListingTemplate({responsePurchases}));
//   console.log('display purchases');
// };
//
//
//
// let indexPurchases = function(){
//   $.ajax({
//       url: myApp.BASE_URL + '/purchases',
//       method: 'GET',
//       headers: {
//         Authorization: 'Token token=' + myApp.user.token,
//       },
//       dataType: 'json'
//     })
//     .done(function(data){
//       console.log(data);
//       console.log('get purchases success');
//       displayPurchases(data);
//     })
//     .fail(function(jqxhr){
//       console.error(jqxhr);
//     });
// };
//
// let getPurchaseHistory = function(){
//   $.ajax({
//       url: myApp.BASE_URL + '/purchaseHistory',
//       method: 'GET',
//       headers: {
//         Authorization: 'Token token=' + myApp.user.token,
//       },
//       dataType: 'json'
//     })
//     .done(function(data){
//       console.log('get purchases success');
//       console.log(data);
//       displayPurchases(data.purchases);
//     })
//     .fail(function(jqxhr){
//       console.error(jqxhr);
//     });
// };
//
// let showCurrentCart = function(){
//   $.ajax({
//       url: myApp.BASE_URL + '/currentCart',
//       method: 'GET',
//       headers: {
//         Authorization: 'Token token=' + myApp.user.token,
//       },
//       dataType: 'json'
//     })
//     .done(function(data){
//       console.log('get cart success');
//       console.log(data);
//       displayCart(data.purchases);
//     })
//     .fail(function(jqxhr){
//       console.error(jqxhr);
//     });
// };
//
// let displayCart = function(response){
//   let responsePurchases = response;
//   console.log(responsePurchases);
//   let purchaseListingTemplate = require('./purchase-listing.handlebars');
//   $('.cart').html(purchaseListingTemplate({responsePurchases}));
//   console.log('display purchases');
// };
//
// let updatePurchase = function(e){
//   // console.log(e.item);
//   // console.log('updated');
//   if (!myApp.user) {
//     console.error('wrong');
//   }
//   let item_add = e.item;
//   $.ajax({
//     url: myApp.BASE_URL + '/purchases/' + currentCartId,
//     method: 'PATCH',
//     headers: {
//       Authorization: 'Token token=' + myApp.user.token,
//     },
//     data: {
//       "purchase":{
//         "items": item_add
//       }
//     }
//   }).done(function() {
//     console.log('task edit');
//   }).fail(function(jqxhr) {
//     console.error(jqxhr);
//   });
// };
//
// let addToCart = function(e) {
//   e.preventDefault();
//   // console.log(e.target);
//   let itemId = $(e.target).attr('data-item-id');
//   console.log(itemId);
//   showItem(itemId);
// };
//
// let removePurchase = function(e) {
//   e.preventDefault();
//   // console.log(e.target);
//   let removeCartId = $(e.target).attr('data-item-id');
//   // console.log(removeCartId);
//   if (!myApp.user) {
//     console.error('wrong');
//   }
//   $.ajax({
//     url: myApp.BASE_URL + '/purchases/' + removeCartId,
//     method: 'DELETE',
//     headers: {
//       Authorization: 'Token token=' + myApp.user.token,
//     },
//     contentType: false,
//     processData: false,
//   }).done(function() {
//     console.log('purchase deleted');
//     indexPurchases();
//   }).fail(function(jqxhr) {
//     console.error(jqxhr);
//   });
// };
