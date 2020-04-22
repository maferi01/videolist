$(".cmp-audio__listaudio li .playaction").on("click", function () {
    $(this).closest(".cmp-audio__listaudio").find("li").each(function (index, element) {
        $(this).removeClass("active");  
    });
    $(this).closest("li").addClass("active");

     var title = $(this).closest("li").find(".title").text();


      $(this).closest(".cmp-audio").find(".cmp-audio__cover .title").html("");
      $(this).closest(".cmp-audio").find(".cmp-audio__cover .title").text(title);

      var urlimge =  $(this).closest(li).find(".wrapper-content").attr("data-img");
      $(this).closest(".cmp-audio").find(".cmp-audio__cover").css("background-image",'url('+urlimge+')');


});

$(".cmp-audio__listaudio li .stopaction").on("click", function () {
    $(this).closest("li").removeClass("active");
});
$(".cmp-boton--btn").on({
   
    "mouseover" : function() {
       $(this).find('.icon').attr("src", $(this).data("srchover"));
     },
     "mouseout" : function() {
        $(this).find('.icon').attr("src", $(this).data("src"));
     }
   });
/**********************/
/* WEB COMPONENT CARD */
/**********************/
var windowCard = $(window);
var breakpointCard = 768;
// Checking screen size
function checkWidth() {
    var windowsize = windowCard.width();
    // Toogle image desktop - mobile
    $(".cmp-card-ImgLink__row-wrapper-image-bg").each(function (index) {
        if ($(this).data("imgmobile")) {
            if (windowsize < breakpointCard) {
                $(this).css('background-image', 'url(' + $(this).data("imgmobile") + ')');
            }
            else {
                $(this).css('background-image', 'url(' + $(this).data("image") + ')');
            }
        }
    });
}
// Execute on load
checkWidth();
// Bind event listener
$(window).resize(checkWidth);
/*************************************/
/* WEB COMPONENT CAROUSEL FULL WIDTH */
/*************************************/
let owlf = $(".cmp-carrusel").owlCarousel({
  autoplay: false,
  autoplayTimeout: 2000,
  dots: true,
  dotsData: true,
  loop: true,
  nav: true,
  navText: ["<img src=" + $(".cmp-carrusel").data("imgprev") + ">", "<img src=" + $(".cmp-carrusel").data("imgnext") + ">"],
  // With background image
  // navText: ["<div class='crl-custom-prev'></div>","<div class='crl-custom-next'></div>"],
  center: false,
  items: 1,
  // stagePadding: 100
});
$('.cmp-carrusel .owl-dot').click(function () {
  owlf.trigger('to.owl.carousel', [$(this).index(), 1000]);
})
// Change dots
$(".cmp-carrusel .owl-dot.active img").attr("src", $(".cmp-carrusel").data("srchover"));
$(".cmp-carrusel").on('changed.owl.carousel', function (event) {
  $(".cmp-carrusel .owl-dot img").attr("src", $(".cmp-carrusel").data("src"));
  $(".cmp-carrusel .owl-dot.active img").attr("src", $(".cmp-carrusel").data("srchover"));
})
// Active dot
$(".cmp-carrusel .owl-dot img").on('click', function (event) {
  setTimeout(function () {
    $(".cmp-carrusel .owl-dot img").attr("src", $(".cmp-carrusel").data("src"));
    $(".cmp-carrusel .owl-dot.active img").attr("src", $(".cmp-carrusel").data("srchover"));
  }, 150);

})
// Cursor pointer style
$(".cmp-carrusel .crl-nobuttons").css("cursor", "pointer");
// Hover on dots
$(".cmp-carrusel .owl-dot img").on({
  "mouseover": function () {
    this.src = $(".cmp-carrusel").data("srchover");
  },
  "mouseout": function () {
    this.src = $(".cmp-carrusel").data("src");
    $(".cmp-carrusel .owl-dot.active img").attr("src", $(".cmp-carrusel").data("srchover"));
  }
});

/*************************************/
/* WEB COMPONENT CAROUSEL MULTIPLE   */
/*************************************/
let owlMultiple = $(".crl-multiple").owlCarousel({
  autoplay: false,
  autoplayTimeout: 2000,
  dots: true,
  dotsData:true,
  loop: true,
  margin: 30,
  nav: false,
  center: false,
  items: 4,
  responsiveClass: true,
  responsive: {
    0:{
      items: 1
    },
    768:{
      items: 2
    },
    992:{
      items: 3
    },
    1200:{
      items: 4
    }
  },
  stagePadding: 100
});
$('.crl-multiple .owl-dot').click(function() {
  owlMultiple.trigger('to.owl.carousel', [$(this).index(), 1000]);
})
// Active dot
$(".crl-multiple .owl-dot.active img").attr("src", $(".crl-multiple").data("srchover"));
$(".crl-multiple").on('changed.owl.carousel', function(event) {
  $(".crl-multiple .owl-dot img").attr("src", $(".crl-multiple").data("src"));
  $(".crl-multiple .owl-dot.active img").attr("src", $(".crl-multiple").data("srchover"));
})
$(".crl-multiple .owl-dot img").on('click', function(event) {
  setTimeout(function(){
      $(".crl-multiple .owl-dot img").attr("src", $(".crl-multiple").data("src"));
      $(".crl-multiple .owl-dot.active img").attr("src", $(".crl-multiple").data("srchover"));
    }, 150);

})
// Hover on dots
$(".crl-multiple .owl-dot img").on({
  "mouseover" : function() {
     this.src =  $(".crl-multiple").data("srchover");
   },
   "mouseout" : function() {
     this.src=  $(".crl-multiple").data("src");
     $(".crl-multiple .owl-dot.active img").attr("src", $(".crl-multiple").data("srchover"));
   }
 });
/*************************************/
/* WEB COMPONENT CAROUSEL VERTICAL   */
/*************************************/
var sync1 = $(".slider");
var sync2 = $(".navigation-thumbs");

var thumbnailItemClass = '.owl-item';

var slides = sync1.owlCarousel({
  video: true,
  startPosition: 0,
  items: 1,
  loop: true,
  margin: 13,
  autoplay: false,
  nav: false,
  dots: true,
  slideBy: 1,

}).on('changed.owl.carousel', syncPosition);

function syncPosition(el) {
  $owl_slider = $(this).data('owl.carousel');
  var loop = $owl_slider.options.loop;

  if (loop) {
    var count = el.item.count - 1;
    var current = Math.round(el.item.index - (el.item.count / 2) - .5);
    if (current < 0) {
      current = count;
    }
    if (current > count) {
      current = 0;
    }
  } else {
    var current = el.item.index;
  }

  var owl_thumbnail = sync2.data('owl.carousel');
  var itemClass = "." + owl_thumbnail.options.itemClass;


  var thumbnailCurrentItem = sync2
    .find(itemClass)
    .removeClass("synced")
    .eq(current);

  thumbnailCurrentItem.addClass('synced');

  if (!thumbnailCurrentItem.hasClass('active')) {
    var duration = 300;
    sync2.trigger('to.owl.carousel', [current, duration, true]);
  }
}
var thumbs = sync2.owlCarousel({
  startPosition: 0,
  items: 0,
  loop: false,
  autoplay: false,
  nav: false,
  mouseDrag: false,
  touchDrag: false,
  dots: false,
  slideBy: 1,
  onInitialized: function (e) {
    var thumbnailCurrentItem = $(e.target).find(thumbnailItemClass).eq(this._current);
    thumbnailCurrentItem.addClass('synced');
  },
})
  .on('click', thumbnailItemClass, function (e) {
    e.preventDefault();
    var duration = 300;
    var itemIndex = $(e.target).parents(thumbnailItemClass).index();
    sync1.trigger('to.owl.carousel', [itemIndex, duration, true]);
  }).on("changed.owl.carousel", function (el) {
    var number = el.item.index;
    $owl_slider = sync1.data('owl.carousel');
    $owl_slider.to(number, 200, true);
  });


/*************************************/
/* WEB COMPONENT HEADER   */
/*************************************/
$('.cmp-menu > ul > li > a').on('click', function () {
    if ($(this).next().hasClass('open')) {
        $(this).next().removeClass('open');
        $(this).parent().removeClass("active");
    } else {
        $('.cmp-menu').each(function (index, element) {
            $(this).find('ul > li > ul').removeClass('open');
            $(this).find('ul > li').removeClass('active');

        });
        //open menu
        $(this).next().addClass('open');
        //add active li
        $(this).parent().addClass("active");

    }
});
// CHECK MENU
$('.check-menu').on('click', function () {
    if ($(this).prop('checked')) {
        $('.cmp-menu').addClass("openside");
        var ancho = $(window).width();
        if (ancho <= 768) {
            $('body').addClass("noScroll");
        }

        $('.cmp-menu').each(function (index, element) {
            $(this).find('ul > li > ul').prev().addClass('arrow');
        });
    } else {
        $('.cmp-menu').removeClass("openside");
        $('body').removeClass("noScroll");
    }
});
// CHECK SECONDARY MENU
$('.check-menusecundary').on('click', function () {
    if ($(this).prop('checked')) {
        var ancho = $(window).width();
        if (ancho <= 768) {
            $('body').addClass("noScroll");
        }
    } else {
        $('body').removeClass("noScroll");
    }
});
// Hover links
$(".cmp-header--links a").on({
    "mouseover": function () {
        $(this).children().attr("src", $(this).data("srchover"));
    },
    "mouseout": function () {
        $(this).children().attr("src", $(this).data("src"));
    }
});

$(".cmp-header--menusecundary").on({
    "mouseover": function () {
        $(this).find('.icon').attr("src", $(this).data("srchover"));
    },
    "mouseout": function () {
        $(this).find('.icon').attr("src", $(this).data("src"));
    }
});

$(".cmp-header--menusecundary li").on({
    "mouseover": function () {
        $(this).find('.icon-inside').attr("src", $(this).data("srchover"));
    },
    "mouseout": function () {
        $(this).find('.icon-inside').attr("src", $(this).data("src"));
     }
   });

   $(".custom-select").on("click", function () {
       
       $(this).next().slideToggle();
       $(this).toggleClass('open');
    //   console.log($(this).next().is(':visible'));  
      // console.log( $(this).next().slideToggle().length == 0);
   });

   $(".cmp-header--select .option").on("click", function () {
    $(this).closest(".cmp-header--select").find(".custom-select img,.custom-select .langselect").remove();
    idioma = $(this).html();
    $(this).closest(".cmp-header--select").find(".custom-select").append(idioma);
    $(this).closest(".cmp-header--select").find(".option-select").hide();

});
$(".cmp-links .link").on({
    "mouseover": function () {
        $(this).find('.link__icon').attr("src", $(this).data("srchover"));
    },
    "mouseout": function () {
        $(this).find('.link__icon').attr("src", $(this).data("src"));
    }
});


/**********************/
/* WEB COMPONENT NEWS */
/**********************/
var $windownews = $(window);
var breakpointNews = 768;
// Checking screen size
function checkWidthNews() {
    var windowsize = $windownews.width();
    $(".cmp-news .news-image").each(function (index) {
        // Toogle image desktop - mobile
        if ($(this).data("imgmobile")) {
            if (windowsize < breakpointNews) {
                $(this).css('background-image', 'url(' + $(this).data("imgmobile") + ')');
            }
            else {
                $(this).css('background-image', 'url(' + $(this).data("image") + ')');
            }
        }
    });
}
// Execute on load
checkWidthNews();
// Bind event listener
$(window).resize(checkWidthNews);
// Hover on icons
$(".cmp-news .news-card-icon").on({
    "mouseover": function () {
        $(this).attr("src", $(this).data("srchover"));
    },
    "mouseout": function () {
        $(this).attr("src", $(this).data("src"));
    }
});