// TODO: add a pre-load images option, which defeats the sliders purpose, but hey...
// TODO: I should probably un-zero index the slides, but seriously...

;(function ( $, window, document, undefined ) {

	// Create the defaults once ever
	var 
		pluginName = "fullscreenSlider",
		defaults = {
			autoPlayState	: false,
			autoPlayTime 	: 4,
			alignIMG 		: '',
			boundary 		: $(window),
			startAtSlide 	: 0,
			pauseNewImage	: 0,
			hideThumbs 		: false
		};
	
	// The actual plugin constructor
	function FullscreenSlider ( element, options ) {
		this.element 	= element;
		this.obj 		= $(this.element);
		this.options 	= $.extend( {}, defaults, options );
		this.defaults 	= defaults;
		this.name 		= pluginName;
		this.init();
	}

	FullscreenSlider.prototype.init = function() {
		this.makeBoundary();
		this.setElements();
		if(this.descriptions.length) {
			this.setEvents();
			this.start();
		} else {
			talk('There are no description elements');
			talk('Has not been started');
			return false;
		}	
	}

	FullscreenSlider.prototype.setElements = function()
	{
		this.image 			= $('<div class="topImg loading-placeholder"></div>');
		this.lastImage		= false;
		this.imageHolder 	= $(".image-holder", this.obj).append(this.image);
		this.descriptions 	= $(".content-holder>li", this.obj); 	
 		this.thumbsHolder 	= $('<ul class="thumb-holder"></ul>');
 		this.spinner 		= createSpinner();
		this.currImg 		= this.checkIndex();
		this.prevImg 		= null;
		this.loadComplete 	= true;
		this.autoPlayTimer;	
	};

	FullscreenSlider.prototype.setEvents = function()
	{
		var $this = this;
		// Bind the resize window event
		$(window).on('resize.fullscreenSlider', function () {
			$this.resizeImageHandler();
		})
	};

	FullscreenSlider.prototype.start = function()
	{
		// Create a loading spinner while first image loads
		this.loading();
		// Hide all descriptions
		this.descriptions.css({left:this.options.boundary.width(), display:"none"});
		// Go to the specified slide
		this.goTo(this.currImg);
		// On first load, there is a little logic
		this.image.bind("load", this.firstLoad.bind(this));
		// Build the thumbnails now, but don't show them until this image has loaded.
		this.buildThumbnails();
	};

	FullscreenSlider.prototype.firstLoad = function() 
	{
		if(!this.options.hideThumbs) {
			this.thumbsHolder.animate({opacity:1}, 1000, "easeInOutCubic");
		} else {
			this.thumbsHolder.css({'display':'none'})
		}
	}

	FullscreenSlider.prototype.autoPlayHandler = function()
	{
		var $this = this;
		this.autoPlayTimer = setTimeout(function(){
			if($this.options.autoPlayState){
				$this.goTo($this.currImg+1);
			}
		}, this.options.autoPlayTime*1000);
	}

	FullscreenSlider.prototype.buildThumbnails = function() 
	{	
		var 
			$this = this,
			tmp = this.descriptions;
		if(tmp.length!=0){
			//$("#inner").bind("mousemove", function(e){mouseMove(e)})
			//$("#inner").bind("mouseleave", stopPreviewPosition)
			tmp.each(function(){
				// thumbsHolder is not in the dom yet, so this approach is perfectly fine!		
				$this.thumbsHolder.append($('<li></li>').append($this.createThumb()));
			})
			// Append thumbs into the slider object
			this.obj.append(this.thumbsHolder);
			// Activate first thumb
			thumbHandler(this.returnCurrentThumbnail());
		}
	}
	
	FullscreenSlider.prototype.makeBoundary = function()
	{
		if(this.options.boundary[0] === window) {
			// Since we can't apply css to the window apply overflow hidden to body
			$(document.body).css({
				'overflow':'hidden'
			})
		} else {
			this.options.boundary.css({
				'overflow':'hidden'
			})
		}
	};
	
	FullscreenSlider.prototype.hoverHandler = function(obj, off) 
	{
		if($(obj).parent().index()!=this.currImg){
			thumbHandler(obj, off);
		}
	}
	
	FullscreenSlider.prototype.checkIndex = function() 
	{
		var index = this.options.startAtSlide;
		if(index >= this.descriptions.length || !$.isNumeric(index)) {
			talk('Invalid index');
			index = 0;
		}
		return index;
	}
	
	FullscreenSlider.prototype.createThumb = function() 
	{	
		var $this = this;
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
							$this.hoverHandler(this);
						},
						function(){
							$this.hoverHandler(this, true);
						}
					)
					.append(createBtn('over', {opacity:0}))
					.append(createBtn('out'));
	}


	/******************* 
	 Private methods 
	  	There is simply no need to expose these
	*/
	var createSpinner = function() 
	{
		return $('<div class="imgSpinner"></div>');
	}
	var createBtn = function(flag, css) 
	{
		return $('<div class="fs-btn"></div>').addClass('fs-btn-'+flag).css((css||{}));
	}
	var talk = function(str) {
		if($('#console').length) {
			$('#console').prepend($('<p></p>').html(pluginName + ' :: ' + str))
		}
	}
	var aniHelper = function(obj, style, stop, time) 
	{
		var 
			delta 	= (time || 600),
			css 	= (style || {opacity:0}),
			bool 	= (stop || false);

		obj.stop(bool).animate(css, delta, "easeInOutCubic");	
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



	/*******************/
	/* Public Methods */

	FullscreenSlider.prototype.changeImageHandler = function()
	{
		var 
			source = this.descriptions.eq(this.currImg),
			boundaryWidth = this.options.boundary.width();

		// Set loading visual and bool
		this.loadComplete = false;
		this.loading();
		// Remove the current description and animate in the new one
		if(this.lastImage) {
			this.descriptions.eq(this.prevImg).animate({left:-boundaryWidth}, 500, "easeInCubic", function(){
				$(this).css({display:"none"})
			});
		}
		source.css({left:boundaryWidth, display:"block"}).animate({left:0}, 1000, "easeOutCubic");
		// Save copy of current image	
		this.lastImage = this.image;
		// Create new image
		this.image = $("<img class='bottomImg' src='"+source.data("image")+"' alt='"+(source.data("alt") || '')+"'>").bind("load", this.loadImageHandler.bind(this));
		// Append new image
		this.imageHolder.append(this.image);
	}	

	FullscreenSlider.prototype.loadImageHandler = function()
	{
		var $this = this;
		setTimeout(function(){
			$this.unloading();
			$this.image.unbind("load", $this.loadImageHandler);
			$this.resizeImageHandler();
			$this.lastImage.stop().animate({opacity:"0"}, 1000, "easeInOutCubic", function(){
				$(this).remove();
				$this.image.removeClass("bottomImg").addClass("topImg");
				$this.loadComplete = true;
				$this.autoPlayHandler();
			})
		}, this.options.pauseNewImage*1000)
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
			talk('Invalid index, showing slide 0')
			newIndex = 0;
		}
		if(!this.loadComplete) {
			talk('Still loading slide ' + this.currImg)
			return false;
		}
		if(newIndex != this.currImg || !this.lastImage){
			// Remove old thumbs styles
			thumbHandler(this.returnCurrentThumbnail(), true);
			// Swap the index's
			this.prevImg = this.currImg;
			this.currImg = newIndex;
			// Add new thumbs styles
			thumbHandler(this.returnCurrentThumbnail());
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
		this.autoPlayHandler();
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