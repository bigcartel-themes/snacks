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
        addButton.find('span').first().fadeIn(700);
        addButton.blur();
      }, 1200);
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
  
  // Delete from cart
  $('.item-delete').click(function(e) {
    $(this).closest('li').find('input.option-quantity').val(0).closest('form').submit();
    return false;
  });
  
  // Flexslider
  if ($(window).width() <= 768) {
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




