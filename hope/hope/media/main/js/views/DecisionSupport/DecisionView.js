/*
|--------------------------------------------------------------------------
| DecisionView
|--------------------------------------------------------------------------
| 'Front Controller' to #decision view
| View responsible for object creation with map shape editing 
| features.
| 
*/

var DecisionView = Backbone.View.extend({

	/**
	 *
	 * el: 			manage-page is the div#id 
	 * template: 	#decision-page-template, find it in templates/templates-manage.html.
	 *
	 **/
	events: {
		'change #decision_cat_select': 'onCategorySelect',
		'change #algorithm-decision': "onAlgorithmSelect",
		'click #refresh-algorithm': "refreshAlgorithm",
		'click .lock': "lockSlider",
		'click #equal-sliders': 'equalSliders',
		'change .icheck': 'changeSliderCheck',
		'click #decision-page .avatar': 'chooseOccurrence',
		'click .dss_item': 'createModal',
		'click #moredetails-btn': 'moreDetails',
		'click .decision_child_class' : 'onChildSelect',
		'click #export-csv-btn': 'exportCSV'
	},

	loaded: false,
	editMode: false,
	el: $("#page"),
	categorySelected: 0,
	occurrencesList: null,
	attrList: null,
	map: null,
	bounds: [],
	ADSliders: {},
	markers: [],

	bindApi: "Ajh4bRNoW057FZF_guDijh3eb1fSSyT8KvN3WoQcxqnwtXK9jLIAxY5Tl8iYssoY",
	serverURL: window.location.origin,
	

	categoryList: new CategoryList(null, {
		scope: 1
	}),

	initialize: function() {
		_.bindAll(this, 'moreDetails','createModal', 'chooseOccurrence', 'changeSliderCheck', 'onAlgorithmSelect','equalSliders', 'resetMaps', 'initMaps', 'load', 'unload', 'isLoaded', 'setMapCenter', 'hide', 'show','cleanView', 'initHook', 'exitHook','buildSingle','renderDecisionTemplate', 'onCategorySelect', 'makeSliders', 'createOccurrences', 'makeScores', 'makeTOPSIScores', 'makeTOPSISDecision');
		
		this.categorySelected = 0;
	},

	/**
     *
     *	Action goes here
     *
     **/

    chooseOccurrence: function(evt) {
    	//console.log("DEBUGG DSS");
    	var target = $(evt.currentTarget);
    	if (target.attr("class") == "avatar green occ_selected") {
    		target.attr("class", "avatar cyan");
    		//console.log(target.attr("rel"));
    		target.html("<i class='icon-remove icon-2x'></i>");
    	} else {
    		target.attr("class", "avatar green occ_selected");
    		target.html("<i class='icon-ok icon-2x'></i>");
    	}

    	var selected = $("#box-occs .occ_selected").length;
    	var total = this.occurrencesList.length;

    	$("#number_occs").html(''+selected+" of "+total);
    },


    onChildSelect: function(evt) {
		// SHOW CHILD DETAILS
		//console.log("[DecisionView] Child Selected");

		var child_btn = evt.currentTarget;
		var cat_id = $(child_btn).attr("id");
		//console.log(cat_id);
		//this.categorySelected = cat_id;

		$("#decision_cat_select").val(""+cat_id).trigger("change");
	},

    moreDetails: function() {
    	if ($("#moutput-box").is(":visible") == false) {
    		$("#moutput-box").show();
    		$("#mpesada-box").show();
    		$("#moredetails-btn").html("Click to hide details");
    	} else {
    		$("#moutput-box").hide();
    		$("#mpesada-box").hide();
    		$("#moredetails-btn").html("Click to see more details");
    		
    	}
    },

    testarCenas: function(evt) {

    },

    onAlgorithmSelect: function(evt) {
    	var type = evt.currentTarget.value;
    	if (type == 0) {
    		this.makeDecision();
    		$("#quick-search-decision").val('');
    	} else {
    		this.makeTOPSISDecision();
    		$("#quick-search-decision").val('');
    	}
    },

    equalSliders: function(evt) {
    	var len = $("#sliders .slider").length;
    	var part = parseFloat(100.0 / len).toFixed(1);

    	$("#sliders .slider").each(function() {
    		$(this).slider("value", part);
    	});
    },

    changeSliderCheck: function(evt) {
    	var slider_id = $(evt.currentTarget).attr("rel");
    	
    	if ($("#"+slider_id).slider("option", "disabled") == false) {
    		$("#"+slider_id).slider("option", "disabled", true);
    		$("#"+slider_id).slider("option", "value", 0);
    		$("#"+slider_id).addClass("sliderDisabled");
    		$("#lock-"+slider_id).attr("disabled", "disabled");
    		$("#input-"+slider_id).attr("disabled", "disabled");
    	} else {
    		$("#"+slider_id).slider("option", "disabled", false);
    		$("#lock-"+slider_id).removeAttr("disabled");
    		$("#input-"+slider_id).removeAttr("disabled");
    	}
    	
    },

    refreshAlgorithm: function() {
    	var type = $("#algorithm-decision").val();
    	if (type == 0) {
    		this.makeDecision();
    		$("#quick-search-decision").val('');
    	} else {
    		this.makeTOPSISDecision();
    		$("#quick-search-decision").val('');
    	}
    },

    initMaps: function() {
    	var mapOptions = {
    		zoom: 8,
    		center: new google.maps.LatLng(40.20000, -8.41667),
    		mapTypeId: google.maps.MapTypeId.ROADMAP
    	};

    	this.map = new google.maps.Map(document.getElementById('decision_map'), mapOptions);
    	this.markers = [];
    	this.bounds = new google.maps.LatLngBounds();
    },

    resetMaps: function() {
    	for (var i = 0; i < this.markers.length; i++) {
    		this.markers[i].setMap(null);
    	};
    	this.markers = [];
    	this.bounds = new google.maps.LatLngBounds();;
    	this.bounds.extend(new google.maps.LatLng(40.20000, -8.41667));
    	this.map.fitBounds(this.bounds);
    },

    exportCSV: function(evt) {
    	var cat_id = this.categorySelected;
    	window.open(this.serverURL + "/hope/support/export/"+cat_id+"/", '_blank');
    },

    onCategorySelect: function(evt) {

    	var that = this;
    	//console.log("[DecisionView] Category selected.");
    	var cat_id = evt.currentTarget.value;
    	this.categorySelected = cat_id;

    	//TODO
    	// Get occurrences
    	if (cat_id != undefined) {
	    	$.post(this.serverURL + "/hope/categories/occurrences/"+cat_id+"/", {csrfmiddlewaretoken:$.cookie('csrftoken')}, function(data) {
				//console.log("[DecisionView] Get category occurrences.");
				//console.log(data);
				that.makeSliders(data.attrs);
				that.attrList = data.attrs;
				that.occurrencesList = data.occurrences;
				that.createOccurrences(data.occurrences);

				var parents = data.parents;
				var parents_text = "";

				for (var i = parents.length-1; i >= 0; i--) {
					parents_text += "<a class='decision_child_class' id='"+parents[i].id+"'>"+parents[i].name+"</a> <i class='icon-angle-right'></i> ";
				}
				
				parents_text += ""+$("#decision_cat_select :selected").text();

				$("#decision_cat_hier").html(parents_text);

			}, "json");
    	}
    	
    	// List occurrences on #decision-box-list
    	// Show sliders for visible attributes
    },

    createOccurrences: function(occurrences) {
    	var that = this;
		//console.log("[DecisionView] Create occurrences.");
		//console.log(occurrences);

		$("#decision-box-list").html('');

		var domID = _.uniqueId('dec_item');

		this.resetMaps();

		for (var i = 0; i < occurrences.length; i++) {

			/* CREATE MARKER ON MAP */
			var startObj = occurrences[i].coordinate;
			var modelCoord = startObj.split(",");

			var occLatlng = new google.maps.LatLng(modelCoord[0], modelCoord[1]);

			var pinColor = "a54747";
				var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
					new google.maps.Size(21, 34),
					new google.maps.Point(0, 0),
					new google.maps.Point(10, 34));

			var marker = new google.maps.Marker({
				position: occLatlng,
				map: that.map,
				title: occurrences[i].title,
				icon: pinImage
			});

			marker.occ_id = occurrences[i].id;
			// pass the view so we can use the callback function in right context
			marker.view = that;

			google.maps.event.addListener(marker, 'click', function() {
				//console.log("DEBUG!!");
				//console.log(occurrences[i])
				that.occurrenceModal = new OccurrenceModalView({
					view: that,
					model: marker.occ_id
				});
			});

			that.markers.push(marker);
			that.bounds.extend(occLatlng);
			that.map.fitBounds(that.bounds);

			var tmpl = _.template($("#decision_item").html(), {
				id: occurrences[i].id,
				name: occurrences[i].title,
				domID: domID,
				description: occurrences[i].description,
				validated: 1,
				category_name: $("#decision_cat_select :selected").text(),
				created_at: occurrences[i].created_at,
				score: 0,
				color: 0,
				selected: true
			});
			$("#decision-box-list").append(tmpl);
		}

		$("#quick-search-decision").keyup(function() {
			var e = $(this).val(),
				t = 0,
				n = 0;
			$(".decision_class_search").each(function() {
				if ($(this).text().search(new RegExp(e, "i")) < 0) {
					//console.log("HIDE CENAS!!");
					var selected = $("#box-occs .occ_selected").length;
			    	var total = that.occurrencesList.length;

			    	$("#number_occs").html(''+selected+" of "+total);
					$(this).hide();
					var avatar = $(this).find("a.avatar");
					avatar.attr("class", "avatar cyan");
					avatar.html("<i class='icon-remove icon-2x'></i>");
				} else {
					$(this).show();
					var selected = $("#box-occs .occ_selected").length;
			    	var total = that.occurrencesList.length;

			    	$("#number_occs").html(''+selected+" of "+total);

					var avatar = $(this).find("a.avatar");
					avatar.attr("class", "avatar green occ_selected");
					avatar.html("<i class='icon-ok icon-2x'></i>");
					t++
				}
			})
		});

		$("#number_occs").html(""+occurrences.length+" of "+occurrences.length);

    	$("#quick-search-div").show();
    	$("#occ-list-box").show();

    	BarNotification.remove();

    },

    lockSlider: function(evt) {
    	var that = this;
		var slider_id = $(evt.currentTarget).attr('rel');
		var sliders = $("#sliders .slider");

		if ($("#" + slider_id).slider("option", "disabled") == false) {
			$("#check-"+slider_id).attr("disabled", "disabled");
			$("#input-"+slider_id).attr("disabled", "disabled");

			$(evt.currentTarget).html("<i class='icon-lock'></i>");
			$(evt.currentTarget).attr("class", "btn btn-gray lock input-block-level");
			
			$("#" + slider_id).slider('option', 'disabled', true);

			var total = 100;
			sliders.each(function() {
				if ($(this).slider("option", "disabled") == true) {
					total -= $(this).slider("option", "value");
				}
			});

			sliders.each(function() {
				if ($(this).slider("option", "disabled") != true) {
					that.ADSliders[$(this).attr("id")] = total;
				}
			});

			sliders.linkedSliders("destroy");

			sliders.linkedSliders({
				total: 100,
				policy: 'all'
			});

		} else {
			$("#check-"+slider_id).removeAttr("disabled");
			$("#input-"+slider_id).removeAttr("disabled");

			$("#" + slider_id).slider('option', 'disabled', false);
			$(evt.currentTarget).html("<i class='icon-unlock'></i>");
			$(evt.currentTarget).attr("class", "btn btn-default lock input-block-level");

			var total = 100;
			sliders.each(function() {
				if ($(this).slider("option", "disabled") == true) {
					total -= $(this).slider("option", "value");
				}
			});

			sliders.each(function() {
				if ($(this).slider("option", "disabled") != true) {
					that.ADSliders[$(this).attr("id")] = total;
				}
			});

			sliders.linkedSliders("destroy");

			sliders.linkedSliders({
				total: 100,
				policy: 'all'
			});

		}

    },

    makeSliders: function(attributes) {
    	var that = this;
    	//console.log("[DecisionView] Make sliders.");
    	$("#sliders").show();
    	//console.log(attributes);

		var template = "";
		/*for (var i = 0; i < attributes.length; i++) {
			var checkID = _.uniqueId('slider_');
			template += "<div class='sliderContent'>"+attributes[i].name+"<br>"+"<div class='slider span10' id='"+attributes[i].id+"' type='"+attributes[i].type+"'></div><input type='text' class='icheck span2'/> <input type='checkbox' class='span4' checked id='"+checkID+"'/></div>"
		}*/

		for (var i = 0; i < attributes.length; i++) {

			var sliderID = "slider-"+attributes[i].id;
			var inputID = "input-"+sliderID;
			var checkID = "check-"+sliderID;
			var lockID = "lock-"+sliderID;
			template += "<div class='row-fuid sliderTitle><div class='span12'>"+attributes[i].name+"</div></div>";
			template += "<div class='row-fluid sliderContent'><div class='span1'><input type='checkbox' checked class='icheck' rel='"+sliderID+"' id='"+checkID+"'></div><div class='span7'><div class='slider' id='"+sliderID+"' type='"+attributes[i].type+"'></div></div><div class='span2'><input class='input-block-level' id='"+inputID+"' type='number' min='0' max='100'></div><div class='span2'><button class='btn btn-default lock input-block-level' rel='"+sliderID+"' id='"+lockID+"'><i class='icon-unlock'></i></button></div></div>";
			this.ADSliders[sliderID] = 100;
		}

		$("#sliders").html(template);
		$(".sliderContent input").iCheck({
			checkboxClass: "icheckbox_flat-aero",
			radioClass: "iradio_flat-aero"
		});

		if (attributes.length > 0) {
			var sliders = $("#sliders .slider");
			sliders.slider({
				value: 0,
				min: 0,
				max: 100,
				range: "min",
				step: 1,
				change: function(event, ui) {
					var curr_slider = $(this);
					var id = curr_slider.attr("id");
					var input = $("#input-"+id);
					var slider_max = that.ADSliders[id];

					input.unbind("change keyup").bind("change keyup", function() {
						var value = input.val();
						/*if (isNaN(value) == false && value != '') {
							if (parseFloat(value) <= slider_max) {
								curr_slider.slider("value", value);
							} else {
								curr_slider.slider("value", slider_max);
							}
						} else if (value == '') {
							curr_slider.slider("value", 0);
						}*/
						if (value >= slider_max) {
							curr_slider.slider("value", slider_max);
						} else {
							curr_slider.slider("value", value);
						}
						
					});
					input.val(ui.value);
				},

				stop: function(event, ui) {
					var slider_id = $(this).attr("id");
					var slider_max = that.ADSliders[slider_id];
					if (ui.value > slider_max) {
						$(this).slider("value", slider_max);
					}
				},

				slide: function(event, ui) {
					var curr_slider = $(this);
					var id = curr_slider.attr("id");
					var input = $("#input-"+id);
					input.val(ui.value);
				}

			}).linkedSliders({
				total: 100,
				policy: 'all'
			});

			sliders.each(function(index) {
				if ($(this).attr("type") == "cost") {
					$(this).children("div").css("background", "red");
				}
			});
		}
	},

	makeTOPSISDecision: function(evt) {
    	$("#matriz_output").html('');
    	$("#matriz_pesada").html('');
    	var that = this;

    	//console.log("[DecisionView] make decision support.");
    	var cat_id = this.categorySelected;
    	var attr_values = [];

    	$(".slider").each(function() {
    		var type = 0;
    		if ($(this).attr("type") == "cost") {
    			type = 1;
    		} else {
    			type = 0;
    		}
    		attr_values.push({
    			id: $(this).attr("id"),
    			value: $(this).slider("value"),
    			type: type
    		});
    	});

    	var occs_selected = $("#box-occs .occ_selected");
    	var occs_ids = [];
		if (occs_selected.length > 0) {
			$("#box-occs .avatar").each(function() {
				var occ_id = $(this).attr("rel");
				if ($(this).hasClass("occ_selected")) {
					occs_ids.push(occ_id);
					for (var i = 0; i < that.occurrencesList.length; i++) {
						if (that.occurrencesList[i].id == occ_id) {
							that.occurrencesList[i].occ_selected = true;
							break;
						}
					};
				} else {
					//console.log(occ_id + "nao esta selected!");
					for (var i = 0; i < that.occurrencesList.length; i++) {
						if (that.occurrencesList[i].id == occ_id) {
							//console.log("ELEMENTO NAO SELECTED:");
							//console.log(that.occurrencesList[i]);
							that.occurrencesList[i].occ_selected = false;
							break;
						}
					};
				}

			});
    	} else {
    		alert("No occurrences found.");
    		return;
    	}

    	var that = this;
		$.post(this.serverURL + "/hope/support/" + cat_id + "/", {
			'attrs': JSON.stringify(attr_values), 'occ_ids': JSON.stringify(occs_ids),
			csrfmiddlewaretoken: $.cookie('csrftoken')
		}, function(data) {
			//console.log("TOPSIS");
			console.log("[DecisionView] support decision request.");
			//console.log(data);
			
			var madness = data.madness;
			var outputs = data.output_attrs;
			var indProx = data.super_madness;
			var occs = that.occurrencesList;
			
			//console.log("Outputs:");
			//console.log(outputs);

			var selected_i = 0;

			var template = "<table id='table_output_matriz'>";
			var template_pesada = "<table id='table_pesada_matriz'>";

			template += "<thead><tr><th>Occurrence</th>";
			template_pesada += "<thead><tr><th>Occurrence</th>";
			for (var i = 0; i < that.attrList.length; i++) {
				template += "<th>" + that.attrList[i].name + "</th>";
				template_pesada += "<th>" + that.attrList[i].name + "</th>";
			}
			template += "</tr></thead><tbody>";
			template_pesada += "</tr></thead><tbody>";
			for (var i = 0; i < occs_selected.length; i++) {
				if (occs[i].occ_selected != false) {
					if (selected_i < outputs.length) {
						template += "<tr>";
						template_pesada += "<tr>";

						template += "<td>"+occs[i].title+"</td>";
						template_pesada += "<td>"+occs[i].title+"</td>";

						for (j = 0; j < outputs[selected_i].length; j++) {
							template += "<td>"+outputs[selected_i][j]+"</td>";
						}

						for (j = 0; j < madness[i].length; j++) {
							template_pesada += "<td>"+parseFloat(madness[selected_i][j]).toFixed(2)+"</td>";
						}

						template += "</tr>";
						template_pesada += "</tr>";
						selected_i++;
					}
				}
			}

			template += "</tbody>";
			template += "</table>";
			template_pesada += "</tbody>";
			template_pesada += "</table>";

			$("#matriz_output").html(template);

			$("#table_output_matriz").dataTable({
				'bPaginate': false,
				'bInfo': false
			});
			
			$("#matriz_pesada").html(template_pesada);
			
			$("#table_pesada_matriz").dataTable({
				'bPaginate': false,
				'bInfo': false
			});
			
			that.makeTOPSIScores(indProx);
			
		}, "json");

		$("#box-moredetails").show(); 
		

	},

    makeDecision: function(evt) {
    	$("#matriz_output").html('');
    	$("#matriz_pesada").html('');
    	
    	var that = this;
    	for (var i = 0; i < that.occurrencesList.length; i++) {
			that.occurrencesList[i].occ_selected = true;
		};

    	//console.log("[DecisionView] make decision support.");
    	var cat_id = this.categorySelected;
    	var attr_values = [];

    	$(".slider").each(function() {
    		var type = 0;
    		if ($(this).attr("type") == "cost") {
    			type = 1;
    		} else {
    			type = 0;
    		}
    		attr_values.push({
    			id: $(this).attr("id"),
    			value: $(this).slider("value"),
    			type: type
    		});
    	});

    	var occs_selected = $("#box-occs .occ_selected");
    	var occs_ids = [];
		if (occs_selected.length > 0) {
			$("#box-occs .avatar").each(function() {
				var occ_id = $(this).attr("rel");
				if ($(this).hasClass("occ_selected")) {
					occs_ids.push(occ_id);
					for (var i = 0; i < that.occurrencesList.length; i++) {
						if (that.occurrencesList[i].id == occ_id) {
							that.occurrencesList[i].occ_selected = true;
							break;
						}
					};
				} else {
					//console.log(occ_id + "nao esta selected!");
					for (var i = 0; i < that.occurrencesList.length; i++) {
						if (that.occurrencesList[i].id == occ_id) {
							//console.log("ELEMENTO NAO SELECTED:");
							//console.log(that.occurrencesList[i]);
							that.occurrencesList[i].occ_selected = false;
							break;
						}
					};
				}

			});
    	} else {
    		alert("No occurrences found.");
    		return;
    	}

		$.post(this.serverURL + "/hope/support/" + cat_id + "/", {
			'attrs': JSON.stringify(attr_values), 'occ_ids': JSON.stringify(occs_ids),
			csrfmiddlewaretoken: $.cookie('csrftoken')
		}, function(data) {
			//console.log("SOMA PESADA");
			console.log("[DecisionView] support decision request.");
			//console.log(data);

			var madness = data.madness;
			var outputs = data.output_attrs;
			var scores = data.scores;
			var occs = that.occurrencesList
			
			var template = "<table id='table_output_matriz'>";
			var template_pesada = "<table id='table_pesada_matriz'>";

			template += "<thead><tr><th>Occurrence</th>";
			template_pesada += "<thead><tr><th>Occurrence</th>";
			for (var i = 0; i < that.attrList.length; i++) {
				template += "<th>" + that.attrList[i].name + "</th>";
				template_pesada += "<th>" + that.attrList[i].name + "</th>";
			}
			template += "</tr></thead><tbody>";
			template_pesada += "</tr></thead><tbody>";

			var selected_i = 0;
			//console.log("outputs:");
			//console.log(outputs.length);
			//console.log(occs);

			console.log(occs);
			for (var i = 0; i < occs.length; i++) {
				if (occs[i].occ_selected != false) {
					if (selected_i < outputs.length) {
						template += "<tr>";
						template_pesada += "<tr>";
						
						//console.log("TITLE : "+occs[i].title);

						template += "<td>"+occs[i].title+"</td>";
						template_pesada += "<td>"+occs[i].title+"</td>";

						for (j = 0; j < outputs[selected_i].length; j++) {
							//console.log("Attr for : "+occs[i].title);
							//console.log(""+outputs[selected_i][j]);
							template += "<td>"+outputs[selected_i][j]+"</td>";
						}
						//console.log("----");

						for (j = 0; j < madness[selected_i].length; j++) {
							template_pesada += "<td>"+parseFloat(madness[selected_i][j]).toFixed(2)+"</td>";
						}

						template += "</tr>";
						template_pesada += "</tr>";
						selected_i++;
					}
				} 
			}


			template += "</tbody>";
			template += "</table>";
			template_pesada += "</tbody>";
			template_pesada += "</table>";

			$("#matriz_output").html(template);

			$("#table_output_matriz").dataTable({
				'bPaginate': false,
				'bInfo': false
			});
			
			$("#matriz_pesada").html(template_pesada);
			
			$("#table_pesada_matriz").dataTable({
				'bPaginate': false,
				'bInfo': false
			});

			that.makeScores(scores);


		}, "json");

    	$("#box-moredetails").show();

    },

    makeTOPSIScores: function(scores) {
    	var that = this;

    	if (this.markers.length > 0) {	
			this.resetMaps();
		};

    	var occurrences = that.occurrencesList.slice();
    	$("#decision-box-list").html('');

		var domID = _.uniqueId('dec_item');

		var scores_i = 0;
		for (var i = 0; i < occurrences.length; i++) {
			if (occurrences[i].occ_selected != false) {
				occurrences[i].score = parseFloat(scores[scores_i])
				occurrences[i].score = (occurrences[i].score*100).toFixed(1);
				if (isNaN(occurrences[i].score)) {
					occurrences[i].score = 0;
				} 
				scores_i++;
			}
		}

		occurrences.sort(function(a,b) {
			return parseFloat(a.score) - parseFloat(b.score)
		});

		var numberOfItems = occurrences.length;
		var rainbow = new Rainbow();
		rainbow.setNumberRange(0, numberOfItems-1);
		rainbow.setSpectrum('#8cc079', '#a54747');

		var append_later = [];
		for (var i = 0; i < occurrences.length; i++) {
			if (occurrences[i].occ_selected != false) {

				/* SET COLOR SPECTRUM */
			
				var hexColour = rainbow.colourAt(i);
				color = '#' + hexColour;
			
				/* CREATE MARKER ON MAP */
				var startObj = occurrences[i].coordinate;
				var modelCoord = startObj.split(",");

				var occLatlng = new google.maps.LatLng(modelCoord[0], modelCoord[1]);

				var pinColor = hexColour;
				var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
					new google.maps.Size(21, 34),
					new google.maps.Point(0, 0),
					new google.maps.Point(10, 34));

				var marker = new google.maps.Marker({
					position: occLatlng,
					map: that.map,
					title: occurrences[i].title,
					icon: pinImage
				});

				marker.occ_id = occurrences[i].id;
				// pass the view so we can use the callback function in right context
				marker.view = that;

				google.maps.event.addListener(marker, 'click', function() {
					//console.log("DEBUG!!");
					//console.log(occurrences[i])
					that.occurrenceModal = new OccurrenceModalView({
						view: that,
						model: marker.occ_id
					});
				});

				that.markers.push(marker);
				that.bounds.extend(occLatlng);
				that.map.fitBounds(that.bounds);

				var tmpl = _.template($("#decision_item").html(), {
					id: occurrences[i].id,
					name: occurrences[i].title,
					domID: domID,
					description: occurrences[i].description,
					validated: 1,
					category_name: $("#decision_cat_select :selected").text(),
					created_at: occurrences[i].created_at,
					score: occurrences[i].score,
					color: color,
					selected: true
				});
				$("#decision-box-list").prepend(tmpl);
			} else {
				/* SET COLOR SPECTRUM */
				//var hexColour = rainbow.colourAt(i);
				color = '#bbb';

				var tmpl = _.template($("#decision_item").html(), {
					id: occurrences[i].id,
					name: occurrences[i].title,
					domID: domID,
					description: occurrences[i].description,
					validated: 1,
					category_name: $("#decision_cat_select :selected").text(),
					created_at: occurrences[i].created_at,
					score: 0,
					color: color,
					selected: false
				});
				append_later.push(tmpl);
			}
			
		}

		for (var i = 0; i < append_later.length; i++) {
			$("#decision-box-list").append(append_later[i]);
		};

		$("#quick-search-decision").keyup(function() {
			var e = $(this).val(),
				t = 0,
				n = 0;
			$(".decision_class_search").each(function() {
				if ($(this).text().search(new RegExp(e, "i")) < 0) {
					//console.log("HIDE CENAS!!");
					var selected = $("#box-occs .occ_selected").length;
			    	var total = that.occurrencesList.length;

			    	$("#number_occs").html(''+selected+" of "+total);
					$(this).hide();
					var avatar = $(this).find("a.avatar");
					avatar.attr("class", "avatar cyan");
					avatar.html("<i class='icon-remove icon-2x'></i>");
				} else {
					$(this).show();
					var selected = $("#box-occs .occ_selected").length;
			    	var total = that.occurrencesList.length;

			    	$("#number_occs").html(''+selected+" of "+total);

					var avatar = $(this).find("a.avatar");
					avatar.attr("class", "avatar green occ_selected");
					avatar.html("<i class='icon-ok icon-2x'></i>");
					t++
				}
			})
		});


		for (var i = 0; i < that.occurrencesList.length; i++) {
			that.occurrencesList[i].occ_selected = true;
		};
    },

    makeScores: function(scores) {

    	var that = this;

		//console.log("[DecisionView] Create occurrences scores.");
		if (this.markers.length > 0) {	
			this.resetMaps();
		};

		var occurrences = that.occurrencesList.slice();

		$("#decision-box-list").html('');

		var domID = _.uniqueId('dec_item');

		var scores_i = 0;
		for (var i = 0; i < occurrences.length; i++) {
			if (occurrences[i].occ_selected != false) {
				occurrences[i].score = parseFloat(scores[scores_i]).toFixed(1);
				if (isNaN(occurrences[i].score)) {
					occurrences[i].score = 0;
				} 
				scores_i++;
			}
		}

		occurrences.sort(function(a,b) {
			return parseFloat(a.score) - parseFloat(b.score)
		});

		var numberOfItems = occurrences.length;
		var rainbow = new Rainbow();
		rainbow.setNumberRange(0, numberOfItems-1);
		rainbow.setSpectrum('#8cc079', '#a54747');

		var append_later = [];
		for (var i = 0; i < occurrences.length; i++) {
			if (occurrences[i].occ_selected != false) {
				//console.log("TRUE!!!");
				//console.log(occurrences[i]);
				/* SET COLOR SPECTRUM */
				var hexColour = rainbow.colourAt(i);
				color = '#' + hexColour;

				/* CREATE MARKER ON MAP */
				var startObj = occurrences[i].coordinate;
				var modelCoord = startObj.split(",");
				
				var occLatlng = new google.maps.LatLng(modelCoord[0],modelCoord[1]);

				var pinColor = hexColour;
				var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
					new google.maps.Size(21, 34),
					new google.maps.Point(0, 0),
					new google.maps.Point(10, 34));
				var pinShadow = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_shadow",
					new google.maps.Size(40, 37),
					new google.maps.Point(0, 0),
					new google.maps.Point(12, 35));
				
				var marker = new google.maps.Marker({
					position: occLatlng,
					map: that.map,
					title: occurrences[i].title,
					icon: pinImage
				});

				marker.occ_id = occurrences[i].id;
				// pass the view so we can use the callback function in right context
				marker.view = that;

				var occ_id = occurrences[i].id;

				google.maps.event.addListener(marker, 'click', function(occ_id) {
					return function() {
						that.occurrenceModal = new OccurrenceModalView({
							view: that,
							model: occ_id
						});
					}
				}(occ_id));

				that.markers.push(marker);
				that.bounds.extend(occLatlng);
				that.map.fitBounds(that.bounds);

				var tmpl = _.template($("#decision_item").html(), {
					id: occurrences[i].id,
					name: occurrences[i].title,
					domID: domID,
					description: occurrences[i].description,
					validated: 1,
					category_name: $("#decision_cat_select :selected").text(),
					created_at: occurrences[i].created_at,
					score: occurrences[i].score,
					color: color,
					selected: true
				});

				$("#decision-box-list").prepend(tmpl);
			} else {
				//console.log("FALSE!!!");
				//console.log(occurrences[i]);

				/* SET COLOR SPECTRUM */
				//var hexColour = rainbow.colourAt(i);
				color = '#bbb';

				var tmpl = _.template($("#decision_item").html(), {
					id: occurrences[i].id,
					name: occurrences[i].title,
					domID: domID,
					description: occurrences[i].description,
					validated: 1,
					category_name: $("#decision_cat_select :selected").text(),
					created_at: occurrences[i].created_at,
					score: 0,
					color: color,
					selected: false
				});
				append_later.push(tmpl);
			}
		}

		for (var i = 0; i < append_later.length; i++) {
			$("#decision-box-list").append(append_later[i]);
		};

		$("#quick-search-decision").keyup(function() {
			var e = $(this).val(),
				t = 0,
				n = 0;
			$(".decision_class_search").each(function() {
				if ($(this).text().search(new RegExp(e, "i")) < 0) {
					//console.log("HIDE CENAS!!");
					var selected = $("#box-occs .occ_selected").length;
			    	var total = that.occurrencesList.length;

			    	$("#number_occs").html(''+selected+" of "+total);
					$(this).hide();
					var avatar = $(this).find("a.avatar");
					avatar.attr("class", "avatar cyan");
					avatar.html("<i class='icon-remove icon-2x'></i>");
				} else {
					$(this).show();
					var selected = $("#box-occs .occ_selected").length;
			    	var total = that.occurrencesList.length;

			    	$("#number_occs").html(''+selected+" of "+total);

					var avatar = $(this).find("a.avatar");
					avatar.attr("class", "avatar green occ_selected");
					avatar.html("<i class='icon-ok icon-2x'></i>");
					t++
				}
			})
		});


		for (var i = 0; i < that.occurrencesList.length; i++) {
			that.occurrencesList[i].occ_selected = true;
		};
    },

	/**
	 * 
	 * Load view and render templates and categories 
	 *
	 **/

	load: function(options) {
		//console.log("[DecisionView] Load.");
		if (!this.isLoaded()) {
			var that = this;
			this.renderDecisionTemplate();
			this.categoryList.fetch().then(function() {
				var categoriesTree = that.buildSingle(that.categoryList.models);
				that.render(categoriesTree);
				that.delegateEvents();
			});

			/* LOAD GMAPS */
			that.initMaps();
		}
		this.loaded = true;
	},

	/* OLD */
	setMapCenter: function() {
		//console.log("[DecisionMap] SET MAP CENTER TRIGGERED");
		if (window.app.lat && window.app.lng) {
			latlng = [window.app.lat, window.app.lng];
		}

		if(this.bounds) {
			this.mapObj.zoomToExtent(this.bounds, false);
		}
	},

	createModal: function(evt) {
		var model_id = $(evt.currentTarget).attr("rel");
		this.occurrenceModal = new OccurrenceModalView({view: this, model: model_id });
	},

	/**
	 *
	 * Renders the decision template, it appends it to page div
	 *
	 **/
	renderDecisionTemplate: function() {
		//console.log("[DecisionView] Render Decision Template.");
		var page = _.template($("#decision-page-template").html());
		$("#page").append(page);
	},

	render: function(categories) {
		//console.log("[DecisionView] Render Categories List.");
		//creates the form template skeleton	
		var template_manage = _.template($("#decision-categories-list").html(), {
			cat: categories
		});
		$("#decision_list_div").html(template_manage);
		$("#decision_cat_select").select2();
		$("#algorithm-decision").select2();

		$(".icheck").iCheck({
			checkboxClass: "icheckbox_flat-aero",
			radioClass: "iradio_flat-aero"
		});

		BarNotification.remove();

	},

	buildSingle: function(data) {
		var initialData = data;
		var tree = [];

		var i = 0;
		for (var i = 0; i < initialData.length; i++) {
			obj = {
				attr: {
					"id": initialData[i].attributes.pk
				},
				data: initialData[i].attributes.fields.menu_label,
				bullshit: initialData[i].attributes.fields.bullshit
			}
			tree.push(obj);
		}
		return tree;
	},
	
	cleanView: function(element) {
		element.undelegateEvents();
		element.unbind();
	},

	/* --- HELPERS --- */
	hide: function() {
		$("#decision-page").hide();
	},
	
	show: function() {
		$("#decision-page").show();
	},

	initHook: function() {
		console.log('[DecisionView] Initting');
		var that = this;

		if(!this.isLoaded) {
			this.load();
		}

		$('#dss-menu-button').removeClass('btn-default');
		$('#dss-menu-button').addClass('btn-blue');


	},

	exitHook: function() {
		this.options.app.log('[DecisionView] Exiting');
		$('#dss-menu-button').removeClass('btn-blue');
		$('#dss-menu-button').addClass('btn-default');

	},

	unload: function() {
		this.loaded = false;
	},
	
	isLoaded: function() {
		return this.loaded;
	},
	/* -- -- */

});

/*
|--------------------------------------------------------------------------
| FollowersModalView
|--------------------------------------------------------------------------
| This view generates the modal window that controls the report followers 
| permissions
| 
*/
var OccurrenceModalView = Backbone.View.extend({
		
	events: {
		
	},

	el: $("#occ-modal"),

	initialize: function(options) {
		_.bindAll(this);
		this.view = options.view;
		this.occ_id = options.model;
		//console.log("MODEL OK!");
		this.render();
	},


	render: function() {
		var that = this;

		for (var i = 0; i < this.view.occurrencesList.length; i++) {
			if (this.view.occurrencesList[i].id == this.occ_id) {
				this.model = this.view.occurrencesList[i];
				break;
			}
		};

		if (that.model.photos.length <= 0) {
			$("#photos-modal-div").hide();
		}

		var tmpl = _.template($('#occ-modal-template').html(), {
			'title': that.model.title,
			'description': that.model.description,
			'coordinate': that.model.coordinate,
			'photos': that.model.photos
		});

		$('#occ-modal').html(tmpl);

		coordObj = that.model.coordinate.split(",");
		var latLng = new google.maps.LatLng(coordObj[0], coordObj[1]);

		var mapOptions = {
    		zoom: 8,
    		center: latLng,
    		mapTypeId: google.maps.MapTypeId.ROADMAP
    	};

    	var dss_map = new google.maps.Map(document.getElementById('modal-map'), mapOptions);

    	
		google.maps.event.addListenerOnce(dss_map, 'idle', function() {
			google.maps.event.trigger(dss_map, 'resize');
		});

		var marker = new google.maps.Marker({
			position: latLng,
			map: dss_map,
			title: that.model.title,
		});

		marker.setMap(dss_map);

		//var bounds = new google.maps.LatLngBounds();
		//bounds.extend(latLng);
		//var zoom = dss_map.getZoom();
		//dss_map.setCenter(latLng, zoom);

		//dss_map.fitBounds(bounds);

		$('#occ_modal').on('shown', function() {
			dss_map.setCenter(latLng);
			google.maps.event.trigger(dss_map, 'resize');
		});

		$('#occ_modal').modal('show');
		this.delegateEvents();
	}

});

