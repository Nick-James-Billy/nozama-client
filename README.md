# Overview

Nozama is the premier service for arranging a dinner with your favorite
celebrities. It allows users to browse a list of some of the most sought-after
names in Hollywood and beyond, and purchase the rare opportunity to dine with
them. They can even purchase multiple dinners with different celebrities at the
same time.

##User Stories

Upon opening the page, users will be able to either create an account by
clicking the "Sign Up" or log into an existing account with the "Sign In"
button, each of which will open modals with the appropriate fields. After
signing in, the "Sign Up" and "Sign In" buttons will be hidden, and replaced
by "Change Password" and "Sign Out" buttons. The user will be able to change
their password by clicking the "Change Password" button and entering their old
and new passwords.

Once logged in, users will see a list of all the celebrities whose time they
can purchase in the main content window. Each item in the list will contain a
photo of the celebrity, a description with more information about them, a
price, and an “Add to Cart” button. When the user clicks the “Add to Cart”
button, the selected celebrity will be added to the user’s cart. In the navbar
at the top of the page, the user will see two buttons: one for purchase history
and one to show the cart. When the user clicks the “Purchase History” button, a
modal will appear showing a list of all the user’s previous purchases, with
information about the item(s) purchased and the total price. When the user
clicks the “Show Cart” button, a collapsible well drops down from the navbar
showing a list of all celebrities in the current cart, their prices, and a
total price for the cart. The user will also see a checkout button, which when
clicked will open a Stripe Checkout window where the user can enter their email
and credit card information. When they click the “Pay” button, their card will
be processed. If their card is “approved”, the popup will disappear, the cart
will be emptied and replaced with a new cart, and the purchased cart will now
be visible in the “Purchase History” list.

When finished, the user will be able to click the "Sign Out"
button, which will log their account out of the back-end, hide the board, and
the user will again see the "Sign Up" and "Sign In" buttons on the navbar at
the top of the page.

##Technologies used

This front-end app uses HTML, CSS/Bootstrap, JavaScript, jQuery, and AJAX.

##Wireframes

See initial wireframe [here](https://drive.google.com/file/d/0B7bwsjwFCuRgUW5pbGxOS21Pd1FvRFMxMzA4cmM0eG1fMWUw/view?usp=sharing)

## [License](LICENSE)

Source code distributed under the MIT license. Text and other assets copyright
General Assembly, Inc., all rights reserved.
