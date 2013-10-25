// 
$(document).ready(function() {

	var slider = $('#gallery-holder')

	slider.fullscreenSlider({
		parent: $('#gallery')
	});


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
