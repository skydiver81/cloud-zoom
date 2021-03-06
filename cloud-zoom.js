//////////////////////////////////////////////////////////////////////////////////
// Cloud Zoom V1.0.2
// (c) 2010 by R Cecco. <http://www.professorcloud.com>
// MIT License
//
// Please retain this copyright header in all versions of the software
//////////////////////////////////////////////////////////////////////////////////
(function($) {

    var hqImageContainer = $('#hqImageContainer');
    var hqImage = hqImageContainer.find('img');
    var initialMaxWidth = parseInt(hqImageContainer.css('max-width'));
    var initialMaxHeight = initialMaxWidth;
    var hqImageSrc = $('#morePicsContainer').find('li.pic > a');
    var hqImages = {};
    var iSlideWrapperPos = 0;

    // $(document).ready(function () {
    //     $('.cloud-zoom, .cloud-zoom-gallery').CloudZoom();
    // });

    function format(str) {
        for (var i = 1; i < arguments.length; i++) {
            str = str.replace('%' + (i - 1), arguments[i]);
        }
        return str;
    }

    function CloudZoom(jWin, opts) {
        var sImg = $('img', jWin);
        var img1;
        var img2;
        var zoomDiv = null;
        var $mouseTrap = null;
        var lens = null;
        var $tint = null;
        var softFocus = null;
        var $ie6Fix = null;
        var zoomImage;
        var controlTimer = 0;
        var cw, ch;
        var destU = 0;
        var destV = 0;
        var currV = 0;
        var currU = 0;
        var filesLoaded = 0;
        var mx,
                my;
        var ctx = this, zw;

        // Display an image loading message. This message gets deleted when the images have loaded and the zoom init function is called.
        // We add a small delay before the message is displayed to avoid the message flicking on then off again virtually immediately if the
        // images load really fast, e.g. from the cache.
        //var    ctx = this;
        setTimeout(function() {

            if ($mouseTrap === null) {
                var w = jWin.width();
                var tagetW = sImg.width() + "px";
                var targetH = sImg.height() + "px";
                var targetLeft = sImg.position().left + "px";
                var targetTop = sImg.position().top + "px";
                //jWin.parent().append(format('<div style="width:' + tagetW + ';height:' + targetH + ';position:absolute;top:' + targetTop + ';left:' + targetLeft + ';text-align:center" class="cloud-zoom-loading" >' + opts.loadingText + '</div>', w / 3, (w / 2) - (w / 6))).find(':last').css('opacity', 0.5);
            }
        }, 200);


        var ie6FixRemove = function() {

            if ($ie6Fix !== null) {
                $ie6Fix.remove();
                $ie6Fix = null;
            }
        };

        // Removes cursor, tint layer, blur layer etc.
        this.removeBits = function() {
            //$mouseTrap.unbind();
            if (lens) {
                lens.remove();
                lens = null;
            }
            if ($tint) {
                $tint.remove();
                $tint = null;
            }
            if (softFocus) {
                softFocus.remove();
                softFocus = null;
            }
            ie6FixRemove();

            $('.cloud-zoom-loading', jWin.parent()).remove();
        };


        this.destroy = function() {
            jWin.data('zoom', null);

            if ($mouseTrap) {
                $mouseTrap.unbind();
                $mouseTrap.remove();
                $mouseTrap = null;
            }
            if (zoomDiv) {
                zoomDiv.remove();
                zoomDiv = null;
            }
            //ie6FixRemove();
            this.removeBits();
            // DON'T FORGET TO REMOVE JQUERY 'DATA' VALUES
        };


        // This is called when the zoom window has faded out so it can be removed.
        this.fadedOut = function() {

            if (zoomDiv) {
                zoomDiv.remove();
                zoomDiv = null;
            }
            this.removeBits();
            //ie6FixRemove();
        };

        this.controlLoop = function() {
            if (lens) {
                var x = (mx - sImg.offset().left - (cw * 0.5)) >> 0;
                var y = (my - sImg.offset().top - (ch * 0.5)) >> 0;

                if (x < 0) {
                    x = 0;
                }
                else if (x > (sImg.outerWidth() - cw)) {
                    x = (sImg.outerWidth() - cw);
                }
                if (y < 0) {
                    y = 0;
                }
                else if (y > (sImg.outerHeight() - ch)) {
                    y = (sImg.outerHeight() - ch);
                }


                if (opts.centerXY) {
                    lens.css({
                        left: x + sImg.position().left,
                        top: y + sImg.position().top
                    });
                } else {
                    lens.css({
                        left: x,
                        top: y
                    });
                }


                lens.css('background-position', (-x) + 'px ' + (-y) + 'px');

                destU = (((x) / sImg.outerWidth()) * zoomImage.width) >> 0;
                destV = (((y) / sImg.outerHeight()) * zoomImage.height) >> 0;
                currU += (destU - currU) / opts.smoothMove;
                currV += (destV - currV) / opts.smoothMove;

                zoomDiv.css('background-position', (-(currU >> 0) + 'px ') + (-(currV >> 0) + 'px'));
            }
            controlTimer = setTimeout(function() {
                ctx.controlLoop();
            }, 30);
        };

        this.init2 = function(img, id) {

            filesLoaded++;

            if (id === 1) {
                zoomImage = img;
            }
            //this.images[id] = img;
            if (filesLoaded === 2) {
                this.init();
            }
        };

        /* Init function start.  */
        this.init = function() {

            var setNavElemStates = function(){

                var cntSlides = hqImageSrc.size();

                if(iSlideWrapperPos == 0){
                    navLeft.hide();
                    if(cntSlides > 1){
                        navRight.show();
                    } else {
                        navRight.hide();
                    }
                }

                if(iSlideWrapperPos > 0){
                    navLeft.show();
                    if(iSlideWrapperPos < (cntSlides - 1)){
                        navRight.show();
                    } else {
                        navRight.hide();
                    }
                }
            };

            var sliderNavigate = function(direction){

                var cntSlides = hqImageSrc.size();
                var leftMargin = 0;

                if(cntSlides > 1) {
                    if(direction == 'left'){
                        if(iSlideWrapperPos > 0 ){
                            leftMargin = (( iSlideWrapperPos - 1 ) * initialMaxWidth) * -1;
                            $('.slide-wrapper').stop().animate({marginLeft: leftMargin}, 500);
                            iSlideWrapperPos--;
                        }
                    } else if(direction == 'right'){
                        if((iSlideWrapperPos + 1) < cntSlides){
                            leftMargin = (( iSlideWrapperPos + 1 ) * initialMaxWidth) * -1;
                            $('.slide-wrapper').stop().animate({marginLeft: leftMargin}, 500);
                            iSlideWrapperPos++;
                        }
                    }
                    setNavElemStates();
                }
            };

            var oldImgCnt = hqImageSrc.size();
            hqImageSrc = $('#morePicsContainer').find('li.pic > a');
            if( hqImageSrc.size() != oldImgCnt){
                iSlideWrapperPos = 0;
            }



            hqImageContainer.css('max-width','0px').show();

            // Remove loading message (if present);
            $('.cloud-zoom-loading', jWin.parent()).remove();

            /*
             * initialize hqImage objects
             * */

            $('.slide-wrapper').empty();

            $.each(hqImageSrc, function(index, elem){

                hqImages[index] = $(elem).attr('href');
                $('.slide-wrapper').append('<div><img src="' + $(elem).attr('href') + '" /></div>');
            });

            var slidePos = (((iSlideWrapperPos + 1) * initialMaxWidth) * -1) + initialMaxWidth;

            $('.slide-wrapper').css({
                'height': initialMaxHeight + 'px',
                'width': (initialMaxWidth * hqImageSrc.size())  + 'px',
                'margin-left': slidePos + 'px'
            });

            var navLeft = $('<div class="hqImageNav navLeft"><a><i class="fa fa-angle-left"></i></a></div>');
            var navRight = $('<div class="hqImageNav navRight"><a><i class="fa fa-angle-right"></i></a></div>');

            navLeft.bind('click', function(){
                sliderNavigate('left');
            });
            navRight.bind('click', function(){
                sliderNavigate('right');
            });

            setNavElemStates();

            $(document).keydown(function(e){

                if(hqImageContainer.outerWidth() && (e.which == 37 || e.which == 39 || e.which == 27)){
                    switch(e.which) {
                        case 37:
                            sliderNavigate('left');
                            break;
                        case 39:
                            sliderNavigate('right');
                            break;
                        case 27:
                            if (hqImageContainer.width() > 0 ) {
                                hqImageContainer.animate({
                                    maxHeight: 0,
                                    maxWidth: 0
                                }, 200);
                            }
                            break;
                    }
                }
            });

            /* Add a box (mouseTrap) over the small image to trap mouse events.
            It has priority over zoom window to avoid issues with inner zoom.
            We need the dummy background image as IE does not trap mouse events on
            transparent parts of a div.
            */
            if (opts.centerXY) {
                var positionAdj_x = sImg.position().left + "px";
                var positionAdj_y = sImg.position().top + "px";
            } else {
                var positionAdj_x = "%2px";
                var positionAdj_y = "%3px";
            }
            $mouseTrap = jWin.parent().append(format("<div class='mousetrap' style='background-image:url(\"" + opts.trImg + "\");z-index:999;position:absolute;width:%0px;height:%1px;left:" + "0px" + ";top:" + positionAdj_y + ";\'></div>", sImg.outerWidth(), sImg.outerHeight(), 0, 0)).find(':last');
            //////////////////////////////////////////////////////////////////////
            /* Do as little as possible in mousemove event to prevent slowdown. */
            $mouseTrap.bind('mousemove', this, function(event) {
                // Just update the mouse position
                mx = event.pageX;
                my = event.pageY;
            });
            //////////////////////////////////////////////////////////////////////
            $mouseTrap.bind('mouseleave', this, function(event) {
                clearTimeout(controlTimer);
                //event.data.removeBits();
                if (lens) {
                    lens.fadeOut(299);
                }
                if ($tint) {
                    $tint.fadeOut(299);
                }
                if (softFocus) {
                    softFocus.fadeOut(299);
                }
                zoomDiv.fadeOut(300, function() {
                    ctx.fadedOut();
                });
                return false;
            });


            $mouseTrap.bind('click', this, function(event) {

                var jWinContainer = jWin.parent();
                hqImageContainer = $('#hqImageContainer');

                if($('.hqImageNav').size() == 0) {
                    hqImageContainer.prepend(navRight).prepend(navLeft);
                }

                hqImage.css({maxHeight: 0, maxWidth: 0});
                hqImage.attr('src', zoomImage.src);
                hqImageContainer.css('max-width','0px').show();

                $('#cloud-zoom-big').hide();

                hqImageContainer.stop().animate({
                        maxHeight: initialMaxHeight,
                        maxWidth: initialMaxWidth
                    },
                    800
                );

                // Hide preview on click
                $(document).bind('click', this, function(e) {

                    var isImageTarget = $(e.target).parents('.slide-wrapper').length;
                    var isImageNavTarget = $(e.target).parents('.hqImageNav').length;

                    if (hqImageContainer.width() > 0 &&
                        !$(e.target).hasClass('mousetrap') &&
                        !isImageTarget && !isImageNavTarget) {
                            hqImageContainer.animate({
                                maxHeight: 0,
                                maxWidth: 0
                            }, 200);
                    }
                });

            });

            //////////////////////////////////////////////////////////////////////
            $mouseTrap.bind('mouseenter', this, function(event) {
                mx = event.pageX;
                my = event.pageY;
                zw = event.data;
                if (zoomDiv) {
                    zoomDiv.stop(true, false);
                    zoomDiv.remove();
                }

                var xPos = opts.adjustX,
                        yPos = opts.adjustY;

                var siw = sImg.outerWidth();
                var sih = sImg.outerHeight();

                var w = opts.zoomWidth;
                var h = opts.zoomHeight;
                if (opts.zoomWidth == 'auto') {
                    w = siw;
                }
                if (opts.zoomHeight == 'auto') {
                    h = sih;
                }
                //$('#info').text( xPos + ' ' + yPos + ' ' + siw + ' ' + sih );
                var appendTo = jWin.parent(); // attach to the wrapper

                switch (opts.position) {
                    case 'top':
                        yPos -= h; // + opts.adjustY;
                        break;
                    case 'right':
                        xPos += siw; // + opts.adjustX;
                        break;
                    case 'bottom':
                        yPos += sih; // + opts.adjustY;
                        break;
                    case 'left':
                        xPos -= w; // + opts.adjustX;
                        break;
                    case 'inside':
                        w = siw;
                        h = sih;
                        break;
                        // All other values, try and find an id in the dom to attach to.
                    default:
                        appendTo = $('#' + opts.position);
                        // If dom element doesn't exit, just use 'right' position as default.
                        if (!appendTo.length) {
                            appendTo = jWin;
                            xPos += siw; //+ opts.adjustX;
                            yPos += sih; // + opts.adjustY;
                        } else {
                            w = appendTo.innerWidth();
                            h = appendTo.innerHeight();
                        }
                }

                zoomDiv = appendTo.append(format('<div id="cloud-zoom-big" class="cloud-zoom-big" style="display:none;position:absolute;left:' + opts.fixZoomWindow + 'px;top:%1px;width:%2px;height:%3px;background-image:url(\'%4\');z-index:99;"></div>', xPos, yPos, w, h, zoomImage.src)).find(':last');

                // Add the title from title tag.
                if (sImg.attr('title') && opts.showTitle) {
                    zoomDiv.append(format('<div class="cloud-zoom-title">%0</div>', sImg.attr('title'))).find(':last').css('opacity', opts.titleOpacity);
                }

                // Fix ie6 select elements wrong z-index bug. Placing an iFrame over the select element solves the issue...
                if ($.browser.msie && $.browser.version < 7) {
                    $ie6Fix = $('<iframe frameborder="0" src="#"></iframe>').css({
                        position: "absolute",
                        left: xPos,
                        top: yPos,
                        zIndex: 99,
                        width: w,
                        height: h
                    }).insertBefore(zoomDiv);
                }

                zoomDiv.fadeIn(500);

                if (lens) {
                    lens.remove();
                    lens = null;
                } /* Work out size of cursor */
                cw = (sImg.outerWidth() / zoomImage.width) * zoomDiv.width();
                ch = (sImg.outerHeight() / zoomImage.height) * zoomDiv.height();

                // Attach mouse, initially invisible to prevent first frame glitch
                lens = jWin.append(format("<div class = 'cloud-zoom-lens' style='display:none;z-index:98;position:absolute;width:%0px;height:%1px;'></div>", cw, ch)).find(':last');

                $mouseTrap.css('cursor', lens.css('cursor'));

                var noTrans = false;

                // Init tint layer if needed. (Not relevant if using inside mode)
                if (opts.tint) {
                    lens.css('background', 'url("' + sImg.attr('src') + '")');
                    $tint = jWin.append(format('<div style="display:none;position:absolute; left:0px; top:0px; width:%0px; height:%1px; background-color:%2;" />', sImg.outerWidth(), sImg.outerHeight(), opts.tint)).find(':last');
                    $tint.css('opacity', opts.tintOpacity);
                    noTrans = true;
                    $tint.fadeIn(500);

                }
                if (opts.softFocus) {
                    lens.css('background', 'url("' + sImg.attr('src') + '")');
                    softFocus = jWin.append(format('<div style="position:absolute;display:none;top:2px; left:2px; width:%0px; height:%1px;" />', sImg.outerWidth() - 2, sImg.outerHeight() - 2, opts.tint)).find(':last');
                    softFocus.css('background', 'url("' + sImg.attr('src') + '")');
                    softFocus.css('opacity', 0.5);
                    noTrans = true;
                    softFocus.fadeIn(500);
                }

                if (!noTrans) {
                    lens.css('opacity', opts.lensOpacity);
                }
                if (opts.position !== 'inside') {
                    lens.fadeIn(500);
                }

                // Start processing.
                zw.controlLoop();

                return; // Don't return false here otherwise opera will not detect change of the mouse pointer type.
            });
        };

        img1 = new Image();
        $(img1).load(function() {
            ctx.init2(this, 0);
        });
        img1.src = sImg.attr('src');

        img2 = new Image();
        $(img2).load(function() {
            ctx.init2(this, 1);
        });
        img2.src = jWin.attr('href');
    }

    $.fn.CloudZoom = function(options) {
        // IE6 background image flicker fix
        try {
            document.execCommand("BackgroundImageCache", false, true);
        } catch (e) {
        }
        this.each(function() {
            var relOpts, opts;
            // Hmm...eval...slap on wrist.
            eval('var    a = {' + $(this).attr('rel') + '}');
            relOpts = a;
            if ($(this).is('.cloud-zoom')) {
                $(this).css({
                    'position': 'relative',
                    'display': 'block'
                });
                $('img', $(this)).css({
                    'display': 'inline-block'
                });
                // Wrap an outer div around the link so we can attach things without them becoming part of the link.
                // But not if wrap already exists.
                if ($(this).parent().attr('id') != 'wrap' && $(this).parent().attr('class') != 'imgwrapper') {
                    $(this).wrap('<div id="wrap" style="top:0px;z-index:99;position:relative;"></div>');
                }
                opts = $.extend({}, $.fn.CloudZoom.defaults, options);
                opts = $.extend({}, opts, relOpts);
                $(this).data('zoom', new CloudZoom($(this), opts));

            } else if ($(this).is('.cloud-zoom-gallery')) {
                opts = $.extend({}, relOpts, options);
                $(this).data('relOpts', opts);
                $(this).bind('mouseenter mouseleave click', $(this), function(event) {
                    $('.preview #imageDescription').hide();
                    var data = event.data.data('relOpts');
                    // Destroy the previous zoom
                    $('#' + data.useZoom).data('zoom').destroy();
                    var $sPicDesc = "";
                    var $sPicDesc = $(this).children('figure').children('figcaption').html();
                    $('.preview #imageDescription').html($sPicDesc);
                    if ($sPicDesc != ""){
                        $('.preview #imageDescription').show();
                    }
                    // Change the biglink to point to the new big image.
                    $('#' + data.useZoom).attr('href', event.data.attr('href'));
                    // Change the small image to point to the new small image.
                    $('#' + data.useZoom + ' img').attr('src', event.data.data('relOpts').smallImage);

                    iSlideWrapperPos = $('.otherPictures li.pic').index($(this).parent());

                    // Init a new zoom with the new images.
                    $('#' + event.data.data('relOpts').useZoom).CloudZoom();
                    return false;
                });
            }
        });
        return this;
    };

    $.fn.CloudZoom.defaults = {
        zoomWidth: '358',
        zoomHeight: '356',
        position: 'right',
        tint: false,
        tintOpacity: 0.5,
        lensOpacity: 0.5,
        softFocus: false,
        smoothMove: 3,
        showTitle: true,
        titleOpacity: 0.5,
        adjustX: 0,
        adjustY: '-1',
        centerXY: true,
        loadingText: 'Loading...',
        fixZoomWindow: '374',
        trImg: '.'
    };

})(jQuery);
