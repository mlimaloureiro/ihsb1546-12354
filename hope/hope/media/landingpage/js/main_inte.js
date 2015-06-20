var app = {
	map: null,
	timer: null,
	counter: 0,
	count: true,
	showN: 0,
	start: false,
	repUm: false,
	repDois: false,
	repTres: false,
	repQuatro: false,
	desc1: false,
	foi: false,
	foi2: false,
	desc2: false,
	desc3: false,
	desc4: false,
	fora: 0
}

app.init = function() {
	var self = this;
	app.events();
	$("#container-pre").show();
	$("#container-pre").css({'cursor': 'url(/media/landingpage/img/cursor.png) 15 15, pointer'});
}

app.initMaps = function() {
	var self = this;
	var mapOptions = {
		// How zoomed in you want the map to start at (always required)
		zoom: 13,
		draggable: false,
		zoomControl: false,
		scrollwheel: false,
		disableDoubleClickZoom: true,
		scrolling: false,
		streetViewControl: false,
		mapTypeControl: false,
		disableDefaultUI: true,

		// The latitude and longitude to center the map (always required)
		center: new google.maps.LatLng(42.9900, -73.9900), // New York

		styles: [{"elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"landscape.natural","elementType":"geometry.fill","stylers":[{"color":"#f5f5f2"},{"visibility":"on"}]},{"featureType":"administrative","stylers":[{"visibility":"off"}]},{"featureType":"transit","stylers":[{"visibility":"off"}]},{"featureType":"poi.attraction","stylers":[{"visibility":"off"}]},{"featureType":"landscape.man_made","elementType":"geometry.fill","stylers":[{"color":"#ffffff"},{"visibility":"on"}]},{"featureType":"poi.business","stylers":[{"visibility":"off"}]},{"featureType":"poi.medical","stylers":[{"visibility":"on"}]},{"featureType":"poi.place_of_worship","stylers":[{"visibility":"off"}]},{"featureType":"poi.school","stylers":[{"visibility":"off"}]},{"featureType":"poi.sports_complex","stylers":[{"visibility":"off"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#ffffff"},{"visibility":"simplified"}]},{"featureType":"road.arterial","stylers":[{"visibility":"simplified"},{"color":"#ffffff"}]},{"featureType":"road.highway","elementType":"labels.icon","stylers":[{"color":"#ffffff"},{"visibility":"on"}]},{"featureType":"road.highway","elementType":"labels.icon","stylers":[{"visibility":"on"}]},{"featureType":"road.arterial","stylers":[{"color":"#ffffff"}]},{"featureType":"road.local","stylers":[{"color":"#000000"}]},{"featureType":"poi.park","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"water","stylers":[{"color":"#05E9FF"}]},{"featureType":"landscape","stylers":[{"color":"#e5e8e7"}]},{"featureType":"poi.park","stylers":[{"color":"#8ba129"}]},{"featureType":"road","stylers":[{"color":"#FAFAFA"}]},{"featureType":"poi.sports_complex","elementType":"geometry","stylers":[{"color":"#c7c7c7"},{"visibility":"off"}]},{"featureType":"water","stylers":[{"color":"#05E9FF"}]},{"featureType":"poi.park","stylers":[{"color":"#1abc9c"}]},{"featureType":"poi.park","stylers":[{"gamma":1.51}]},{"featureType":"road.local","stylers":[{"visibility":"on"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"visibility":"on"}]},{"featureType":"poi.government","elementType":"geometry","stylers":[{"visibility":"on"}]},{"featureType":"landscape","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"visibility":"simplified"}]},{"featureType":"road.local","stylers":[{"visibility":"simplified"}]},{"featureType":"road"},{"featureType":"road"},{},{"featureType":"road.highway"},{"elementType":"labels.text.stroke","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"labels","stylers":[{"color":"#8C8C8C"}]},{"elementType":"labels.icon","stylers":[{"visibility":"off"}]}]
    
    };

	var mapElement = document.getElementById('map');
	// Create the Google Map using out element and options defined above
	this.map = new google.maps.Map(mapElement, mapOptions);

	google.maps.event.addListener(this.map, 'tilesloaded', function(evt) {
		self.init();
	});
}


app.events = function() {
	var self = this;
	var foto = 1;
	var estado1 = true;
	var estado2 = true;
	var estado3 = true;
	var estadoFora = 0;

	$("#seta1").click(function() {
		if (foto == 1){
			$("#conImg").css({"display":"none"}); 
			$("#conImg3").fadeIn(300);
			foto = 3;
		}
		else if (foto == 3){
			$("#conImg3").css({"display":"none"}); 
			$("#conImg2").fadeIn(300);
			foto = 2;
		}
		else if (foto == 2){
			$("#conImg2").css({"display":"none"}); 
			$("#conImg").fadeIn(300);
			foto = 1;
		}
	});

	$("#seta2").click(function() {
		if (foto == 1){
			$("#conImg").css({"display":"none"}); 
			$("#conImg2").fadeIn(300);
			foto = 2;
		}
		else if (foto == 2){
			$("#conImg2").css({"display":"none"}); 
			$("#conImg3").fadeIn(300);
			foto = 3;
		}
		else if (foto == 3){
			$("#conImg3").css({"display":"none"}); 
			$("#conImg").fadeIn(300);
			foto = 1;
		}
	});

	$('#container-pre').click(function() {
		$("#container-pre").hide();
		$("#container").fadeIn();
		$('#assunto').jScrollPane();
		$('body').css({"overflow":"hidden"}); 
		$('html').css({"overflow":"hidden"}); 
		$(document).scrollTop(0);
	});

	$('#submeter').click(function() {
		$("#container").hide();
		$("#container-pos").fadeIn();
		$('body').css({"overflow-y":"scroll"}); 
		$('html').css({"overflow-y":"scroll"}); 
	});



	$('.marker').click(function() {
		if (estado1 == true){
			$("#thanks").css({"opacity":"0"});
			$(".marker2").hide();
			$(".marker3").hide();
			$(".repDes3").hide();
			$(".repDes2").hide();
			$(".repDes1").fadeIn();
			estado1 = false;
		}
		else{
			$(".marker2").fadeIn();
			$(".marker3").fadeIn();
			$(".repDes1").hide();
			estado1 = true;
		}
	});

	$('.marker2').click(function() {
		if (estado2 == true){
			$("#thanks").css({"opacity":"0"});
			$(".marker").hide();
			$(".marker3").hide();
			$(".repDes3").hide();
			$(".repDes1").hide();
			$(".repDes2").fadeIn();
			estado2 = false;

		}
		else{
			$(".marker").fadeIn();
			$(".marker3").fadeIn();
			$(".repDes2").hide();
			estado2 = true;
		}
	});

	$('.marker3').click(function() {
		if (estado3 == true){
			$("#thanks").css({"opacity":"0"});
			$(".marker").hide();
			$(".marker2").hide();
			$(".repDes2").hide();
			$(".repDes1").hide();
			$(".repDes3").fadeIn();
			estado3 = false;
		}
		else{
			$(".marker").fadeIn();
			$(".marker2").fadeIn();
			$(".repDes3").hide();
			estado3 = true;
		}
	});




	$('html').click(function() {
		if(estadoFora == 1){
			$(".marker").fadeIn();
			$(".marker2").fadeIn();
			$(".marker3").fadeIn();
			$(".repDes1").hide();
			$(".repDes2").hide();
			$(".repDes3").hide();
		}
	});
	$('.marker').click(function(event) {
		estadoFora = 1;
		event.stopPropagation();
	});

	$('.marker2').click(function(event) {
		estadoFora = 1;
		event.stopPropagation();
	});

	$('.marker3').click(function(event) {
		estadoFora = 1;
		event.stopPropagation();
	});
}


$(document).ready(function() {
	app.initMaps();
})







