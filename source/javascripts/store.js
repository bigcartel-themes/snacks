// Error handling for adding/updating cart

var inPreview = (/\/admin\/design/.test(top.location.pathname));

API.onError = function(errors) {
  $('.errors').remove();
  var $errorList = $('<ul>', { class: 'errors'} )
    , $cartForm = $('.cart-form')
    , $productForm = $('.product-form');
  $.each(errors, function(index, error) {
    $errorList.append($('<li>').html(error));
  });
  if ($cartForm.length) {
    $errorList.insertBefore('.cart-items');
    $errorList.addClass('cart-errors');
    $("html, body").animate({ scrollTop: 0 }, "fast");
  } else if ($productForm.length) {
    setTimeout(function() {
      $productForm.prepend($errorList);
      $errorList.addClass('product-errors');
      $('.add-to-cart-button').removeClass('spinner');
      $('.status-icon').fadeIn('fast');
      $('.add-to-cart-button').removeClass('adding');
    }, 600)
  }
}

$(function() {
  // Open the Shop dropdown from Categories
  $('.navigation-header').click(function(e) {
    var menu_title = $('.navigation-title').data('menu-title');
    var current_title = $('.navigation-title').html();
    $(this).parent().toggleClass('open');
    $('.navigation-title').html(menu_title);
    $('.navigation-title').data('menu-title',current_title);
    $('.shop-dropdown').slideToggle('fast');
    return false;
  });

  // Adding item to cart
  $('.product-form').submit(function(e) {
    e.preventDefault();
    var quantity = $(".product-quantity").val()
    , itemID = $("#option").val()
    , addButton = $('.add-to-cart-button')
    , addText = $('.status-icon');
    if (!addButton.hasClass('adding')) { 
      if (quantity > 0 && itemID > 0) { 
        addButton.addClass('adding');
        addText.fadeOut('fast', function() { 
          addButton.addClass('spinner');
        });
        Cart.addItem(itemID, quantity, function(cart) {
          $('.errors').remove();
          setTimeout(function() {
            $('.add-to-cart-button').removeClass('spinner');
            var item_html = Format.pluralize(cart.item_count, 'Item', 'Items');
            $('.item-count').html(item_html);
            if (!$('.footer-overlay').hasClass('visible')) { 
              $('.footer-overlay').addClass('visible');
            }
            $('.success-icon').fadeIn(700, function() { 
              setTimeout(function() {
                $('.success-icon').fadeOut('fast', function() { 
                  $('.status-icon').fadeIn('fast');
                  addButton.blur();
                  addButton.removeClass('adding');
                });
              }, 600);
            })
  
          }, 600);
        });
        
      }
    }
  });
  
  // Straight submit when it's a single option
  $('.single-option').click(function(e) { 
    $('.product-form').submit();
  })
  
  // Infinite scroll
  var $container = $('.products-page-products').infiniteScroll({
    // options
    path: '.next-button',
    append: '.product-card',
    status: '.page-load-status',
    hideNav: '.pagination',
    checkLastPage: true,
    history: false,
    prefill: true,
    debug: false,
    loadOnScroll: false
  });
  
  // Load more products button
  var $loadMoreButton = $('.view-more-button');
  $loadMoreButton.on( 'click', function() {
    $container.infiniteScroll('loadNextPage');
    $container.infiniteScroll( 'option', {
      loadOnScroll: true,
    });
    $loadMoreButton.hide();
  });
  
  // Set product option title on load
  if ($('#option').length) { 
    $('.navigation-title').html($("#option option:selected").text());
  }
  
  // Select a product option
  $('.product-option-links li').not('.disabled').click(function() { 
    var option_id = $(this).data("option-id");
    if (option_id > 0) { 
      $('#option').val(option_id);
      var current_title = $('.navigation-title').html();
      $('.option-navigation').removeClass('open');
      $('.navigation-title').html($("#option option:selected").text());
      $('.navigation-title').data('menu-title',current_title);
      $('.shop-dropdown').slideToggle('fast');
    }
  });
  
  // Flexslider
  /*
  if ($(window).width() <= 1023) {
    if ($('.slides').length) {
      $('.product-page-images').addClass('use-slideshow');
      $('.product-images-list').parent().addClass('flexslider');
      $('.product-page-accent').addClass('has-controls');
      $('.flexslider').flexslider({
        animation: "slide",
        slideshow: false,
        smoothHeight: true,
        controlsContainer: $(".custom-controls-container"),
        customDirectionNav: $(".custom-navigation a"),
      });
    }
  }
  $('.flexslider').on('touchmove', function (e) { e.stopPropagation(); });
  */
  

  //Open the cart overlay
  $('.footer-overlay').click(function(e) { 
    if (!inPreview) { 
      e.preventDefault();
      var currentURL = window.location.href;
      var lastPart = currentURL.substr(currentURL.lastIndexOf('/') + 1);
      if (lastPart != 'cart') {
        toggleCart('show');
      }
    }
  });

  $('.close-cart-overlay').click(function(e) { 
    e.preventDefault();
    toggleCart('hide');
  })
  
  // Product image lightbox
    $('.product-images-list a').magnificPopup({
      type:'image',
      tLoading: '',
      gallery: {
        enabled: true
      }
    });
});

var processUpdate = function(input, item_id, new_val, cart) {
  if (new_val == 0) {
    $('.cart-item[data-item-id="'+item_id+'"]').slideUp('fast');
  }
  updateTotals(cart);
  return false;
}

var toggleCart = function(state, item_count) {
  if (state == 'hide') { 
    $('.cart-overlay').removeClass('open');
    $('html').removeClass('overlay-open');
    if (item_count == 0) {
      $('.footer-overlay').removeClass('visible');
    }
  }
  if (state == 'show') { 
    $('.cart-overlay > .wrapper').load("/cart?" + $.now() + " .cart-page > *", function() {
      $('.cart-overlay').addClass('open');
    });
    setTimeout(function() {
      $('html').toggleClass('overlay-open');
    }, 300);
  }
}
  
var updateTotals = function(cart) {
  var sub_total = Format.money(cart.total, true, true);
  var item_count = cart.item_count;
  $('.cart-errors').remove();
  if (item_count == 0) {
    toggleCart('hide', item_count);
  }
  else { 
    $('.cart-total-amount').html(sub_total);
    $('.checkout-btn').attr("name","checkout");
  }

  if ($('.cart-shipping-amount').length) { 
    if (cart.shipping.amount) {
      var shipping_amount = Format.money(cart.shipping && cart.shipping.amount ? cart.shipping.amount : 0, true, true);
    }
    else {
      var shipping_amount = Format.money(0, true, true);
    }
    $('.cart-shipping-amount > span').html(shipping_amount);
  }
  if ($('.cart-discount-amount').length) {
    if (cart.discount) {
      $('.apply-discount').addClass('cancel-discount').removeClass('apply-discount');
      $('.cart-discount-code').val(cart.discount.name);
      $('.cart-discount-code').prop("disabled", true);
      if (cart.discount.type == 'free_shipping') { 
        var discount_amount = '';
      }
      else { 
        var discount_amount = '- '+Format.money(cart.discount && cart.discount.amount ? cart.discount.amount : 0, true, true);
      }
    }
    else {
      $('.cancel-discount').addClass('apply-discount').removeClass('cancel-discount');
      $('.cart-discount-code').val('');
      $('.cart-discount-code').prop("disabled", false);
      var discount_amount = Format.money(0, true, true);
    }
    $('.cart-discount-amount > span').html(discount_amount);
  }

  $('.footer-items cart-item-title').html('<span class="item-count">'+Format.pluralize(cart.item_count, 'Item', 'Items')+'</span> in your cart');
}
$(window).on("load resize",function() {
  if ($(window).width() > 1024) {
    if ($('.slides').length) {
      if ($('.slides').hasClass('slick-initialized')) {
        $('.product-page-accent').removeClass('has-controls'); 
        $('.slides').slick('unslick');
      }
    }
  }
  else { 
    
    if ($('.slides').length) {
      $('.product-page-accent').addClass('has-controls'); 
      if ($('.slides').hasClass('slick-initialized')) { 
        
      }
      else { 
        $(".slides").slick({
          prevArrow: $('.flex-prev'),
          nextArrow: $('.flex-next'),
          adaptiveHeight: true,
          lazyload: true,
          dots: true,
          appendDots: $('.custom-controls-container')
        });
      }
    }
  }
});


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
