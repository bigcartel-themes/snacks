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
    $errorList.addClass('cart-errors');
    $("html, body").animate({ scrollTop: 0 }, "fast");
  } else if ($productError.length > 0) {
    $productError.find('.errors').hide();
    $productError.prepend($errorList);
  }
}

$(function() {
  // Open the Shop overlay from 'Shop' title and Categories
  $('.category-navigation').click(function(e) {
    $('html').toggleClass('overlay-open');
    $('.shop-overlay').toggleClass('open');
    return false;
  });
  
  // Close the overlay by clicking the X button
  $('.close-overlay, .shop-overlay a').click(function(e) {
    $('.overlay').removeClass('open');
    $('html').removeClass('overlay-open');
    
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
      addText.fadeOut('fast', function() { 
        addButton.addClass('spinner');
      })
      Cart.addItem(itemID, quantity, function(cart) { 
        setTimeout(function() {
          addButton.removeClass('spinner');
          //addText.clone().appendTo(addButton).html(addTextValue).hide();
          //addButton.find('span').first().remove();
          addButton.find('span').first().fadeIn(700);
          addButton.blur();
          if ($('.product-errors').length) { 
            $('.product-errors').hide();
          }
          var item_html = Format.pluralize(cart.item_count, 'Item', 'Items');
          $('.item-count').html(item_html);
          if (!$('.footer-overlay').hasClass('visible')) { 
            $('.footer-overlay').addClass('visible');
          }
        }, 500);
      });
    }
  });
  
  $('.single-option').click(function(e) { 
    $('.product-form').submit();
  })
  
  // Infinite scroll
  $('.products-page-products').infiniteScroll({
    // options
    path: '.next-button',
    append: '.product-card',
    status: '.page-load-status',
    hideNav: '.pagination',
    checkLastPage: true,
    history: false,
    prefill: true
  });
  

  
  // Opening the product menu
  $('.product-option-select').click(function(e) {
    e.preventDefault();
    $('html').addClass('overlay-open');
    $('.product-option-overlay').addClass('open');
    return false;
  });
  
  // Select a product option
  $('.product-options-list li').click(function() { 
    var option_id = $(this).data("option-id");
    if (option_id > 0) { 
      $('#option').val(option_id);
      $('html').removeClass('overlay-open');
      $('.product-option-overlay').removeClass('open');
    }
  });
  
  // Disable clicking of the select box
  $('#option').on('mousedown', function(e) {
     e.preventDefault();
     this.blur();
     window.focus();
  });

  
  // Flexslider
  console.log('screen width is '+screen.width);
  if (screen.width <= 768) {
    if ($('.product-page-images').length) {
      $('.product-page-images').addClass('use-slideshow');
      $('.product-images-list').parent().addClass('flexslider');
      $('.flexslider').flexslider({
        animation: "slide",
        directionNav: false,
        manualControls: ".product-images-nav li.nav-icon",
        slideshow: false,
        smoothHeight: true,
        customDirectionNav: $(".nav-control a")
      });
    }
  }
  
  //Open the cart overlay
  $( ".footer-overlay" ).click(function(e) {
    e.preventDefault();
    if ($(".footer-overlay").hasClass('open')) { 
      $('.footer-overlay').removeClass('open');
      $('.cart-overlay').removeClass('open');
      $('html').removeClass('overlay-open');
      $('.header-items').addClass('hidden-items');
      $('.footer-items').removeClass('hidden-items');
    }
    else { 
      $('.cart-overlay .wrapper').load("/cart?" + $.now() + " .cart-page > *", function() {
        $('.header-items').removeClass('hidden-items');
        $('.footer-items').addClass('hidden-items');
        $('.footer-overlay').addClass('open');
        $('.cart-overlay').addClass('open');
      });
      
      $('html').addClass('overlay-open');
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

});


// Close the overlay by hitting the escape key
$(document).on('keyup',function(e) {
  if (e.keyCode == 27) {
    if ($('.overlay').hasClass('open')) { 
      $('.overlay').removeClass('open');
      $('html').removeClass('overlay-open');
    }
    if ($('.footer-overlay').hasClass('open')) { 
      $('.footer-overlay').removeClass('open');
      $('.cart-overlay').removeClass('open');
      $('html').removeClass('overlay-open');
      $('.header-items').addClass('hidden-items');
      $('.footer-items').removeClass('hidden-items');
    }
  }
});

var processUpdate = function(input, item_id, new_val, cart) {
  var item_count = cart.item_count;
  if (item_count == 0) {
    
  }
  else {
    if (new_val == 0) {
      $('.cart-item[data-item-id="'+item_id+'"]').slideUp('fast');
    }
  }
  updateTotals(cart);
  return false;
}

var updateTotals = function(cart) {
  var sub_total = Format.money(cart.total, true, true);
  var item_count = cart.item_count;
  if (item_count == 0) { 
    $('.footer-overlay').removeClass('open');
    $('.footer-overlay').removeClass('visible');
    $('.cart-overlay').removeClass('open');
    $('html').removeClass('overlay-open');
    $('.header-items').addClass('hidden-items');
    $('.footer-items').removeClass('hidden-items');
  }
  else { 
    $('.cart-errors').remove();
    $('.cart-total-amount').html(sub_total);
    $('.checkout-btn').attr("name","checkout");
  }
  $('.footer-items cart-item-title').html('<span class="item-count">'+Format.pluralize(cart.item_count, 'Item', 'Items')+'</span> in your cart');
}

$('body')
  .on( 'blur','.option-quantity', function(e) {
    e.preventDefault();
    var input = $(this);
    var item_id = input.parent().data("item-id");
    var new_val = input.val();
    
    if (!isNaN(new_val)) { 
      Cart.updateItem(item_id, new_val, function(cart) {
        processUpdate(input, item_id, new_val, cart);
      });
    }
  })
  
  .on('click','.item-delete', function(e) {
    e.preventDefault();
    var input = $(this).closest('li').find('input.option-quantity');
    input.val(0);
    var item_id = $(this).data('item-id');
    Cart.updateFromForm("cart-form", function(cart) { 
      processUpdate(input, item_id, 0, cart);
    });
  })

  .on('click','.apply-discount', function(e) {
    e.preventDefault();
    $('.checkout-btn').attr('name','update');
    Cart.updateFromForm("cart-form", function(cart) { 
      updateTotals(cart);
    });
  })
  .on( 'blur','.cart-discount-code', function(e) {
    e.preventDefault();
    $('.checkout-btn').attr('name','update');
    Cart.updateFromForm("cart-form", function(cart) { 
      updateTotals(cart);
    });
  })
  .on('change','[name="cart[shipping_country_id]"]', function(e) {
    Cart.updateFromForm("cart-form", function(cart) { 
      updateTotals(cart);
    });
  })
  .on('keyup','[name="cart[discount_code]"]', function(e) {
    if (e.keyCode == 13) {
      e.preventDefault(); 
      $(this).closest('.checkout-btn').attr('name','update');
      Cart.updateFromForm("cart-form", function(cart) { 
        updateTotals(cart);
      });
      return false;
    }
  })
  .on('click','.cancel-discount', function(e) {  
    e.preventDefault(); 
    $('.cart-form').append('<input class="empty-discount" name="cart[discount_code]" type="hidden" value="">');
    Cart.updateFromForm("cart-form", function(cart) { 
      updateTotals(cart);
      $('.empty-discount').remove(0);
    });
  })
  
  .on('focus','.cart-discount-code', function(e) {
    $(this).removeClass('has-errors');
  })


