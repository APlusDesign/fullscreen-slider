// TODO: add a pre-load images option
// TODO: look at removing the first image logic in start() and push it into goTo
// TODO: pausing on hover of thumbnails if in autoplay

;(function ( $, window, document, undefined ) {

	// Create the defaults once
	var 
		$this = null,
		pluginName = "fullscreenSlider",
		defaults = {
			autoPlayState	: false,
			autoPlayTime 	: 4,
			alignIMG 		: '',
			boundary 		: $(window),
			startAtSlide 	: 0
		};
	
	// The actual plugin constructor
	function FullscreenSlider ( element, options ) {
		$this 			= this;
		this.element 	= element;
		this.obj 		= $(this.element);
		this.options 	= $.extend( {}, defaults, options );
		this.defaults 	= defaults;
		this.name 		= pluginName;
		init();
	}


	/******************* 
	 Private methods 
	  	There is simply no need to expose these
	*/	

	var init = function() {
		setElements();
		setEvents();
		start();
	}

	var setElements = function()
	{
		var lookIn 			= $this.obj;
		$this.image 		= $('<img class="topImg">');
		$this.lastImage		= null;
		$this.imageHolder 	= $(".image-holder", lookIn);
		$this.descriptions 	= $(".content-holder>li", lookIn); 	
 		$this.thumbsHolder 	= $('<ul class="thumb-holder"></ul>');
 		$this.spinner 		= createSpinner();
		$this.currImg 		= checkIndex();
		$this.prevImg 		= null;
		$this.loadComplete 	= true;
		$this.autoPlayTimer;	
		// This is actually very important
		makeBoundary();
		
	};


	var setEvents = function()
	{
		// On first image load, remove loader, show image, trigger resize
		$this.image.bind("load", firstImage);

		// Bind the resize window event
		$(window).on('resize.fullscreenSlider', function () {
			$this.resizeImageHandler();
		})
	};

	var start = function()
	{
		// Create a loading spinner while first image loads
		$this.loading();

		// Begin loading the first image
		var source = $this.descriptions.eq($this.currImg);
		$this.image.attr({
			'src': source.data('image'),
			'alt': source.data('alt')
		});

		// Show the description for image 1
		$this.descriptions.not($this.currImg).css({left:$this.options.boundary.width(), display:"none"});
		source.css({left:0, display:"block"});

		// Build the thumbnails now but don't show them until the first image has loaded.
		buildThumbnails();
	};

	var firstImage = function() 
	{
		// Unloading animation
		$this.unloading();
		// Append the image and fade it in
		$this.imageHolder.append($this.image.css('opacity', 0).animate({opacity:1}, 1500, "easeInOutCubic"));
		// Show the thumbnail menu
		$this.thumbsHolder.animate({opacity:1}, 1500, "easeInOutCubic");
		// Make sure sizing is correct
		$(window).trigger('resize');
		// Auto play
		autoPlayHandler();
	}

	var autoPlayHandler = function()
	{
		$this.autoPlayTimer = setTimeout(function(){
			if($this.options.autoPlayState){
				$this.goTo($this.currImg+1);
			}
		}, $this.options.autoPlayTime*1000);
	}

	var buildThumbnails = function() 
	{	
		var tmp = $this.descriptions;
		if(tmp.length!=0){
			//$("#inner").bind("mousemove", function(e){mouseMove(e)})
			//$("#inner").bind("mouseleave", stopPreviewPosition)
			tmp.each(function(){
				// thumbsHolder is not in the dom yet, so this approach is perfectly fine!		
				$this.thumbsHolder.append($('<li></li>').append(createThumb()));
			})
			// Append thumbs into the slider object
			$this.obj.append($this.thumbsHolder);
			// Activate first thumb
			thumbHandler($this.returnCurrentThumbnail());
		}
	}
	
	var makeBoundary = function()
	{
		if($this.options.boundary[0] === window) {
			// Since we can't apply css to the window apply overflow hidden to body
			$(document.body).css({
				'overflow':'hidden'
			})
		} else {
			$this.options.boundary.css({
				'overflow':'hidden'
			})
		}
	};
	
	/* Helpers */
	var hoverHandler = function(obj, off) 
	{
		if($(obj).parent().index()!=$this.currImg){
			thumbHandler(obj, off);
		}
	}
	var thumbHandler = function(obj, off) 
	{
		var arr = [{opacity:1}, false];
		if(off) {
			arr.reverse();
		} 
		aniHelper($(".fs-btn-over", obj), arr[0])
		aniHelper($(".fs-btn-out", obj), arr[1])
	}
	var aniHelper = function(obj, style, stop, time) 
	{
		var 
			delta 	= (time || 600),
			css 	= (style || {opacity:0}),
			bool 	= (stop || false);

		obj.stop(bool).animate(css, delta, "easeInOutCubic");	
	}
	var checkIndex = function() 
	{
		var index = $this.options.startAtSlide;
		if(index >= $this.descriptions.length || !$.isNumeric(index)) {
			talk('Invalid index, reset to slide 0');
			index = 0;
		}
		return index;
	}
	var talk = function(str) {
		if($('#console').length) {
			$('#console').prepend($('<p></p>').html(pluginName + ' :: ' + str))
		}
	}
	/* Factory functions */
	var createSpinner = function() 
	{
		return $('<div class="imgSpinner"></div>');
	}
	var createBtn = function(flag, css) 
	{
		return $('<div class="fs-btn"></div>').addClass('fs-btn-'+flag).css((css||{}));
	}
	var createThumb = function() 
	{
		return $('<a href="#"></a>')
					.click(
						function(e){
							e.preventDefault();
							$this.goTo($(this).parent().index());
							return false;			
						}
					)
					.hover(
						function(){
							hoverHandler(this);
						},
						function(){
							hoverHandler(this, true);
						}
					)
					.append(createBtn('over', {opacity:0}))
					.append(createBtn('out'));
	}


	/*******************/
	/* Public Methods */

	FullscreenSlider.prototype.changeImageHandler = function()
	{
		var source = this.descriptions.eq(this.currImg);

		this.loadComplete = false;
		this.loading();	
		this.lastImage = this.image;

		this.image = $("<img class='bottomImg' src='"+source.data("image")+"' alt='"+(source.data("alt") || '')+"'>").bind("load", this.loadImageHandler);
		this.imageHolder.append(this.image);
		
		var boundary = this.options.boundary.width();
		source.css({left:boundary, display:"block"}).animate({left:0}, 1000, "easeOutCubic");
		this.descriptions.eq(this.prevImg).animate({left:-boundary}, 500, "easeInCubic", function(){
			$(this).css({display:"none"})
		});
	}	

	FullscreenSlider.prototype.loadImageHandler = function()
	{
		setTimeout(function(){
			// Unloading animation
			$this.unloading();
			// New image
			$this.image.unbind("load", this.loadImageHandler);
			$this.resizeImageHandler();
			$this.lastImage.stop().animate({opacity:"0"}, 1000, "easeInOutCubic", function(){
				$(this).remove();
				$this.image.removeClass("bottomImg").addClass("topImg");
				$this.loadComplete = true;
				autoPlayHandler();
			})
		}, 1000)
	}

	FullscreenSlider.prototype.resizeImageHandler = function()
	{
		var 
			imageDeltaX,
			imageDeltaY,
			boundary 		= this.options.boundary,
			image 			= this.image,
			imageK  		= image.height()/image.width(),
			holderK 		= boundary.height()/boundary.width(),
			imagePercent 	= imageK*100;
		console.log(boundary)
		if(holderK>imageK){
			imagePercent = (image.width()/image.height())*100;
			this.image.css({height:boundary.height(), width:(boundary.height()*imagePercent)/100});
		}else{
			imagePercent = (image.height()/image.width())*100;
			this.image.css({width:boundary.width(), height:(boundary.width()*imagePercent)/100});
		}
		switch(this.options.alignIMG){
			case "top":
				imageDeltaX=-(image.width()-boundary.width())/2;
				imageDeltaY=0;
			break;
			case "bottom":
				imageDeltaX=-(image.width()-boundary.width())/2;
				imageDeltaY=-(image.height()-boundary.height());
			break;
			case "right":
				imageDeltaX=-(image.width()-boundary.width());
				imageDeltaY=-(image.height()-boundary.height())/2;
			break;
			case "left":
				imageDeltaX=0;
				imageDeltaY=-(image.height()-boundary.height())/2;
			break;
			case "top_left":
				imageDeltaX=0;
				imageDeltaY=0;
			break;
			case "top_right":
				imageDeltaX=-(image.width()-boundary.width());
				imageDeltaY=0;
			break;
			case "bottom_right":
				imageDeltaX=-(image.width()-boundary.width());
				imageDeltaY=-(image.height()-boundary.height());
			break;
			case "bottom_left":
				imageDeltaX=0;
				imageDeltaY=-(image.height()-boundary.height());
			break;
			default:
				imageDeltaX=-(image.width()-boundary.width())/2;
				imageDeltaY=-(image.height()-boundary.height())/2;
		}
		this.image.css({left:imageDeltaX, top:imageDeltaY, position:"absolute"});
	}

	FullscreenSlider.prototype.goTo = function(index) 
	{
		var newIndex = parseInt(index);
		if (!$.isNumeric(index) || newIndex >= this.descriptions.length ) {
			talk('Invalid index, reset to slide 0')
			newIndex = 0;
		}
		if(!this.loadComplete) {
			talk('Still loading the other slide')
			return false;
		}
		if(newIndex != this.currImg){
			
			// Remove old thumbs styles
			thumbHandler(this.returnCurrentThumbnail(), true);

			this.prevImg = this.currImg;
			this.currImg = newIndex;

			// Add new thumbs styles
			var currentThumb = this.returnCurrentThumbnail();
			thumbHandler(currentThumb);

			clearTimeout(this.autoPlayTimer);
			this.changeImageHandler();
			return this;
		} else {
			talk('You can not reload the same index')
			return false;
		}
	}


	FullscreenSlider.prototype.goToNext = function() 
	{
		var index = this.currImg+1;
		if(index >= this.descriptions.length) {
			index = 0;
		}
		return this.goTo(index);
	}

	FullscreenSlider.prototype.goToPrev = function() 
	{
		var index = this.currImg-1;
		if(index < 0) {
			index = this.descriptions.length-1;
		}
		return this.goTo(index);
	}

	FullscreenSlider.prototype.play = function() 
	{
		this.options.autoPlayState = true;
		autoPlayHandler();
		talk('Auto play started');
		return this;
	}

	FullscreenSlider.prototype.stop = function() 
	{
		this.options.autoPlayState = false;
		clearTimeout(this.autoPlayTimer);
		talk('Auto play stopped');
		return this;
	}

	FullscreenSlider.prototype.loading = function()
	{
		this.obj.append(
			this.spinner
			.css({opacity:0})
			.stop()
			.animate({opacity:1}, 600, "easeInOutCubic")
		);
	}

	FullscreenSlider.prototype.unloading = function()
	{
		var spinner = this.spinner;
		spinner.animate({opacity:0}, 600, "easeInOutCubic", function(){
			spinner.remove();
		});
	}
	
	FullscreenSlider.prototype.returnCurrentThumbnail = function(index) 
	{
		var newIndex = ($.isNumeric(index) ? parseInt(index) : this.currImg);
		return $("li", this.thumbsHolder).eq(newIndex);
	}

	FullscreenSlider.prototype.getCurrentSlide = function() 
	{
		talk('Current slide is ' + this.currImg)
		return this.currImg;
	}

	
	// Constructor
	$.fn[ pluginName ] = function ( options ) {
		return this.each(function() {
			if ( !$.data( this, pluginName ) ) {
				$.data( this, pluginName, new FullscreenSlider( this, options ) );
			}
		});
	};

})( jQuery, window, document );