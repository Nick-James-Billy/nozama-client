'use strict';

// user require with a reference to bundle the file and use it in this file
// var example = require('./example');

// use require without a reference to ensure a file is bundled
require('./example');

const myApp = {
  BASE_URL: "http://localhost:3000"
};

let currentCartId;
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
    // createPurchase();
    showCurrentCart();
    getPurchaseHistory();
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

//Items AJAX Requests
let displayItems = function(response){
  let responseItems = response.items;
  // console.log(responseItems);
  let itemListingTemplate = require('./item-listing.handlebars');
  $('.content').append(itemListingTemplate({responseItems}));
  // console.log('display items');
};

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

let showItem = function(itemId){
  $.ajax({
      url: myApp.BASE_URL + '/items/' + itemId ,
      method: 'GET',
      dataType: 'json'
    })
    .done(function(data){
      // console.log(data);
      console.log('show item success');
      updatePurchase(data);
    })
    .fail(function(jqxhr){
      console.error(jqxhr);
    });
};
//Purchases AJAX Requests
let createPurchase = function() {
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
    // console.log(data);
    console.log('create empty cart');
    indexPurchases();
    currentCartId = data.purchase._id;
    // console.log(currentCartId);
    // myApp.task = data.task;
    // console.log('end create task');
  }).fail(function(jqxhr) {
    console.error(jqxhr);
  });
};

let clearPurchases = function() {
  $('.purchase').empty();
};

let displayPurchases = function(response){
  let responsePurchases = response.purchases;
  console.log(responsePurchases);
  let purchaseListingTemplate = require('./purchase-listing.handlebars');
  $('.purchase-history').append(purchaseListingTemplate({responsePurchases}));
  console.log('display purchases');
};



let indexPurchases = function(){
  $.ajax({
      url: myApp.BASE_URL + '/purchases',
      method: 'GET',
      headers: {
        Authorization: 'Token token=' + myApp.user.token,
      },
      dataType: 'json'
    })
    .done(function(data){
      console.log(data);
      console.log('get purchases success');
      displayPurchases(data);
    })
    .fail(function(jqxhr){
      console.error(jqxhr);
    });
};

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
}

let showCurrentCart = function(){
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
      console.log(data);
      displayCart(data.purchases);
    })
    .fail(function(jqxhr){
      console.error(jqxhr);
    });
};

let displayCart = function(response){
  let responsePurchases = response;
  console.log(responsePurchases);
  let purchaseListingTemplate = require('./purchase-listing.handlebars');
  $('.cart').html(purchaseListingTemplate({responsePurchases}));
  console.log('display purchases');
};

let updatePurchase = function(e){
  // console.log(e.item);
  // console.log('updated');
  if (!myApp.user) {
    console.error('wrong');
  }
  let item_add = e.item;
  $.ajax({
    url: myApp.BASE_URL + '/purchases/' + currentCartId,
    method: 'PATCH',
    headers: {
      Authorization: 'Token token=' + myApp.user.token,
    },
    data: {
      "purchase":{
        "items": item_add
      }
    }
  }).done(function() {
    console.log('task edit');
  }).fail(function(jqxhr) {
    console.error(jqxhr);
  });
};

let addToCart = function(e) {
  e.preventDefault();
  // console.log(e.target);
  let itemId = $(e.target).attr('data-item-id');
  console.log(itemId);
  showItem(itemId);
};

let removePurchase = function(e) {
  e.preventDefault();
  // console.log(e.target);
  let removeCartId = $(e.target).attr('data-item-id');
  // console.log(removeCartId);
  if (!myApp.user) {
    console.error('wrong');
  }
  $.ajax({
    url: myApp.BASE_URL + '/purchases/' + removeCartId,
    method: 'DELETE',
    headers: {
      Authorization: 'Token token=' + myApp.user.token,
    },
    contentType: false,
    processData: false,
  }).done(function() {
    console.log('purchase deleted');
    indexPurchases();
  }).fail(function(jqxhr) {
    console.error(jqxhr);
  });
};


$(document).ready(() => {
  indexItems();
  $('.signed-out').show();
  $('.signed-in').hide();
  setSignUpListener();
  setSignInListener();
  setChangePasswordListener();
  setSignOutListener();
  $('body').on('click', '.add-to-cart', addToCart);
  $('body').on('click', '.remove-to-cart', removePurchase);


});
