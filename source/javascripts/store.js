// Error handling for adding/updating cart

API.onError = function(errors) {
  var $errorList = $('<ul>', { class: 'errors'} )
    , $cartError = $('.cart-form')
    , $productError = $('.product-form');
  $.each(errors, function(index, error) {
    $errorList.append($('<li>').html(error));
  });
  if ($cartError.length > 0) {
    $cartError.find('.errors').remove();
    $cartError.prepend($errorList);
    $("html, body").animate({ scrollTop: 0 }, "fast");
  } else if ($productError.length > 0) {
    $productError.find('.errors').hide();
    $productError.prepend($errorList);
  }
}

$(function() {
  // Open the Shop overlay from 'Shop' title and Categories
  $('.open-overlay, .category-navigation').click(function(e) {
    $('body').addClass('overlay-open');
    $('.overlay').addClass('open').addClass('navigation');
    return false;
  });
  
  // Close the overlay by clicking the X button
  $('.close-overlay, .overlay a').click(function(e) {
    $('body').removeClass('overlay-open');
    $('.overlay').removeClass('open').removeClass('navigation');
  });
  
  // Adding item to cart
  $('.product-form').submit(function(e) {
    e.preventDefault();
    var quantity = $(this).find(".product-quantity").val()
    , itemID = $(this).find("#option").val()
    , addButton = $(this).find('.add-to-cart-button')
    , addText = $(this).find('.status-text')
    , addTextValue = addText.html()
    , addedText = addButton.data('added-text')
    , addingText = addButton.data('adding-text');
    if (quantity > 0 && itemID > 0) { 
      addText.html(addingText);
      Cart.addItem(itemID, quantity, function(cart) { 
        addText.html(addedText);
        if ($('.product-errors').length) { 
          $('.product-errors').hide();
        }
        var item_html = Format.pluralize(cart.item_count, 'Item', 'Items');
        $('.item-count').html(item_html);
        if (!$('.footer-overlay').hasClass('visible')) { 
          $('.footer-overlay').addClass('visible');
        }
      });
      setTimeout(function() {
        addText.clone().appendTo(addButton).html(addTextValue).hide();
        addButton.find('span').first().remove();
        addButton.find('span').first().fadeIn(400);
        addButton.blur();
      }, 800);
    }
  });
});


// Close the overlay by hitting the escape key
$(document).on('keyup',function(e) {
  if (e.keyCode == 27) {
    $('body').removeClass('overlay-open');
    $('.overlay').removeClass('open').removeClass('navigation');
  }
});

// Product image lightbox
$('.product-images-list a').magnificPopup({
  type:'image',
  tLoading: '',
  gallery: {
    enabled: true
  }
});