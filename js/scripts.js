// 
$(document).ready(function() {

	var slider = $('.fullscreen-slider')

	slider.fullscreenSlider({
		boundary: $('#boundary')  // Defaults to window, it is the container for your slider
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
		fullscreenPlugin.getCurrentSlide()
	})

	
	$('.start').on('click', function(){
		fullscreenPlugin.play();
	})
	$('.stop').on('click', function(){
		fullscreenPlugin.stop();
	})
	

});
