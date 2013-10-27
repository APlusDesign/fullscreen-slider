// TODO: resume autoplay on click of a thumb
// TODO: add a pre-load images switch

;(function ( $, window, document, undefined ) {

	// Create the defaults once
	var 
		$this = null,
		pluginName = "fullscreenSlider",
		defaults = {
			autoPlayState	: false,
			autoPlayTime 	: 4,
			alignIMG 		: "center",
			boundary 		: $(document),
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
		$this.discription 	= $(".content-holder>li", lookIn); 	// I know it's misspelt, but in IE its a reserved word :p
 		$this.thumbsHolder 	= $(".thumb-holder", lookIn);
 		$this.imageSRCLink 	= $("li>a", $this.thumbsHolder);
 		$this.spinner 		= createSpinner();
		$this.currImg 		= checkIndex();
		$this.prevImg 		= null;
		$this.loadComplete 	= true;
		$this.autoPlayTimer;	
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
		var source = $($this.imageSRCLink[$this.currImg]);
		$this.image.attr({
			'src': source.attr('href'),
			'alt': source.attr('title')
		});

		// Show the description for image 1
		$this.discription.not($this.currImg).css({left:$this.options.boundary.width(), display:"none"});
		$this.discription.eq($this.currImg).css({left:0, display:"block"});

		// Build the thumbnails now but don't show them until the first image has loaded.
		buildThumbnails();
	};

	var autoPlayHandler = function()
	{
		var allImg = $this.imageSRCLink.length;
		autoPlayTimer = setTimeout(function(){

			if($this.options.autoPlayState){
				$this.prevImg = $this.currImg;
				$this.currImg++;
				if($this.currImg>=allImg){
					$this.currImg = 0;
				}
				
				thumbHandler($this.returnCurrentThumbnail($this.prevImg), true);
				thumbHandler($this.returnCurrentThumbnail());
				
				$this.changeImageHandler();
			}
		}, $this.options.autoPlayTime*1000);
	}

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

	var buildThumbnails = function() 
	{
		/*-----thumbnail----*/
		var thumbs = $this.imageSRCLink;
		if(thumbs.length!=0){
			//$("#inner").bind("mousemove", function(e){mouseMove(e)})
			//$("#inner").bind("mouseleave", stopPreviewPosition)
			thumbs.each(function(){
				var thumb = $(this);
					thumb.append(createBtn('over', {opacity:0}));
					thumb.append(createBtn('out'));
			}).click(
				function(e){
					e.preventDefault();
					$this.goTo(null, this);
					return false;			
				}
			).hover(
				function(){
					hoverHandler(this);
				},
				function(){
					hoverHandler(this, true);
				}
			);
			// Activate first thumb
			var thumb = $this.returnCurrentThumbnail();
			thumbHandler(thumb);
		}
	}

	/* Helpers */
	var hoverHandler = function(obj, off) 
	{
		if($this.isNotCurrentIndex($(obj))){
			thumbHandler(obj, off);
		}
	}
	var thumbHandler = function(obj, off) 
	{
		var arr = [{opacity:1}, false];
		if(off) {
			arr = [false, {opacity:1}];
		} 
		aniHelper($(".bg-gallery-btn-over", obj), arr[0])
		aniHelper($(".bg-gallery-btn-out", obj), arr[1])
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
		if(index >= $this.imageSRCLink.length || !$.isNumeric(index)) {
			console.log('FullscreenSlider :: Invalid starting index')
			index = 0;
		}
		return index;
	}

	/* Factory */
	var createSpinner = function() 
	{
		return $('<div class="imgSpinner"></div>')
	}
	var createBtn = function(flag, css) 
	{
		return $('<div class="bg-gallery-btn"></div>').addClass('bg-gallery-btn-'+flag).css((css||{})) 
	}


	/*******************/
	/* Public Methods */

	FullscreenSlider.prototype.changeImageHandler = function()
	{
		var 
			source = this.imageSRCLink.eq(this.currImg);

		this.loadComplete = false;
		this.loading();	
		this.lastImage = this.image;

		this.image = $("<img class='bottomImg' src='"+source.attr("href")+"' alt='"+(source.attr("title") || '')+"'>").bind("load", this.loadImageHandler);
		this.imageHolder.append(this.image);
		

		var boundary = this.options.boundary.width();
		this.discription.eq(this.currImg).css({left:boundary, display:"block"}).animate({left:0}, 1000, "easeOutCubic");
		this.discription.eq(this.prevImg).animate({left:-boundary}, 500, "easeInCubic", function(){
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
		var imageDeltaX,
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
		//changePreviewPosition(0)
	}

	FullscreenSlider.prototype.goTo = function(index, obj) 
	{
		var newIndex = ($.isNumeric(index) ? parseInt(index) : $(obj).parent().index());
		if (newIndex >= this.imageSRCLink.length ) {
			console.log('FullscreenSlider :: Not a valid slide')
			return false;
		}
		if(!this.loadComplete) {
			console.log('FullscreenSlider :: Still loading the other slide')
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
			this.options.autoPlayState = false;
			this.changeImageHandler();
			return currentThumb;
		} else {
			console.log('FullscreenSlider :: You can not reload the same index')
			return false;
		}
	}


	FullscreenSlider.prototype.goToNext = function() 
	{
		var tmp = this.currImg+1;
		if(tmp >= this.imageSRCLink.length) {
			tmp = 0;
		}
		return this.goTo(tmp);
	}

	FullscreenSlider.prototype.goToPrev = function() 
	{
		var tmp = this.currImg-1;
		if(tmp < 0) {
			tmp = this.imageSRCLink.length-1;
		}
		return this.goTo(tmp);
	}

	FullscreenSlider.prototype.play = function() 
	{
		// todo
	}

	FullscreenSlider.prototype.stop = function() 
	{
		// todo
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
	
	FullscreenSlider.prototype.isNotCurrentIndex = function(o) 
	{
		return (o.parent().index()!=this.currImg);
	}
	
	FullscreenSlider.prototype.returnCurrentThumbnail = function(index) 
	{
		var newIndex = ($.isNumeric(index) ? parseInt(index) : this.currImg);
		return $("li", this.thumbsHolder).eq(newIndex);
	}

	FullscreenSlider.prototype.getCurrentSlide = function() 
	{
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