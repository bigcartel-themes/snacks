document.addEventListener("DOMContentLoaded", function () {
  let contactFields = document.querySelectorAll(".contact-form input, .contact-form textarea");
  contactFields.forEach(function (contactField) {
    contactField.removeAttribute("tabindex");
  });
});

API.onError = function(errors) {
  $('.errors').remove();
  var $errorList = $('<ul>', { class: 'errors'} )
    , $cartForm = $('.cart-form')
    , $productForm = $('.product-form');
  $.each(errors, function(index, error) {
    $errorList.append($('<li>').html(error));
  });
  if ($('.cart-overlay').hasClass('open') || $("body#cart").length) {
    if ($(window).width() <= 767) {
      $errorList.addClass('mobile-errors');
      $errorList.insertBefore('.cart-totals');
    }
    else {
      $errorList.addClass('desktop-errors');
      $errorList.insertBefore('.cart-items');
    }
    $errorList.addClass('cart-errors');
    $("html, body").animate({ scrollTop: 0 }, "fast");
  } else if ($productForm.length) {
    setTimeout(function() {
      $productForm.prepend($errorList);
      $errorList.addClass('product-errors');
      $('.add-to-cart-button').removeClass('spinner');
      $('.add-icon').fadeIn('fast');
      $('.add-to-cart-button').removeClass('adding');
    }, 600)
  }
}
function toggleCategoryNavigation() {
  var menu_title = $('.navigation-title').data('menu-title');
  var current_title = $('.navigation-title').html();
  $('.dropdown-navigation').toggleClass('open');
  $('.navigation-title').html(menu_title);
  $('.navigation-title').data('menu-title',current_title);
  $('.shop-dropdown').slideToggle('fast');
  return false;
}

$(function() {
  $('.navigation-header').click(function(e) {
    toggleCategoryNavigation();
  });

  $('.navigation-header').on('keydown', function(e) {
    if (e.keyCode == 32) { // Spacebar
      e.preventDefault();
      toggleCategoryNavigation();
    }
  });

  $('.product-form').submit(function(e) {
    e.preventDefault();
    var quantity = $(".product-quantity").val()
    , itemID = $("#option").val()
    , addButton = $('.add-to-cart-button');
    if (!addButton.hasClass('adding')) {
      if (quantity > 0 && itemID > 0) {
        addButton.addClass('adding');
        $('.add-icon').fadeOut('fast', function() {
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
              $('body').addClass('cart-footer');
            }
            $('.success-icon').fadeIn(700, function() {
              setTimeout(function() {
                $('.success-icon').fadeOut('fast', function() {
                  $('.add-icon').fadeIn('fast');
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

  $('.footer-overlay').click(function(e) {
    e.preventDefault();
    var currentURL = window.location.href;
    var lastPart = currentURL.substr(currentURL.lastIndexOf('/') + 1);
    if (lastPart != 'cart') {
      toggleCart('show');
    }
  });

  $('.close-cart-overlay').click(function(e) {
    e.preventDefault();
    toggleCart('hide');
  })

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
      $('body').removeClass('cart-footer');
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
    var currentURL = window.location.href;
    var lastPart = currentURL.substr(currentURL.lastIndexOf('/') + 1);
    if (lastPart != 'cart') {
      toggleCart('hide', item_count);
    }
    else {
      $('.cart-page').slideUp('fast', function() {
        $('.empty-cart-message').slideDown('fast');
      });
    }
  }
  else {
    $('.cart-total-amount').html(sub_total);
    $('.checkout-btn').attr("name","checkout");
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
  .on('keypress','.option-quantity', function(e) {
    if (e.keyCode == 13) {
      var input = $(this);
      var item_id = input.parent().data("item-id");
      var new_val = input.val();

      if (!isNaN(new_val)) {
        Cart.updateItem(item_id, new_val, function(cart) {
          processUpdate(input, item_id, new_val, cart);
        });
      }
      return false;
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

var isGreaterThanZero = function(currentValue) {
  return currentValue > 0;
}

function arrayContainsArray(superset, subset) {
  if (0 === subset.length) {
    return false;
  }
  return subset.every(function (value) {
    return (superset.indexOf(value) >= 0);
  });
}

function unique(item, index, array) {
  return array.indexOf(item) == index;
}

function cartesianProduct(a) {
  var i, j, l, m, a1, o = [];
  if (!a || a.length == 0) return a;
  a1 = a.splice(0, 1)[0];
  a = cartesianProduct(a);
  for (i = 0, l = a1.length; i < l; i++) {
    if (a && a.length) for (j = 0, m = a.length; j < m; j++)
      o.push([a1[i]].concat(a[j]));
    else
      o.push([a1[i]]);
  }
  return o;
}

Array.prototype.equals = function (array) {
  if (!array)
    return false;
  if (this.length != array.length)
    return false;
  for (var i = 0, l=this.length; i < l; i++) {
    if (this[i] instanceof Array && array[i] instanceof Array) {
      if (!this[i].equals(array[i]))
        return false;
    }
    else if (this[i] != array[i]) {
      return false;
    }
  }
  return true;
}

// From https://github.com/kevlatus/polyfill-array-includes/blob/master/array-includes.js
if (!Array.prototype.includes) {
  Object.defineProperty(Array.prototype, 'includes', {
    value: function (searchElement, fromIndex) {
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }
      var o = Object(this);
      var len = o.length >>> 0;
      if (len === 0) {
        return false;
      }
      var n = fromIndex | 0;
      var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
      function sameValueZero(x, y) {
        return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
      }
      while (k < len) {
        if (sameValueZero(o[k], searchElement)) {
          return true;
        }
        k++;
      }
      return false;
    }
  });
}

Array.prototype.count = function(filterMethod) {
  return this.reduce((count, item) => filterMethod(item)? count + 1 : count, 0);
}
$('.product_option_select').on('change',function() {
  var option_price = $(this).find("option:selected").attr("data-price");
  enableAddButton(option_price);
});

function enableAddButton(updated_price) {
  var addButton = $('.add-to-cart-button');
  var addButtonTextElement = addButton.find('.button-text');
  var addButtonTitle = addButton.attr('data-add-title');
  addButton.attr("disabled",false);
  if (updated_price) {
    priceTitle = ' - ' + Format.money(updated_price, true, true);
  }
  else {
    priceTitle = '';
  }
  addButtonTextElement.html(addButtonTitle + priceTitle);
}

function disableAddButton(type) {
  var addButton = $('.add-to-cart-button');
  var addButtonTextElement = addButton.find('.button-text');
  var addButtonTitle = addButton.attr('data-add-title');
  if (type == "sold-out") {
    var addButtonTitle = addButton.attr('data-sold-title');
  }
  if (!addButton.is(":disabled")) {
    addButton.attr("disabled","disabled");
  }
  addButtonTextElement.html(addButtonTitle);
}

function enableSelectOption(select_option) {
  select_option.removeAttr("disabled");
  select_option.text(select_option.attr("data-name"));
  select_option.removeAttr("disabled-type");
  if ((select_option.parent().is('span'))) {
    select_option.unwrap();
  }
}
function disableSelectOption(select_option, type) {
  if (type === "sold-out") {
    disabled_text = select_option.parent().attr("data-sold-text");
    disabled_type = "sold-out";
    if (show_sold_out_product_options === 'false') {
      hide_option = true;
    }
    else {
      hide_option = false;
    }
  }
  if (type === "unavailable") {
    disabled_text = select_option.parent().attr("data-unavailable-text");
    disabled_type = "unavailable";
    hide_option = true;
  }
  if (select_option.val() > 0) {
    var name = select_option.attr("data-name");
    select_option.attr("disabled",true);
    select_option.text(name + ' ' + disabled_text);
    select_option.attr("disabled-type",disabled_type);
    if (hide_option === true) {
      if (!(select_option.parent().is('span'))) {
        select_option.wrap('<span>');
      }
    }
  }
}
