fullscreen-slider
=================

Fullscreen fluid background gallery slider

Demo v.0.1.1

www.aplusdesign.com.au/demos/fullscreen-slider



###Is this another slider O_o

Not really. 


###WHY is it different

There are no free or commercial products that allow you to use the entire document space as your slider while also handling large background imagery correctly!

All the sliders that currently exist for fullscreen use, try to load all images at the beginning. That destroys the user experience, imagine loading 5, 1mb image files while your users stare at a blank screen (yes this is how fullscreen sliders work currently), then the user never clicks the links that show those images? Pretty silly right!



###Fullscreen-slider

Use super large awesome looking backgrounds

Never worry about scaling of your background images on fluid layouts

Graceful UI that handles image loading logically

Lots of public methods that let you control the slider outside of the plugin itself.


###It's free

So enjoy! :)


###Options
    
	{
		autoPlayState	: BOOL, 			// Auto play the slideshow (true || false) :: Default is false
		autoPlayTime 	: INT,				// The time between slides in seconds when auto play is set to true (1 - ?) :: Default is 4 seconds
		alignIMG 		: STRING,			// How to align the background image, defaults to center. Available (top, bottom, right, left, top_left, top_right, bottom_left, bottom_right) :: Default is 'center'
		boundary 		: jQuery OBJECT, 	// The wrapper in which the slider sits, default to document as this is mean to be a fullscreen slider. :: Default is $(document)
		startAtSlide 	: INT 				// Which slide to start at (1 - ?) :: Default is 0
		pauseNewImage 	: INT 				// You can set a pause time between loading of the background images :: Default is 0 seconds
	} 


###Documentation

Working on it :(



[A+Design](http://www.aplusdesign.com.au "Cuting edge web development")
