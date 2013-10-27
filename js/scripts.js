// 
$(document).ready(function() {

	var slider = $('.fullscreen-slider')

	slider.fullscreenSlider({
		boundary: $('#boundary')  // Defaults to document, is the container for your slider
	});

	console.log(slider.data())

	// Buttons

	var fullscreenPlugin = slider.data('fullscreenSlider');

	$('.prev').on('click', function(){
		fullscreenPlugin.goToPrev();
	})

	$('.next').on('click', function(){
		fullscreenPlugin.goToNext();
	})

	$('.goto').on('click', function(){
		fullscreenPlugin.goTo($('.goto-input').val());
	})

	$('.current').on('click', function(){
		alert(fullscreenPlugin.getCurrentSlide())
	})

	if(fullscreenPlugin.options.autoPlayState) {
		$('.start').on('click', function(){
			fullscreenPlugin.play();
		})
		$('.stop').on('click', function(){
			fullscreenPlugin.stop();
		})
	} else {
		$('.start').css({display: 'none'})
		$('.stop').css({display: 'none'})
	}

});
