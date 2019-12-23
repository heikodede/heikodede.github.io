// ==================================================
// Project Name  :  ----------
// File          :  JS Base
// Version       :  1.0.0
// Last change   :  -- ----- ----
// Author        :  ----------
// Developer:    :  Rakibul Islam Dewan
// ==================================================




(function($) {
  "use strict";



  // back to top - start
  // --------------------------------------------------
  $(window).scroll(function() {
    if ($(this).scrollTop() > 200) {
      $('#backtotop:hidden').stop(true, true).fadeIn();
    } else {
      $('#backtotop').stop(true, true).fadeOut();
    }
  });
  $(function() {
    $("#scroll").on('click', function() {
      $("html,body").animate({
        scrollTop: $("#thetop").offset().top
      }, "slow");
      return false
    })
  });
  // back to top - end
  // --------------------------------------------------



  // preloader - start
  // --------------------------------------------------
  // $(window).on('load', function(){
  //   $('#preloader').fadeOut('slow',function(){$(this).remove();});
  // });
  // preloader - end
  // --------------------------------------------------



  // background image - start
  // --------------------------------------------------
  $('[data-background]').each(function() {
    $(this).css('background-image', 'url('+ $(this).attr('data-background') + ')');
  });
  // background image - end
  // --------------------------------------------------



  // menu button - start
  // --------------------------------------------------
  $(document).ready(function () {
    $('.close-btn, .overlay').on('click', function () {
      $('#sidebar-menu').removeClass('active');
      $('.overlay').removeClass('active');
    });

    $('#sidebar-collapse').on('click', function () {
      $('#sidebar-menu').addClass('active');
      $('.overlay').addClass('active');
    });
  });
  // menu button - end
  // --------------------------------------------------



  // popup video - start
  // --------------------------------------------------
  $('.popup-video').magnificPopup({
    items: {
         src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
       },
    type: 'iframe',
    iframe: {
          markup: '<div class="mfp-iframe-scaler">'+
                  '<div class="mfp-close"></div>'+
                  '<iframe class="mfp-iframe" frameborder="0" allowfullscreen></iframe>'+
                  '</div>', 
          patterns: {
              youtube: {
                  index: 'youtube.com/', 
                  id: 'v=', 
                  src: '//www.youtube.com/embed/%id%?autoplay=1' 
              }
           },
           srcAction: 'iframe_src', 
       }
  });
  // popup video - end
  // --------------------------------------------------


  
  // scroll animation - start
  // --------------------------------------------------
  AOS.init({
    disable: function() {
      var maxWidth = 769;
      return window.innerWidth < maxWidth;
    }
  });
  // scroll animation - end
  // --------------------------------------------------



  // testimonial carousel - start
  // --------------------------------------------------
  $('.testimonial-carousel.owl-carousel').owlCarousel({
    items:1,
    nav:false,
    loop:true,
    margin:30,
    autoplay:true,
    smartSpeed:1000,
    autoplayTimeout:6000,
    autoplayHoverPause:true,
    animateIn: 'slideInUp',
    animateOut: 'slideInUp',
    animateIn: 'slideOutUp',
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    freeDrag: false
  });
  // testimonial carousel - end
  // --------------------------------------------------



  // testimonial carousel - start
  // --------------------------------------------------
  $('.product-carousel').owlCarousel({
    nav:true,
    margin:30,
    loop:false,
    dots:false,
    smartSpeed:1000,
    responsive:{
      0:{
        items:1
      },
      600:{
        items:1
      },
      1100:{
        items:1
      },
      1920:{
        items:2
      }
    }
  });

  $('.product-carousel-2').owlCarousel({
    items:1,
    nav:true,
    margin:30,
    loop:false,
    dots:false,
    smartSpeed:1000,
  });
  // testimonial carousel - end
  // --------------------------------------------------



  // sticky menu - start
  // --------------------------------------------------
  var headerId = $(".sticky-header");
  $(window).on('scroll' , function() {
    var amountScrolled = $(window).scrollTop();
    if ($(this).scrollTop() > 60) {
      headerId.removeClass("not-stuck");
      headerId.addClass("stuck");
    } else {
      headerId.removeClass("stuck");
      headerId.addClass("not-stuck");
    }
  });
  // sticky menu - end
  // --------------------------------------------------


  //real Custom Code!
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
  });


  
})(jQuery);