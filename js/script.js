/* Author: I Plan Websites .com  */

$(document).ready(function() {

/////////////// UTILS - not project specefic
  
 
$(window).resize(function() {
    if(this.resizeTO) clearTimeout(this.resizeTO);
    this.resizeTO = setTimeout(function() {
        $(this).trigger('resizeEnd');
    }, 100); //throttle: time to wait after the resize is done...
});



$(window).scroll(function(){
	if(this.scrollingTo) clearTimeout(this.scrollingTo);
  this.scrollingTo = setTimeout(function() {
      $(this).trigger('scrollEnd');
  }, 300); //throttle: time to wait after the resize is done...

});


///////////// init + misc view functions
function initView(){
	//fadeIn animation
	$('#seo').remove();
	$('#cache').addClass('invisible').delay(1200).queue(function(next){
		$('#cache').remove(); //we remove the DOM node once anim is over...
		next();
	});
	$(window).bind('resizeEnd adjustCssSizes', function() {
	    //do something, window hasn't changed size in 500ms
	    var window_h = $(window).height();
			var gal_h = window_h - (70 + 60);  //these are the footer + header height...
			if(gal_h >=800){gal_h=800}//set max height
			$('section#home').css('height', gal_h);
			$('section#info').css('height', gal_h);
			$('section#bio').css('height', gal_h);
			$('section#credit').css('height', gal_h);
			// ALSO adjust Width accordingly???
	});
	$(window).trigger('adjustCssSizes'); //we also trigger the view fix on init 
	
	

	$(window).bind('scrollEnd', function(){
		var left = $(window).scrollLeft() ;
		//	alert('left = ' + left);
		if( left < 20){
			$('#prev').addClass('off');
		}else{
			$('#prev').removeClass('off');
		}
	})



	sammy.run('/#/');
	
}


function renderTemplate(context, elem, path, templateData, cache, callback){
	if( $(elem).hasClass('inDom') && cache){
		if($.isFunction(callback)){
			callback(context); //if temlate already loaded, we just call the callBakc right away.
		}
	}else{
	  context.render(path, templateData)
	   .replace(context.$element(elem)).then(function(content) {
				$(elem).addClass('inDom');
				if($.isFunction(callback)){
					callback(context);
				}
	  });
	}
}


function initTemplates(context, callbackHome){
	
	renderTemplate(context, 'footer', '/templates/footer.html', {title: "hello!"}, true);
	renderTemplate(context, 'header', '/templates/header.html', {title: "hello!"}, true, function(context){
		$('header .bt').unbind('click touch').bind('click touch', function() {//Adding action to header buttons (mindless of route changes)
			scrollBase();
		});
	});
	renderTemplate(context, 'section#info', '/templates/info.html', {title: "hello!"}, true);	
	renderTemplate(context, 'section#bio', '/templates/bio.html', {title: "hello!"}, true);	
	renderTemplate(context, 'section#credit', '/templates/credit.html', {title: "hello!"}, true);	
	renderTemplate(context, 'section#home', '/templates/home.html', {gal: Gallery.all()}, true, function(context){
		callbackHome(context);
		//bind action to next / prev bt
	
		$('#prev').unbind('click touch').bind('click touch', function(){
			//$(this).addClass('binded');
			pan(-5); //we want to return to menu, not just pan back...
			$('#prev').removeClass('off'); //just to bypass the throttle delay...
		});
		$('#next').unbind('click touch').bind('click touch', function(){
			$(this).addClass('binded');
			pan(1);
		});
	});
}

function scrollBase(){
	if(this.scrollBase) clearTimeout(this.scrollBase);
  this.scrollBase = setTimeout(function() {
      if($(window).scrollLeft() > 0){//  first check if we NEED to scroll there...
				$('html').scrollTo({ top:0, left:0, }, {duration:100}); 
			}
  }, 50); //throttle: //just to avoid double eventing
}

function pan(direction){ //-1:left,  1:right
	var amount =  $(window).width() -250; //use window . width - 100px...
	var offsetStr = '+='+ (amount*direction);
	$('html').scrollTo({ top:0, left:offsetStr, }, {duration:200});
}


function formatYear(yyyy){
	return yyyy.toString().slice(2);
}


function bodyClass(context, section){
 //if(! $('body').hasClass(section)){  //we make sure we don'T hcange class, if we remain in the same main section
	$('body').removeClass('info bio home col credit video photo');
	$('body').addClass(section);
	
	//alert('section = '+section);
	//we trigger page transition
	$('section.out').removeClass('out');//cleanup old animation leftover
	
	
	$('section.active').removeClass('active in').addClass('out').delay(1000).queue(function(next){
	 //$('section.out').removeClass('out'); //we remove the DOM node once anim is over...
	 		$('section.in').removeClass('in');  //let the new section animate to it's normal state.
			//also remove the 'out' class...
			$('section.out').removeClass('out'); 
		next();
	}); //eo queue
	$('section#'+section).addClass('in active');
 //}//end if
}





/////////////// MODEL CODE...

Gallery = Model("gallery", function() {
	  this.persistence(Model.localStorage);
		this.extend({
	    activate: function(name) {
				alert('this galery is active!');
	     // return this.detect(function() {
	     //   return  this.attr("na").toLowerCase() == name.toLowerCase()
	     // })
	    }
	  }) // eo extend
}); // eo model gallery


/////////////// ROUTES (SAMMY)
sammy = Sammy('body', function () {
			this.use('Storage');
		//this.use('Cache');
		this.use(Sammy.Template, "html");
		this.use('Title');
		this.use(Sammy.JSON);
		//this.use(Sammy.Haml); //default uses .template file ext for templates




		/////////////// LOAD ROUTE (homepage)
		this.get('/#/', function (context) {
		
		
		initTemplates(context, function(context){
			 //alert('call back!!');
			 //scrollBase();
			if(! $('section#home').hasClass('visited') ){
				$('html').scrollTo({ top:0, left:190 }, 50);
				
			}
			bodyClass(context, 'home');
			sammy.runRoute ( 'get', '/#/photos/2011_fall'); //we load the current collection by default but don't stack in history!!
			
				
		});
	}); 


	///////////////
	this.get('/#/collections', function (context) {
		//This Route shows the menu, but doesn't change the content!
		var col = this.params['col'];
		//alert("col = "+ col);
		bodyClass(context, 'home');
		scrollBase();
		initTemplates(context, function(context){
			if(! $('section#home .gallery').hasClass('loaded') ){
				sammy.runRoute ( 'get', '/#/photos/2011_fall');  //if it's the first page, we load first collection...
			}
			//alert('call back!!');
		});
	}); 



	//////////////////
	this.get('/#/photos/:col', function (context) {
	//	alert('col route!!');
		var col = this.params['col'];
		bodyClass(context, 'home');
		//scrollBase();
		
		// $('html').scrollTo({ top:0, left:200 }, 200); //!! TWEAK value!
		var gal = Gallery.select(function() { //selecting the galery model (json bit)
		  return this.attr("id") == col
		}).first();
		$('header .btCol strong').text(gal.attr('season') +" "+ gal.attr('year'));
		initTemplates(context, function(context){
			renderTemplate(context, '#home .gallery', '/templates/gal.html', {gal: gal}, false, function(context){  //false = no chache of templ.
					$('#home').addClass('photo_content');
					$('#home').removeClass('video_content');
					
					$('section#home .gallery').addClass('loaded'); //we knoe there's a leat one gallery loaded on page
					$('section#home').addClass('visited');// we'll know if it's the first pagview also.
					$('#home #navHome a.active').removeClass('active');//Interface FX (active bt)
					$('#home  #navHome a.'+col).addClass('active');
					$(".gallery img").one('load', function() {//FADE IMG on load...
					  $(this).removeClass('loading');
					}).each(function() {
					  if(this.complete) $(this).load(); //fix caching event not firing
					});
					$(".gallery img").unbind('click touch').bind('click touch', function() {//bind scrolling behavior on img clicks
						$('html').scrollTo(this, 300, {axis: 'x'});
						//alert('touch img');
					});
					
			}); // eo render
		}); //eo call back for initTemplate	
	}); // eo route

	///////////////////////
	
	
	this.get('/#/video/:col', function (context) {
	//	alert('col route!!');
	
		var col = this.params['col'];
		bodyClass(context, 'home');
		//scrollBase();
		
		// $('html').scrollTo({ top:0, left:200 }, 200); //!! TWEAK value!
		var gal = Gallery.select(function() { //selecting the galery model (json bit)
		  return this.attr("id") == col
		}).first();
		
		
		$('header .btCol strong').text(gal.attr('season') +" "+ gal.attr('year'));
		
		
		initTemplates(context, function(context){
			renderTemplate(context, '#home .gallery', '/templates/gal_vid1.html', {gal: gal}, false, function(context){  //false = no chache of templ.
					$('section#home .gallery').addClass('loaded'); //we knoe there's a leat one gallery loaded on page
					$('section#home').addClass('visited');// we'll know if it's the first pagview also.
					$('#home #navHome a.active').removeClass('active');//Interface FX (active bt)
					$('#home  #navHome a.vid_'+col).addClass('active'); //!!!
				
				$('#home').removeClass('photo_content');
				$('#home').addClass('video_content');
				
				/*	$(".gallery img").one('load', function() {//FADE IMG on load...
					  $(this).removeClass('loading');
					}).each(function() {
					  if(this.complete) $(this).load(); //fix caching event not firing
					});
					
					$(".gallery img").unbind('click touch').bind('click touch', function() {//bind scrolling behavior on img clicks
						$('html').scrollTo(this, 300, {axis: 'x'});
						//alert('touch img');
					});*/
					
			}); // eo render
		}); //eo call back for initTemplate	
	}); // eo route

	///////////////////////
	
	
	this.get('/#/infos', function (context) {
		//alert("infos");
		bodyClass(context, 'info');
		scrollBase();
		initTemplates(context, function(context){
			//alert('call back!!');
		});
	}); // eo route
	
	
	this.get('/#/bio', function (context) {
		bodyClass(context, 'bio');
		scrollBase();
		initTemplates(context, function(context){
			//alert('call back!!');
		});
	}); // eo route
	
	this.get('/#/credits', function (context) {
		bodyClass(context, 'credit');
		scrollBase();
		initTemplates(context, function(context){
			//alert('call back!!');
		});
	}); // eo route
	
});//eo sammy routes



/////////////// JSON data load

//if (Gallery.count() == 0){ //if it'S not in cache...
	$.getJSON('data/gallery.json', function(data) { //cached...
	  $.each(data, function(key, val) {
			var gal = new Gallery(val);
			gal.save();
	  }) //end of each...
	  
		initView(); // starts sammy and fadeIn
		// 
	});//eo json init
//}//end if!



});//eo doc ready
















