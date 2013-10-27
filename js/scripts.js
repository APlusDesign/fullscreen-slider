// 
$(document).ready(function() {

	var slider = $('.fullscreen-slider')

	slider.fullscreenSlider({
		boundary: $('#boundary')  // Defaults to document, is the container for your slider
	});

	console.log(slider.data())
	
	// Buttons

	$('.prev').on('click', function(){
		slider.data('fullscreenSlider').goToPrev();
	})

	$('.next').on('click', function(){
		slider.data('fullscreenSlider').goToNext();
	})

	$('.goto').on('click', function(){
		slider.data('fullscreenSlider').goTo($('.goto-input').val());
	})

	$('.current').on('click', function(){
		alert(slider.data('fullscreenSlider').getCurrentSlide())
	})

});
