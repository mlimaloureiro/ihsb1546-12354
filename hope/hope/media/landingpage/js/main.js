/* Main app */
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

/* App functions */
app.setScroll = function() {
	var self = this;
	$(document).scroll(function() {
		var scroll = $(window).scrollTop();
		
		/*
		var bt12 = $(".btMessUmDois").offset();
		var slide2 = (bt12.top + 500);

		var bt2 = $(".btMessDois").offset();
		var slide3 = (bt2.top + 300);

		if (scroll >= slide2) {
			$(".tres").css({
				"display": "none"
			})
			$(".tres2").css({
				"display": "block"
			})
		}

		if (scroll >= slide3) {
			$(".tres").css({
				"display": "block"
			})
			$(".tres2").css({
				"display": "none"
			})
		} else {
			$(".tres").css({
				"display": "none"
			})
			$(".tres2").css({
				"display": "block"
			})
		}
		*/
		var offUm = $(".sliUm").offset();

		var doisOffset = $(".sliDois").offset();
		var doisOffset2 = $(".servi").offset();
		var dPos2 = (doisOffset.top - 250);
		var dPos3 = (doisOffset2.top - 400);



		if ($(this).scrollTop() >= 400){  
		    $('.um').addClass("fase2");
		    $('.quatro').addClass("fase2");
		  }

		/*if ($(this).scrollTop() <= 400){  
		    $('.um').removeClass("fase2");
		    $('.quatro').removeClass("fase2");
		  } */



		if ($(this).scrollTop() >= dPos2){  
		    foi = true;
		  } 
		if ($(this).scrollTop() >= dPos3){
			foi = false;
		}  


		if ($(this).scrollTop() >= dPos2){  
		    foi2 = true;
		} 
		else {  
		    foi2 = false;
		} 



		if (scroll >= dPos3) {
			$('.planeta').addClass('animated tada');
		}

		if (scroll >= dPos2) {
			if (!self.start) {
				self.start = true;
				self.timer = setInterval(self.slide, 1600);
			}
		}
	});
}

app.animations = function() {
	$('.ConRepUm').addClass('animated bounceInDown');
	$('.ConRepDois').addClass('animated bounceInDown');
	$('.ConRepTres').addClass('animated bounceInDown');
	$('.ConRepQuatro').addClass('animated bounceInDown');
	$('.messUm').addClass('animated fadeInUp');
	$('.messUmDois').addClass('animated fadeInUp');

	setTimeout(function() {
		$('.ConDesUm').fadeIn(600);
	}, 1000);

	setTimeout(function() {
		$('.ConDesDois').fadeIn(600);
	}, 1500);

	setTimeout(function() {
		$('.ConDesTres').fadeIn(600);
	}, 2000);

	setTimeout(function() {
		$('.ConDesQuatro').fadeIn(600);
	}, 2500);
}

app.descriptions = function() {
	var self = this;
	$(".ConRepUm").click(function() {
		if (!self.repUm) {
			$('.repDes1').fadeIn(300);
			$('.ConProb').fadeIn(300);

			$('#imgRepDois').css({
				"opacity": "0","pointer-events": "none"
			})
			$('.ConRepDois').css({
				"pointer-events": "none","cursor":"default"
			})
			$('#imgRepTres').css({
				"opacity": "0","pointer-events": "none"
			})
			$('.ConRepTres').css({
				"pointer-events": "none","cursor":"default"
			})
			$('#imgRepQuatro').css({
				"opacity": "0","pointer-events": "none"
			})
			$('.ConRepQuatro').css({
				"pointer-events": "none","cursor":"default"
			})
			$('.ConDesDois').css({
				"opacity": "0","pointer-events": "none"
			})
			$('.ConDesTres').css({
				"opacity": "0","pointer-events": "none"
			})
			$('.ConDesQuatro').css({
				"opacity": "0","pointer-events": "none"
			})

			$('.btMessUm').css({
				"opacity": "0","pointer-events": "none"
			});
			$('.btMessUmDois').css({
				"opacity": "0","pointer-events": "none"
			});

			self.repUm = true;
		} else {
			$('.repDes1').fadeOut(100);
			$('.ConProb').fadeOut(100);
			setTimeout(function() {
				$('#imgRepDois').css({
					"opacity": "1"
				})
			}, 200);

			$('.ConRepDois').css({
				"cursor":"pointer","pointer-events": "visible"
			})
			
			setTimeout(function() {
			$('#imgRepTres').css({
				"opacity": "1"
			})
			}, 200);
			$('.ConRepTres').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('#imgRepQuatro').css({
				"opacity": "1"
			})
			}, 200);
			$('.ConRepQuatro').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('.ConDesDois').css({
				"opacity": "1"
			})
			}, 200);
			$('.ConDesDois').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('.ConDesTres').css({
				"opacity": "1"
			})
			}, 200);
			$('.ConDesTres').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('.ConDesQuatro').css({
				"opacity": "1"
			})
			}, 200);
			$('.ConDesQuatro').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('.btMessUm').css({
				"opacity": "1"
			});
			}, 200);
			$('.btMessUm').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('.btMessUmDois').css({
				"opacity": "1"
			});
			}, 200);
			$('.btMessUmDois').css({
				"cursor":"pointer","pointer-events": "visible"
			})
			self.repUm = false;
		}
	});
	$(".ConDesUm").click(function() {
		if (!self.repUm) {
			$('.repDes1').fadeIn(300);
			$('.ConProb').fadeIn(300);

			$('#imgRepDois').css({
				"opacity": "0","pointer-events": "none","cursor":"default"
			})
			$('.ConRepDois').css({
				"pointer-events": "none","cursor":"default"
			})
			$('#imgRepTres').css({
				"opacity": "0","pointer-events": "none","cursor":"default"
			})
			$('.ConRepTres').css({
				"pointer-events": "none","cursor":"default"
			})
			$('#imgRepQuatro').css({
				"opacity": "0","pointer-events": "none","cursor":"default"
			})
			$('.ConRepQuatro').css({
				"pointer-events": "none","cursor":"default"
			})
			$('.ConDesDois').css({
				"opacity": "0","pointer-events": "none"
			})
			$('.ConDesTres').css({
				"opacity": "0","pointer-events": "none"
			})
			$('.ConDesQuatro').css({
				"opacity": "0","pointer-events": "none"
			})

			$('.btMessUm').css({
				"opacity": "0","pointer-events": "none"
			});
			$('.btMessUmDois').css({
				"opacity": "0","pointer-events": "none"
			});

			self.repUm = true;
		} else {
			$('.repDes1').fadeOut(100);
			$('.ConProb').fadeOut(100);

			setTimeout(function() {
			$('#imgRepDois').css({
				"opacity": "1"
			})
			}, 200);
			$('.ConRepDois').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('#imgRepTres').css({
				"opacity": "1"
			})
			}, 200);
			$('.ConRepTres').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('#imgRepQuatro').css({
				"opacity": "1"
			})
			}, 200);
			$('.ConRepQuatro').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('.ConDesDois').css({
				"opacity": "1"
			})
			}, 200);
			$('.ConDesDois').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('.ConDesTres').css({
				"opacity": "1"
			})
			}, 200);
			$('.ConDesTres').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('.ConDesQuatro').css({
				"opacity": "1"
			})
			}, 200);
			$('.ConDesQuatro').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('.btMessUm').css({
				"opacity": "1"
			});
			}, 200);
			$('.btMessUm').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('.btMessUmDois').css({
				"opacity": "1"
			});
			}, 200);
			$('.btMessUmDois').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			self.repUm = false;
		}
	});


	$(".ConRepDois").click(function() {
		if (!self.repDois) {
			$('.repDes2').fadeIn(300);
			$('.ConProb2').fadeIn(300);

			$('#imgRepUm').css({
				"opacity": "0","pointer-events": "none"
			})
			$('.ConRepUm').css({
				"pointer-events": "none","cursor":"default"
			})
			$('#imgRepTres').css({
				"opacity": "0","pointer-events": "none"
			})
			$('.ConRepTres').css({
				"pointer-events": "none","cursor":"default"
			})
			$('#imgRepQuatro').css({
				"opacity": "0","pointer-events": "none"
			})
			$('.ConRepQuatro').css({
				"pointer-events": "none","cursor":"default"
			})
			$('.ConDesUm').css({
				"opacity": "0","pointer-events": "none"
			})
			$('.ConDesTres').css({
				"opacity": "0","pointer-events": "none"
			})
			$('.ConDesQuatro').css({
				"opacity": "0","pointer-events": "none"
			})

			$('.btMessUm').css({
				"opacity": "0","pointer-events": "none"
			});
			$('.btMessUmDois').css({
				"opacity": "0","pointer-events": "none"
			});

			self.repDois = true;
		} else {
			$('.repDes2').fadeOut(100);
			$('.ConProb2').fadeOut(100);

			setTimeout(function() {
			$('#imgRepUm').css({
				"opacity": "1"
			})
			}, 200);
			$('.ConRepUm').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('#imgRepTres').css({
				"opacity": "1"
			})
			}, 200);
			$('.ConRepTres').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('#imgRepQuatro').css({
				"opacity": "1"
			})
			}, 200);
			$('.ConRepQuatro').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('.ConDesUm').css({
				"opacity": "1"
			})
			}, 200);
			$('.ConDesUm').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('.ConDesTres').css({
				"opacity": "1"
			})
			}, 200);
			$('.ConDesTres').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('.ConDesQuatro').css({
				"opacity": "1"
			})
			}, 200);
			$('.ConDesQuatro').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('.btMessUm').css({
				"opacity": "1"
			});
			}, 200);
			$('.btMessUm').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('.btMessUmDois').css({
				"opacity": "1"
			});
			}, 200);
			$('.btMessUmDois').css({
				"cursor":"pointer","pointer-events": "visible"
			})
			self.repDois = false;
		}
	});
	$(".ConDesDois").click(function() {
		if (!self.repDois) {
			$('.repDes2').fadeIn(300);
			$('.ConProb2').fadeIn(300);

			$('#imgRepUm').css({
				"opacity": "0","pointer-events": "none"
			})
			$('.ConRepUm').css({
				"pointer-events": "none","cursor":"default"
			})
			$('#imgRepTres').css({
				"opacity": "0","pointer-events": "none"
			})
			$('.ConRepTres').css({
				"pointer-events": "none","cursor":"default"
			})
			$('#imgRepQuatro').css({
				"opacity": "0","pointer-events": "none"
			})
			$('.ConRepQuatro').css({
				"pointer-events": "none","cursor":"default"
			})
			$('.ConDesUm').css({
				"opacity": "0","pointer-events": "none"
			})
			$('.ConDesTres').css({
				"opacity": "0","pointer-events": "none"
			})
			$('.ConDesQuatro').css({
				"opacity": "0","pointer-events": "none"
			})

			$('.btMessUm').css({
				"opacity": "0","pointer-events": "none"
			});
			$('.btMessUmDois').css({
				"opacity": "0","pointer-events": "none"
			});

			self.repDois = true;
		} else {
			$('.repDes2').fadeOut(100);
			$('.ConProb2').fadeOut(100);

			setTimeout(function() {
			$('#imgRepUm').css({
				"opacity": "1"
			})
			}, 200);
			$('.ConRepUm').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('#imgRepTres').css({
				"opacity": "1"
			})
			}, 200);
			$('.ConRepTres').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('#imgRepQuatro').css({
				"opacity": "1"
			})
			}, 200);
			$('.ConRepQuatro').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('.ConDesUm').css({
				"opacity": "1"
			})
			}, 200);
			$('.ConDesUm').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('.ConDesTres').css({
				"opacity": "1"
			})
			}, 200);
			$('.ConDesTres').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('.ConDesQuatro').css({
				"opacity": "1"
			})
			}, 200);
			$('.ConDesQuatro').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('.btMessUm').css({
				"opacity": "1"
			});
			}, 200);
			$('.btMessUm').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('.btMessUmDois').css({
				"opacity": "1"
			});
			}, 200);
			$('.btMessUmDois').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			self.repDois = false;
		}
	});


	$(".ConRepTres").click(function() {
		if (!self.repTres) {
			$('.repDes3').fadeIn(300);
			$('.ConProb3').fadeIn(300);

			$('#imgRepUm').css({
				"opacity": "0","pointer-events": "none"
			})
			$('.ConRepUm').css({
				"pointer-events": "none","cursor":"default"
			})
			$('#imgRepDois').css({
				"opacity": "0","pointer-events": "none"
			})
			$('.ConRepDois').css({
				"pointer-events": "none","cursor":"default"
			})
			$('#imgRepQuatro').css({
				"opacity": "0","pointer-events": "none"
			})
			$('.ConRepQuatro').css({
				"pointer-events": "none","cursor":"default"
			})
			$('.ConDesUm').css({
				"opacity": "0","pointer-events": "none"
			})
			$('.ConDesDois').css({
				"opacity": "0","pointer-events": "none"
			})
			$('.ConDesQuatro').css({
				"opacity": "0","pointer-events": "none"
			})

			$('.btMessUm').css({
				"opacity": "0","pointer-events": "none"
			});
			$('.btMessUmDois').css({
				"opacity": "0","pointer-events": "none"
			});

			self.repTres = true;
		} else {
			$('.repDes3').fadeOut(100);
			$('.ConProb3').fadeOut(100);

			setTimeout(function() {
			$('#imgRepUm').css({
				"opacity": "1"
			})
			}, 200);
			$('.ConRepUm').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('#imgRepDois').css({
				"opacity": "1"
			})
			}, 200);
			$('.ConRepDois').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('#imgRepQuatro').css({
				"opacity": "1"
			})
			}, 200);
			$('.ConRepQuatro').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('.ConDesUm').css({
				"opacity": "1"
			})
			}, 200);
			$('.ConDesUm').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('.ConDesDois').css({
				"opacity": "1"
			})
			}, 200);
			$('.ConDesDois').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('.ConDesQuatro').css({
				"opacity": "1"
			})
			}, 200);
			$('.ConDesQuatro').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('.btMessUm').css({
				"opacity": "1"
			});
			}, 200);
			$('.btMessUm').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('.btMessUmDois').css({
				"opacity": "1"
			});
			}, 200);
			$('.btMessUmDois').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			self.repTres = false;
		}
	});
	$(".ConDesTres").click(function() {
		if (!self.repTres) {
			$('.repDes3').fadeIn(300);
			$('.ConProb3').fadeIn(300);

			$('#imgRepUm').css({
				"opacity": "0","pointer-events": "none"
			})
			$('.ConRepUm').css({
				"pointer-events": "none","cursor":"default"
			})
			$('#imgRepDois').css({
				"opacity": "0","pointer-events": "none"
			})
			$('.ConRepDois').css({
				"pointer-events": "none","cursor":"default"
			})
			$('#imgRepQuatro').css({
				"opacity": "0","pointer-events": "none"
			})
			$('.ConRepQuatro').css({
				"pointer-events": "none","cursor":"default"
			})
			$('.ConDesUm').css({
				"opacity": "0","pointer-events": "none"
			})
			$('.ConDesDois').css({
				"opacity": "0","pointer-events": "none"
			})
			$('.ConDesQuatro').css({
				"opacity": "0","pointer-events": "none"
			})

			$('.btMessUm').css({
				"opacity": "0","pointer-events": "none"
			});
			$('.btMessUmDois').css({
				"opacity": "0","pointer-events": "none"
			});

			self.repTres = true;
		} else {
			$('.repDes3').fadeOut(100);
			$('.ConProb3').fadeOut(100);

			setTimeout(function() {
			$('#imgRepUm').css({
				"opacity": "1"
			})
			}, 200);
			$('.ConRepUm').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('#imgRepDois').css({
				"opacity": "1"
			})
			}, 200);
			$('.ConRepDois').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('#imgRepQuatro').css({
				"opacity": "1"
			})
			}, 200);
			$('.ConRepQuatro').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('.ConDesUm').css({
				"opacity": "1"
			})
			}, 200);
			$('.ConDesUm').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('.ConDesDois').css({
				"opacity": "1"
			})
			}, 200);
			$('.ConDesDois').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('.ConDesQuatro').css({
				"opacity": "1"
			})
			}, 200);
			$('.ConDesQuatro').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('.btMessUm').css({
				"opacity": "1"
			});
			}, 200);
			$('.btMessUm').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('.btMessUmDois').css({
				"opacity": "1"
			});
			}, 200);
			$('.btMessUmDois').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			self.repTres = false;
		}
	});


	$(".ConRepQuatro").click(function() {
		if (!self.repQuatro) {
			$('.repDes4').fadeIn(300);
			$('.ConProb4').fadeIn(300);

			$('#imgRepUm').css({
				"opacity": "0","pointer-events": "none"
			})
			$('.ConRepUm').css({
				"pointer-events": "none","cursor":"default"
			})
			$('#imgRepDois').css({
				"opacity": "0","pointer-events": "none"
			})
			$('.ConRepDois').css({
				"pointer-events": "none","cursor":"default"
			})
			$('#imgRepTres').css({
				"opacity": "0","pointer-events": "none"
			})
			$('.ConRepTres').css({
				"pointer-events": "none","cursor":"default"
			})
			$('.ConDesUm').css({
				"opacity": "0","pointer-events": "none"
			})
			$('.ConDesDois').css({
				"opacity": "0","pointer-events": "none"
			})
			$('.ConDesTres').css({
				"opacity": "0","pointer-events": "none"
			})

			$('.btMessUm').css({
				"opacity": "0","pointer-events": "none"
			});
			$('.btMessUmDois').css({
				"opacity": "0","pointer-events": "none"
			});

			self.repQuatro = true;
		} else {
			$('.repDes4').fadeOut(100);
			$('.ConProb4').fadeOut(100);

			setTimeout(function() {
			$('#imgRepUm').css({
				"opacity": "1"
			})
			}, 200);
			$('.ConRepUm').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('#imgRepDois').css({
				"opacity": "1"
			})
			}, 200);
			$('.ConRepDois').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('#imgRepTres').css({
				"opacity": "1"
			})
			}, 200);
			$('.ConRepTres').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('.ConDesUm').css({
				"opacity": "1"
			})
			}, 200);
			$('.ConDesUm').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('.ConDesDois').css({
				"opacity": "1"
			})
			}, 200);
			$('.ConDesDois').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('.ConDesTres').css({
				"opacity": "1"
			})
			}, 200);
			$('.ConDesTres').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('.btMessUm').css({
				"opacity": "1"
			});
			}, 200);
			$('.btMessUm').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('.btMessUmDois').css({
				"opacity": "1"
			});
			}, 200);
			$('.btMessUmDois').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			self.repQuatro = false;
		}
	});
	$(".ConDesQuatro").click(function() {
		if (!self.repQuatro) {
			$('.repDes4').fadeIn(300);
			$('.ConProb4').fadeIn(300);

			$('#imgRepUm').css({
				"opacity": "0","pointer-events": "none"
			})
			$('.ConRepUm').css({
				"pointer-events": "none","cursor":"default"
			})
			$('#imgRepDois').css({
				"opacity": "0","pointer-events": "none"
			})
			$('.ConRepDois').css({
				"pointer-events": "none","cursor":"default"
			})
			$('#imgRepTres').css({
				"opacity": "0","pointer-events": "none"
			})
			$('.ConRepTres').css({
				"pointer-events": "none","cursor":"default"
			})
			$('.ConDesUm').css({
				"opacity": "0","pointer-events": "none"
			})
			$('.ConDesDois').css({
				"opacity": "0","pointer-events": "none"
			})
			$('.ConDesTres').css({
				"opacity": "0","pointer-events": "none"
			})

			$('.btMessUm').css({
				"opacity": "0","pointer-events": "none"
			});
			$('.btMessUmDois').css({
				"opacity": "0","pointer-events": "none"
			});

			self.repQuatro = true;
		} else {
			$('.repDes4').fadeOut(100);
			$('.ConProb4').fadeOut(100);

			setTimeout(function() {
			$('#imgRepUm').css({
				"opacity": "1"
			})
			}, 200);
			$('.ConRepUm').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('#imgRepDois').css({
				"opacity": "1"
			})
			}, 200);
			$('.ConRepDois').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('#imgRepTres').css({
				"opacity": "1"
			})
			}, 200);
			$('.ConRepTres').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('.ConDesUm').css({
				"opacity": "1"
			})
			}, 200);
			$('.ConDesUm').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('.ConDesDois').css({
				"opacity": "1"
			})
			}, 200);
			$('.ConDesDois').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('.ConDesTres').css({
				"opacity": "1"
			})
			}, 200);
			$('.ConDesTres').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('.btMessUm').css({
				"opacity": "1"
			});
			}, 200);
			$('.btMessUm').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			setTimeout(function() {
			$('.btMessUmDois').css({
				"opacity": "1"
			});
			}, 200);
			$('.btMessUmDois').css({
				"cursor":"pointer","pointer-events": "visible"
			})

			self.repQuatro = false;
		}
	});
}

app.events = function() {
	var self = this;
	$(".numUm").click(function() {
		self.counter = 0;
		$(".ConT3").hide(10);
		$(".ConT2").hide(10);

		setTimeout(function() {
			$(".ConT1").fadeIn(300);
		}, 100);

		$(".numUm").css({
			"background": "rgba(52, 152, 219, 0.9)"
		})
		$(".numDois").css({
			"background": "rgba(46, 204, 113,0.8)"
		})
		$(".numTres").css({
			"background": "rgba(46, 204, 113,0.8)"
		});
	});

	$(".numDois").click(function() {
		self.counter = 1;
		$(".ConT1").hide(10);
		$(".ConT3").hide(10);

		setTimeout(function() {
			$(".ConT2").fadeIn(300);
		}, 100);

		$(".numDois").css({
			"background": "rgba(52, 152, 219, 0.9)"
		})
		$(".numUm").css({
			"background": "rgba(46, 204, 113,0.8)"
		})
		$(".numTres").css({
			"background": "rgba(46, 204, 113,0.8)"
		});
	});

	$(".numTres").click(function() {
		self.counter = 2;
		$(".ConT1").hide(10);
		$(".ConT2").hide(10);

		setTimeout(function() {
			$(".ConT3").fadeIn(300);
		}, 100);

		$(".numTres").css({
			"background": "rgba(52, 152, 219, 0.9)"
		})
		$(".numDois").css({
			"background": "rgba(46, 204, 113,0.8)"
		})
		$(".numUm").css({
			"background": "rgba(46, 204, 113,0.8)"
		});
	});

	$('.btMessUm').click(function() {
		$('html, body').animate({
			scrollTop: (($(".conAni").offset().top) - 150)
		}, 300);
	});

	$('.btMessUmDois').click(function() {
		$('html, body').animate({
			scrollTop: (($(".sliTres").offset().top) - 140)
		}, 300);
	});

	$('.btMessDois').click(function() {
		$('html, body').animate({
			scrollTop: (($(".sliTres").offset().top) - 40)
		}, 300);
	});

	$('.um').click(function() {
		if (foi2 == false){
			$('html, body').animate({
				scrollTop: (($(".sliDois").offset().top) - 140)
			}, 300);
		}
		if (foi2 == true){
			$('html, body').animate({
				scrollTop: (($(".sliTres").offset().top) - 140)
			}, 300);
		}

	});

	$('.quatro').click(function() {
		if (foi == true){
			$('html, body').animate({
				scrollTop: (($(".sliUm").offset().top) - 140)
			}, 300);
		}
		if(foi == false){
			$('html, body').animate({
				scrollTop: (($(".sliDois").offset().top) - 140)
			}, 300);
		}
	});

	/* -------------  MENU -------------------------------*/
	$('.tres').click(function() {
		$('html, body').animate({
			scrollTop: (($(".conAni").offset().top) - 105)
		}, 300);
		self.start = true;
	});

	$('.tres2').click(function() {
		$('html, body').animate({
			scrollTop: (($(".sliUm").offset().top) - 105)
		}, 300);
	});

	$('.dois').click(function() {
		$('html, body').animate({
			scrollTop: (($(".sliTres").offset().top) - 205)
		}, 300);
	});
	/* -------------  MENU -------------------------------*/
	$('html').click(function() {
		$('.repDes1').fadeOut(100);
		$('.ConProb').fadeOut(100);

		$('.repDes2').fadeOut(100);
		$('.ConProb2').fadeOut(100);

		$('.repDes3').fadeOut(100);
		$('.ConProb3').fadeOut(100);

		$('.repDes4').fadeOut(100);
		$('.ConProb4').fadeOut(100);

		setTimeout(function() {
		$('#imgRepUm').css({
			"opacity": "1"
		})
		}, 200);
		$('.ConRepUm').css({
			"cursor":"pointer","pointer-events": "visible"
		})

		setTimeout(function() {
		$('#imgRepDois').css({
			"opacity": "1"
		})
		}, 200);
		$('.ConRepDois').css({
			"cursor":"pointer","pointer-events": "visible"
		})

		setTimeout(function() {
		$('#imgRepTres').css({
			"opacity": "1"
		})
		}, 200);
		$('.ConRepTres').css({
			"cursor":"pointer","pointer-events": "visible"
		})

		setTimeout(function() {
		$('#imgRepQuatro').css({
			"opacity": "1"
		})
		}, 200);
		$('.ConRepQuatro').css({
			"cursor":"pointer","pointer-events": "visible"
		})

		setTimeout(function() {
		$('.ConDesUm').css({
			"opacity": "1"
		})
		}, 200);
		$('.ConDesUm').css({
			"cursor":"pointer","pointer-events": "visible"
		})

		setTimeout(function() {
		$('.ConDesDois').css({
			"opacity": "1"
		})
		}, 200);
		$('.ConDesDois').css({
			"cursor":"pointer","pointer-events": "visible"
		})

		setTimeout(function() {
		$('.ConDesTres').css({
			"opacity": "1"
		})
		}, 200);
		$('.ConDesTres').css({
			"cursor":"pointer","pointer-events": "visible"
		})

		setTimeout(function() {
		$('.ConDesQuatro').css({
			"opacity": "1"
		})
		}, 200);
		$('.ConDesQuatro').css({
			"cursor":"pointer","pointer-events": "visible"
		})

		setTimeout(function() {
		$('.btMessUm').css({
			"opacity": "1"
		});
		}, 200);
		$('.btMessUm').css({
			"cursor":"pointer","pointer-events": "visible"
		})

		setTimeout(function() {
		$('.btMessUmDois').css({
			"opacity": "1"
		});
		}, 200);
		$('.btMessUmDois').css({
			"cursor":"pointer","pointer-events": "visible"
		})
	});

	$('.repQuatro').click(function(event) {
		event.stopPropagation();
	});
	$('.repTres').click(function(event) {
		event.stopPropagation();
	});
	$('.repDois').click(function(event) {
		event.stopPropagation();
	});
	$('.repUm').click(function(event) {
		event.stopPropagation();
	});

	$(".edif").click(function() {
		if (!self.desc1) {
			$('.desc1').show(300);
			setTimeout(function() {
				$('.txDesc1').fadeIn(200);
			}, 200);

			$('.estr').fadeOut(100);
			$('.munic').fadeOut(100);
			$('.agua').fadeOut(100);
			$('.planeta').css({
				"opacity": "0"
			})

			self.desc1 = true;
		} else {
			$('.desc1').fadeOut(100);
			$('.txDesc1').fadeOut(100);

			$('.estr').fadeIn(300);
			$('.munic').fadeIn(300);
			$('.agua').fadeIn(300);
			$('.planeta').css({
				"opacity": "1"
			})

			self.desc1 = false;
		}
	});

	$(".estr").click(function() {
		if (!self.desc2) {
			$('.desc2').show(300);
			setTimeout(function() {
				$('.txDesc2').fadeIn(200);
			}, 200);

			$('.edif').fadeOut(100);
			$('.munic').fadeOut(100);
			$('.agua').fadeOut(100);
			$('.planeta').css({
				"opacity": "0"
			})

			self.desc2 = true;
		} else {
			$('.desc2').fadeOut(100);
			$('.txDesc2').fadeOut(100);

			$('.edif').fadeIn(300);
			$('.munic').fadeIn(300);
			$('.agua').fadeIn(300);
			$('.planeta').css({
				"opacity": "1"
			})

			self.desc2 = false;
		}
	});

	$(".munic").click(function() {
		if (!self.desc3) {
			$('.desc3').show(300);
			setTimeout(function() {
				$('.txDesc3').fadeIn(200);
			}, 200);

			$('.estr').fadeOut(100);
			$('.edif').fadeOut(100);
			$('.agua').fadeOut(100);
			$('.planeta').css({
				"opacity": "0"
			})

			setTimeout(function() {
				$(".munic").css({
					"margin-left": "10%"
				})
			}, 100);

			self.desc3 = true;
		} else {
			$('.desc3').fadeOut(100);
			$('.txDesc3').fadeOut(100);

			$('.estr').fadeIn(300);
			$('.edif').fadeIn(300);
			$('.agua').fadeIn(300);
			$('.planeta').css({
				"opacity": "1"
			})

			$(".munic").css({
				"margin-left": "20%"
			})

			self.desc3 = false;
		}
	});
	$(".agua").click(function() {
		if (!self.desc4) {
			$('.desc4').show(300);
			setTimeout(function() {
				$('.txDesc4').fadeIn(200);
			}, 200);

			$('.estr').fadeOut(100);
			$('.edif').fadeOut(100);
			$('.munic').fadeOut(100);
			$('.planeta').css({
				"opacity": "0"
			})

			setTimeout(function() {
				$(".agua").css({
					"margin-left": "10%"
				})
			}, 200);

			self.desc4 = true;
		} else {
			$('.desc4').fadeOut(100);
			$('.txDesc4').fadeOut(100);

			$('.estr').fadeIn(300);
			$('.edif').fadeIn(300);
			$('.munic').fadeIn(300);
			$('.planeta').css({
				"opacity": "1"
			})

			$(".munic").css({
				"margin-left": "20%"
			})
			$(".agua").css({
				"margin-left": "10%"
			})

			self.desc4 = false;
		}
	});

	$('html').click(function() {
		if (self.fora == 1) {
			$('.desc1').fadeOut(100);
			$('.desc2').fadeOut(100);
			$('.desc3').fadeOut(100);
			$('.desc4').fadeOut(100);
			$('.txDesc1').fadeOut(100);
			$('.txDesc2').fadeOut(100);
			$('.txDesc3').fadeOut(100);
			$('.txDesc4').fadeOut(100);

			$('.estr').fadeIn(300);
			$('.edif').fadeIn(300);
			$('.munic').fadeIn(300);
			$('.agua').fadeIn(300);
			$('.planeta').css({
				"opacity": "1"
			})

			$(".munic").css({
				"margin-left": "20%"
			})
			$(".agua").css({
				"margin-left": "margin-left:10%"
			})
		}
	});

	$('.edif').click(function(event) {
		event.stopPropagation();
		self.fora = 1;
	});
	$('.estr').click(function(event) {
		event.stopPropagation();
		self.fora = 1;
	});
	$('.munic').click(function(event) {
		event.stopPropagation();
		self.fora = 1;
	});
	$('.agua').click(function(event) {
		event.stopPropagation();
		self.fora = 1;
	});
}

app.slide = function() {
	//console.log("slide");
	if (app.start) {
		if (app.counter == 0) {
			$(".ConT3").hide(10);
			$(".ConT2").hide(10);

			setTimeout(function() {
				$(".ConT1").fadeIn(300);
			}, 100);

			$(".numUm").css({
				"background": "rgba(52, 152, 219, 0.9)"
			})
			$(".numDois").css({
				"background": "rgba(46, 204, 113,0.8)"
			})
			$(".numTres").css({
				"background": "rgba(46, 204, 113,0.8)"
			})
			if (app.count) {
				app.counter++;
			}
			return;
		}
		else if (app.counter == 1) {
			$(".ConT1").hide(10);
			$(".ConT3").hide(10);

			setTimeout(function() {
				$(".ConT2").fadeIn(300);
			}, 100);

			$(".numDois").css({
				"background": "rgba(52, 152, 219, 0.9)"
			})
			$(".numUm").css({
				"background": "rgba(46, 204, 113,0.8)"
			})
			$(".numTres").css({
				"background": "rgba(46, 204, 113,0.8)"
			});
			
			if (app.count) {
				app.counter++;
			}
		}

		else if (app.counter == 2) {
			$(".ConT1").hide(10);
			$(".ConT2").hide(10);

			setTimeout(function() {
				$(".ConT3").fadeIn(300);
			}, 100);

			$(".numTres").css({
				"background": "rgba(52, 152, 219, 0.9)"
			})
			$(".numDois").css({
				"background": "rgba(46, 204, 113,0.8)"
			})
			$(".numUm").css({
				"background": "rgba(46, 204, 113,0.8)"
			})

			app.count = false;
			clearInterval(app.timer);
		}
	}
}

app.init = function() {
	var self = this;
	app.events();
	app.descriptions();
	app.animations();
	$(".content-container").show();
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
		center: new google.maps.LatLng(40.9900, -73.9900), // New York

		styles: [{"elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"landscape.natural","elementType":"geometry.fill","stylers":[{"color":"#f5f5f2"},{"visibility":"on"}]},{"featureType":"administrative","stylers":[{"visibility":"off"}]},{"featureType":"transit","stylers":[{"visibility":"off"}]},{"featureType":"poi.attraction","stylers":[{"visibility":"off"}]},{"featureType":"landscape.man_made","elementType":"geometry.fill","stylers":[{"color":"#ffffff"},{"visibility":"on"}]},{"featureType":"poi.business","stylers":[{"visibility":"off"}]},{"featureType":"poi.medical","stylers":[{"visibility":"on"}]},{"featureType":"poi.place_of_worship","stylers":[{"visibility":"off"}]},{"featureType":"poi.school","stylers":[{"visibility":"off"}]},{"featureType":"poi.sports_complex","stylers":[{"visibility":"off"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#ffffff"},{"visibility":"simplified"}]},{"featureType":"road.arterial","stylers":[{"visibility":"simplified"},{"color":"#ffffff"}]},{"featureType":"road.highway","elementType":"labels.icon","stylers":[{"color":"#ffffff"},{"visibility":"on"}]},{"featureType":"road.highway","elementType":"labels.icon","stylers":[{"visibility":"on"}]},{"featureType":"road.arterial","stylers":[{"color":"#ffffff"}]},{"featureType":"road.local","stylers":[{"color":"#000000"}]},{"featureType":"poi.park","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"water","stylers":[{"color":"#05E9FF"}]},{"featureType":"landscape","stylers":[{"color":"#e5e8e7"}]},{"featureType":"poi.park","stylers":[{"color":"#8ba129"}]},{"featureType":"road","stylers":[{"color":"#FAFAFA"}]},{"featureType":"poi.sports_complex","elementType":"geometry","stylers":[{"color":"#c7c7c7"},{"visibility":"off"}]},{"featureType":"water","stylers":[{"color":"#05E9FF"}]},{"featureType":"poi.park","stylers":[{"color":"#1abc9c"}]},{"featureType":"poi.park","stylers":[{"gamma":1.51}]},{"featureType":"road.local","stylers":[{"visibility":"on"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"visibility":"on"}]},{"featureType":"poi.government","elementType":"geometry","stylers":[{"visibility":"on"}]},{"featureType":"landscape","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"visibility":"simplified"}]},{"featureType":"road.local","stylers":[{"visibility":"simplified"}]},{"featureType":"road"},{"featureType":"road"},{},{"featureType":"road.highway"},{"elementType":"labels.text.stroke","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"labels","stylers":[{"color":"#8C8C8C"}]},{"elementType":"labels.icon","stylers":[{"visibility":"off"}]}]
    
    };

	var mapElement = document.getElementById('map');
	// Create the Google Map using out element and options defined above
	this.map = new google.maps.Map(mapElement, mapOptions);

	google.maps.event.addListener(this.map, 'tilesloaded', function(evt) {
		self.init();
	});
}


$(document).ready(function() {
	app.setScroll();
	app.initMaps();
})
