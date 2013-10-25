// TODO: allow loading at init by an index, might not want to start at 1
// TODO: resume autoplay on click of a thumb
// TODO: add a pre-load images switch

(function($){
	var FullscreenSlider = function(element, options)
    {
		var
			obj 	= element,			// The original collection
			$this 	= this;				// Reference for closures

			
		this.settings = $.extend({
			autoPlayState	: false,
			autoPlayTime 	: 4,
			alignIMG 		: "center",
			doc 			: (options.parent || $(document))
		}, options || {});


		this.init = function()
		{
			setElements();
			setEvents();
			start();
			return this;
		};

		var setElements = function()
		{
			$this.image 		= $('<img>');
			$this.imageHolder 	= $(".image-holder", obj);
			$this.discription 	= $(".content-holder>li", obj); 	// I know it's misspelt, but in IE its a reserved word :p
	 		$this.thumbsHolder 	= $(".thumb-holder", obj);
	 		$this.imageSRCLink 	= $("ul>li>a", $this.thumbsHolder);
			$this.currImg 		= 0;
			$this.prevImg 		= 0;
			$this.loadComplete 	= true;
			$this.autoPlayTimer;	
		};

		var setEvents = function()
		{
			// On first image load, remove loader, show image, trigger resize
			$this.image.bind("load", firstImage);	
			// Bind the resize window event
			$(window).resize($this.resizeImageHandler.bind($this));
		};

		var start = function()
		{
			// Create a loading spinner while first image loads
			$this.imageHolder.append(createSpinner());

			// Begin loading the first image
			var source = $($this.imageSRCLink[0]);
			$this.image.attr({
				'src': source.attr('href'),
				'alt': source.attr('title')
			});

			// Show the description for image 1
			$this.discription.not(0).css({left:$this.settings.doc.width(), display:"none"});
			$this.discription.eq($this.currImg).css({left:0, display:"block"});

			// Build the thumbnails now but don't show them until the first image has loaded.
			buildThumbnails();
		};
		
		var autoPlayHandler = function(){
			var allImg = $this.imageSRCLink.length;
			autoPlayTimer = setTimeout(function(){
					if($this.settings.autoPlayState){
					$this.prevImg = $this.currImg;
					$this.currImg++;
					if($this.currImg>=allImg){
						$this.currImg = 0;
					}
					var previewLi = $("ul>li", $this.thumbsHolder);
					thumbHandler(previewLi.eq($this.prevImg), true);
					thumbHandler(previewLi.eq($this.currImg));
					$this.changeImageHandler();
				}
			}, $this.settings.autoPlayTime*1000);
		}

		var firstImage = function() {
			// Find the spinner, fade it out and remove it
			var loader = $this.imageHolder.find('.imgSpinner');
			loader.animate({opacity:0}, 600, "easeInOutCubic", function(){
				$(this).remove();
			});
			// Append the image and fade it in
			$this.imageHolder.append($this.image.css('opacity', 0).animate({opacity:1}, 600, "easeInOutCubic"));
			// Show the thumbnail menu
			$this.thumbsHolder.animate({opacity:1}, 1000, "easeInOutCubic");
			// Make sure sizing is correct
			$(window).trigger('resize');
			// Auto play
			autoPlayHandler();
		}

		var buildThumbnails = function() {

			/*-----thumbnail----*/
			var thumbs = $("ul>li>a", $this.thumbsHolder);
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
				var thumb = $this.returnCurrentThumbnail().bind($this);
				thumbHandler(thumb);
			}
		}

		/* Helpers */
		var hoverHandler = function(obj, off) {
			if($this.isNotCurrentIndex($(obj))){
				thumbHandler(obj, off);
			}
		}
		var thumbHandler = function(obj, off) {
			var arr = [{opacity:1}, false];
			if(off) {
				arr = [false, {opacity:1}];
			} 
			aniHelper($(".bg-gallery-btn-over", obj), arr[0])
			aniHelper($(".bg-gallery-btn-out", obj), arr[1])
		}
		var aniHelper = function(obj, style, stop, time) {
			var 
				delta 	= (time || 600),
				css 	= (style || {opacity:0}),
				queue 	= (stop || false);

			obj.stop(queue).animate(css, delta, "easeInOutCubic");	
		}
		/* Factory */
		var createSpinner = function() {
			return $('<div class="imgSpinner"></div>')
		}
		var createBtn = function(flag, css) {
			return $('<div class="bg-gallery-btn"></div>').addClass('bg-gallery-btn-'+flag).css((css||{})) 
		}




		/*******************/
		/* Public Methods */

		this.changeImageHandler = function(){
			var 
				source = this.imageSRCLink.eq(this.currImg);

			this.loadComplete = false;
			this.image.addClass("topImg");

			this.imageHolder.append("<img class='bottomImg' src='"+source.attr("href")+"' alt='"+(source.attr("title") || '')+"'>");
			this.thumbsHolder.append(
				createSpinner()
				.css({opacity:0})
				.stop()
				.animate({opacity:1}, 500, "easeInOutCubic")
			);

			$(".bottomImg").bind("load", this.loadImageHandler);	
			
			this.discription.eq(this.currImg).css({left:this.settings.doc.width(), display:"block"}).animate({left:0}, 1000, "easeOutCubic");
			this.discription.eq(this.prevImg).animate({left:-this.settings.doc.width()}, 500, "easeInCubic", function(){
				$this.discription.eq($this.prevImg).css({display:"none"})
			});
		}

		this.loadImageHandler = function(){
			setTimeout(function(){
				var 
					spinner 	= $(".imgSpinner"),
					bottomImg 	= $(".bottomImg").unbind("load", this.loadImageHandler);
				
				spinner.stop().animate({opacity:"0"}, 1000, "easeInOutCubic")
				$this.resizeImageHandler();
				$(".topImg").stop().animate({opacity:"0"}, 1000, "easeInOutCubic", function(){
					$(this).remove();
					spinner.remove();
					bottomImg.removeClass("bottomImg");
					$this.loadComplete = true;
					autoPlayHandler();
				})
			}, 1000)
		}

		this.resizeImageHandler = function(){
			// Dragons :: I'm global don't change me	
			this.image = $(".image-holder > img");


			var imageDeltaX,
				imageDeltaY,
				doc 			= this.settings.doc,
				image 			= this.image,
				imageK  		= image.height()/image.width(),
				holderK 		= doc.height()/doc.width(),
				imagePercent 	= imageK*100;
			

			if(holderK>imageK){
				imagePercent = (image.width()/image.height())*100;
				this.image.css({height:doc.height(), width:(doc.height()*imagePercent)/100});
			}else{
				imagePercent = (image.height()/image.width())*100;
				this.image.css({width:doc.width(), height:(doc.width()*imagePercent)/100});
			}
			switch(this.settings.alignIMG){
				case "top":
					imageDeltaX=-(image.width()-doc.width())/2;
					imageDeltaY=0;
				break;
				case "bottom":
					imageDeltaX=-(image.width()-doc.width())/2;
					imageDeltaY=-(image.height()-doc.height());
				break;
				case "right":
					imageDeltaX=-(image.width()-doc.width());
					imageDeltaY=-(image.height()-doc.height())/2;
				break;
				case "left":
					imageDeltaX=0;
					imageDeltaY=-(image.height()-doc.height())/2;
				break;
				case "top_left":
					imageDeltaX=0;
					imageDeltaY=0;
				break;
				case "top_right":
					imageDeltaX=-(image.width()-doc.width());
					imageDeltaY=0;
				break;
				case "bottom_right":
					imageDeltaX=-(image.width()-doc.width());
					imageDeltaY=-(image.height()-doc.height());
				break;
				case "bottom_left":
					imageDeltaX=0;
					imageDeltaY=-(image.height()-doc.height());
				break;
				default:
					imageDeltaX=-(image.width()-doc.width())/2;
					imageDeltaY=-(image.height()-doc.height())/2;
			}
			this.image.css({left:imageDeltaX, top:imageDeltaY, position:"absolute"});
			//changePreviewPosition(0)
		}

		this.goTo = function(index, obj) {
			var newIndex = ($.isNumeric(index) ? index : $(obj).parent().index());
			if (newIndex >= this.imageSRCLink.length ) {
				console.log('Not a valid index')
				return false;
			}
			if(newIndex != this.currImg && this.loadComplete){
				
				// Remove old thumbs styles
				thumbHandler(this.returnCurrentThumbnail(), true);

				this.prevImg = this.currImg;
				this.currImg = newIndex;

				// Add new thumbs styles
				var currentThumb = this.returnCurrentThumbnail();
				thumbHandler(currentThumb);

				clearTimeout(this.autoPlayTimer);
				this.settings.autoPlayState = false;
				this.changeImageHandler();
				return currentThumb;
			} else {
				console.log('FullscreenSlider :: You can not reload the same index')
				return false;
			}
		}

		this.goToNext = function() {
			var tmp = this.currImg+1;
			if(tmp >= this.imageSRCLink.length) {
				tmp = 0;
			}
			return this.goTo(tmp);
		}

		this.goToPrev = function() {
			var tmp = this.currImg-1;
			if(tmp < 0) {
				tmp = this.imageSRCLink.length-1;
			}
			return this.goTo(tmp);
		}

		/* Look up */
		this.isNotCurrentIndex = function(obj) {
			return (obj.parent().index()!=this.currImg);
		}
		this.returnCurrentThumbnail = function(index) {
			return $("ul>li", this.thumbsHolder).eq((index || this.currImg));
		}
		
		// Start
		return this.init();
	};


	// Plugin
	$.fn.fullscreenSlider = function(options)
	{
		return this.each(function()
		{
			var obj = $(this);
			if (obj.data('fullscreenSlider')) return;
			obj.data('fullscreenSlider', new FullscreenSlider(obj, options));
		});
	};
})(jQuery);