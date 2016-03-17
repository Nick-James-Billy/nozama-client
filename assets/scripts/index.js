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
    indexItems();
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

//shows items in cart in cart dropdown
//only displays purchases with completed:false
let displayCart = function(){
  calculateTotal();
  let cart = myApp.cart;
  console.log("cart"+ myApp.cart);
  let cartTemplate = require('./cart.handlebars');
  $('.cart').html(cartTemplate({cart}));
  console.log('display items: ' + myApp.cart.items);
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
      displayCart();
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
      "purchase": myApp.cart
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
  displayCart();
};

let removeItemFromCart = function(e){
  let itemIndex = Number($(e.target).attr("data-cart-item-id"));
  myApp.cart.items.splice(itemIndex, 1);
  if(myApp.cart.items.length === 0) {
    deleteCart();
  } else {
    updateCart();
    displayCart();
  }
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

let deleteCart = function() {
  $.ajax({
    url: myApp.BASE_URL + '/purchases/' + myApp.cart._id,
    type: 'DELETE',
    headers: {
      Authorization: 'Token token=' + myApp.user.token,
    },
    contentType: false,
    processData: false,
  })
  .done(function() {
    createCart();
    console.log('suck it');
  })
  .fail(function(fail) {
    console.log(fail);
  });
};

let searchItem = function (e) {
  e.preventDefault();
  let search = $('#search-input').val();
  $.ajax({
    url: myApp.BASE_URL + '/search',
    method: 'GET',
    headers: {
      Authorization: 'Token token=' + myApp.user.token,
    },
    contentType: false,
    processData: false,
    data: search
  }).done(function(data) {
    console.log(data);
  }).fail(function(fail) {
    console.error(fail);
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

let calculateTotal = function() {
  let cartItems = myApp.cart.items;
  let total = 0;
  cartItems.forEach(function(item) {
    total += Number(item.price);
  });
  myApp.cart.total = total;
  console.log(total);
};

let makeCharge = function(credentials){
  $.ajax({
      url: myApp.BASE_URL + '/charge',
      method: 'POST',
      headers: {
        Authorization: 'Token token=' + myApp.user.token,
      },
      datatype: 'json',
      data: credentials
    })
    .done(function(data){
      console.log(data);
      checkout();
    })
    .fail(function(jqxhr){
      console.error(jqxhr);
    });
};

let handler = StripeCheckout.configure({
    key: 'pk_test_6pRNASCoBOKtIshFeQd4XMUh',
    image: '../../images/empty-hollywood-star-01.jpg',
    locale: 'auto',
    token: function(token) {
      let credentials = {
      stripeToken: token.id,
      amount: myApp.cart.total * 100
    };
    console.log(credentials);
    makeCharge(credentials);
  }
});

$('.cart').on('click', '.checkout', function(e) {
  // Open Checkout with further options
  handler.open({
    name: 'Nozama!',
    description: 'YOU PAY NOW!',
    amount: myApp.cart.total * 100
  });
  e.preventDefault();
});

// Close Checkout on page navigation
$(window).on('popstate', function() {
  handler.close();
});

$(document).ready(() => {
  $('#item-search').on('submit', searchItem);
  $('.signed-out').show();
  $('.signed-in').hide();
  $('#purchase-history-btn').on('click', getPurchaseHistory);
  $('.content').on('click', '.add-to-cart', getItem);
  $('.cart').on('click', '.remove-from-cart', removeItemFromCart);
  setSignUpListener();
  setSignInListener();
  setChangePasswordListener();
  setSignOutListener();
});
