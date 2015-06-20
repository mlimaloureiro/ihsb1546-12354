/*
|--------------------------------------------------------------------------
| ManageView
|--------------------------------------------------------------------------
| 'Front Controller' to #manage view
| View responsible for object creation with map shape editing 
| features.
| 
*/

var ManageView = Backbone.View.extend({

	/**
	 *
	 * el: 			manage-page is the div#id 
	 * template: 	#manage-page-template, find it in templates/templates-manage.html.
	 *
	 **/
	events: {
		'click #new_attr_btn': 'newAttribute',
		'click #save_changes_btn': 'saveChanges',
		'click #cancel_changes_btn': 'cancelChanges',
		'click .delete_attr_btn': 'deleteAttr',
		'click .edit_attr_btn': 'editAttr',
		'click #add_new_child_btn': 'addNewChild',
		'click #add_new_cat_btn' : 'addNewCategory',
		'click #delete_cat_btn': 'deleteCategory',
		'click #edit_cat_btn': 'editCategory',
		'click .child_class':'onChildSelect',
		'click #save_edit_cat_btn': 'saveEditCategory',
		'change #manage_cat_select': 'onCategorySelect',
		'change #manage_root_select': 'onRootSelect'
	},

	loaded: false,
	editMode: false,
	toDelete: 0,
	newAttr: 0,
	categorySelected: 0,
	anyChanges: false,
	el: $("#page"),
	serverURL: window.location.origin,

	/**
	 *
	 *	nothing special goes here, just initialize events
	 *
	 **/
	categoryList: new CategoryList(null, {
		scope: 1
	}),

	initialize: function() {
		_.bindAll(this, 'load', 'unload', 'isLoaded', 'onRootSelect','hide', 'show','cleanView', 'initHook', 'exitHook','buildSingle','renderManageTemplate','newAttribute','cancelChanges','saveChanges','onCategorySelect','addNewCategory','addNewChild', 'deleteCategory', 'onChildSelect');
		this.newAttr = 0;
		this.toDelete = 0;
		this.categorySelected = 0;
		this.anyChanges = false;
		$.fn.editable.defaults.mode = 'popup';

	},

	load: function(options) {
		//console.log("[ManageView] Load");
		if (!this.isLoaded()) {
			var that = this;
			this.renderManageTemplate();
			this.categoryList.fetch().then(function() {
				var categoriesTree = that.buildSingle(that.categoryList.models);
				that.render(categoriesTree);
				that.delegateEvents();
			});
		}
		this.loaded = true;
	},

	/**
	 *
	 * Renders the manage template, it appends it to page div
	 *
	 **/
	renderManageTemplate: function() {
		//console.log("[ManageView] Render Manage Template");
		var page = _.template($("#manage-page-template").html());
		$("#page").append(page);
	},
	
	cleanView: function(element) {
		element.undelegateEvents();
		element.unbind();
	},

	render: function(categories) {
		//console.log("[ManageView] Render Categories List");
		//creates the form template skeleton	
		var template_manage = _.template($("#manage-categories-list").html(), {
			cat: categories
		});

		var template_root = _.template($("#manage-root-list").html(), {
			cat: categories
		});

		$("#categories_list_div").html(template_manage);
		$("#root_list_div").html(template_root);
		$("#manage_cat_select").select2();
		$("#manage_root_select").select2();

		/* TOGGLE EVENTS */
		$("#new_category_btn").click(function(){
			$("#add_new_category").toggle();
		});
		$("#new_child_btn").click(function() {
			$("#div_new_child").toggle();
		});
	},

	editCategory: function(evt) {
		if (this.anyChanges ==  true) {
			this.anyChanges = false;
		} else {
			this.anyChanges = true;
		}
		//console.log("[ManageView] Edit category.");
		$("#edit_category_div").toggle();
		$("#save_edit_cat_btn").toggle();
	},

	saveEditCategory: function(evt) {

		//console.log("[ManageView] Save edit category.");
		var cat_id = this.categorySelected;
		
		var fields = {
			name: $("#edit_cat_name").val(),
			menu_label: $("#edit_cat_menu_label").val(),
			description: $("#edit_cat_desc").val(),
			order: $("#edit_cat_order").val()
		};

		var that = this;

		$.post(this.serverURL + "/hope/categories/edit/" + cat_id + "/", {
			csrfmiddlewaretoken: $.cookie('csrftoken'), 'fields': JSON.stringify(fields)
		}, function(data) {
			//console.log("[ManageView] SAVE EDIT.");
			//console.log(data);

			if (data.success == true) {
				$("#edit_category_div").hide();
				$("#save_edit_cat_btn").hide();
				$("#current_cat_text").html(fields.menu_label);

				that.categoryList.fetch().then(function() {
					var categoriesTree = that.buildSingle(that.categoryList.models);
					var template_manage = _.template($("#manage-categories-list").html(), {
						cat: categoriesTree
					});
					$("#categories_list_div").html(template_manage);
					$("#manage_cat_select").select2();
					that.anyChanges = false;
				});
				that.anyChanges = false;
			}
			
		}, "json");
	},

	addNewCategory: function(evt) {
		
		//console.log("[ManageView] add new cat btn click");
		var that = this;
		var name = $("#cat_name").val();
		var menu_label = $("#cat_menu_label").val();
		var desc = $("#cat_desc").val();
		var order = $("#cat_order").val();

		$.post(this.serverURL + "/hope/categories/create/", {parent_id: 0, bullshit:1, user_id: 1, order: order, name: name, description: desc, menu_label: menu_label, csrfmiddlewaretoken:$.cookie('csrftoken')}, function(data) {
			//console.log("- Create new category.");
			// SUCCESS
			if (data.success == true) {
				$("#add_new_category").toggle();
				var template_alert = "<button type='button' class='close' data-dismiss='alert'>×</button><strong>Well done! </strong>"+data.msg;
				$("#category_alert").html(template_alert);
				$("#category_alert").show();
				$("#cat_name").val('');
				$("#cat_menu_label").val('');
				$("#cat_desc").val('');
				$("#manage_cat_select").append("<option id='" + data.id + "' name="+name+" value='" + data.id + "'> " + name + "</option>");
				$("#manage_root_select").append("<option id='" + data.id + "' name="+name+" value='" + data.id + "'> " + name + "</option>");
				// Auto change category when added
				that.categorySelected = data.id;
				$("#manage_cat_select").val(""+data.id).trigger("change");
				this.anyChanges = false;

			}
		}, "json");

	},










	/**
	 *
	 * BULLSHIT METHODS
	 *
	 **/

	onRootSelect: function(evt) {
		// SHOW CHILD DETAILS
		//console.log("[ManageView] Root Selected");

		var cat_id = evt.currentTarget.value;
		//console.log(cat_id);
		//this.categorySelected = cat_id;

		$("#manage_cat_select").val(""+cat_id).trigger("change");
	},	


	createBullshitView: function(cat_fields) {
		if(this.bullshit != null) {
			this.cleanView(this.bullshit);
		}

		this.bullshit = new BullshitView({el:'#objects-bullshit-box', fields:cat_fields,cat:this.categorySelected});

	},


	/**
	 *
	 * END BULLSHIT METHODS
	 *
	 **/




	addNewChild: function(evt) {		
		//console.log("[ManageView] add new child btn");
		var name = $("#child_name").val();
		var menu_label = $("#child_menu_label").val();
		var desc = $("#child_desc").val();
		var parent_id = $("#manage_cat_select").val();
		var order = $("#child_menu_order").val();

		if (parent_id != 0) {
			$.post(this.serverURL + "/hope/categories/create/", {parent_id: parent_id, bullshit:0, user_id: 1, order: order, name: name, description: desc, menu_label: menu_label, csrfmiddlewaretoken:$.cookie('csrftoken')}, function(data) {
				//console.log("- Create new child.");
				// console.log(data);
				// SUCCESS
				if (data.success == true) {
					$("#div_new_child").toggle();
					var template_alert = "<button type='button' class='close' data-dismiss='alert'>×</button><strong>Well done! </strong>"+data.msg;
					$("#category_alert").html(template_alert);
					$("#category_alert").show();
					$("#category_box_childs").append("<li><a id='"+data.id+"' value='"+name+"' class='child_class'>"+name+"</a></li>");
					$("#child_name").val('');
					$("#child_menu_label").val('');
					$("#child_desc").val('');
					$("#manage_cat_select").append("<option id='" + data.id + "' name="+name+" value='" + data.id + "'> " + name + "</option>");
					this.anyChanges = false;
				}
			}, "json");
		}
	},

	deleteCategory: function(evt) {

		var delete_confirm = confirm("This will delete the category and all the tree of childs. This will delete all occurrences also. Proceed to delete?");

		if (delete_confirm == true) {
			var cat_id = this.categorySelected;
			var that = this;
			$.post(this.serverURL + "/hope/categories/remove/"+cat_id+"/", {csrfmiddlewaretoken:$.cookie('csrftoken')}, function(data) {
				//console.log("[ManageView] Remove category.");
				if (data.success == true) {
					that.categoryList.fetch().then(function() {
						var categoriesTree = that.buildSingle(that.categoryList.models);
						var template_manage = _.template($("#manage-categories-list").html(), {
							cat: categoriesTree
						});
						$("#categories_list_div").html(template_manage);
						$("#category_box_childs").html('');
						$("#attrtable_body").html('');
						$("#save_changes_btn").hide();
						$("#cancel_changes_btn").hide();
						$("#manage_cat_select").select2();
						//console.log("- Select category deleted.");
						$("#element_title").html("Category delete!");
						var template_alert = "<button type='button' class='close' data-dismiss='alert'>×</button><strong>Well done! </strong>"+data.msg;
						$("#category_alert").html(template_alert);
						$("#category_alert").show();
					});
				}
			}, "json");
		}
	},

	/**
	 *
	 * Functions used on click events
	 *
	 **/

	newAttribute: function(evt) {
		this.anyChanges = true;
		
		/* TODO */
		/* Add new attr to table */
		//console.log("click new attr btn");
		var template = _.template($("#attrtable-row").html(), {
			value: "name"		
		});

		/* If POST to DJANGO success: */
		this.newAttr += 1;
		$("#newattr_count").show();
		$("#newattr_count").text(this.newAttr + " new");
		$("#attrtable_body").append(template);
		$("#save_changes_btn").show();
		$("#cancel_changes_btn").show();

		$('.editable').editable();

		$('.selecttype').editable({
			value: 2,
			source: [{
				value: 1,
				text: 'integer'
			}, {
				value: 2,
				text: 'string'
			}, {
				value: 3,
				text: 'double'
			}, {
				value: 4,
				text: 'longint'
			}]
		});

		$('.selecttype_a').editable({
			value: 2,
			source: [{
				value: 1,
				text: 'cost'
			}, {
				value: 2,
				text: 'benefit'
			}, {
				value: 3,
				text: 'classification'
			}, {
				value: 4,
				text: 'identification'
			}]
		});

	},

	onCategorySelect: function(evt) {
		console.log("[ManageView] Category changed.");
		

		var that = this;

		if (this.anyChanges == true) {
			var change_confirm = confirm("All unsaved changes will be lost, proceed?");
			
			if (change_confirm == false) {
				return false;
			} else {
				this.anyChanges = false;
				$("#cancel_changes_btn").hide();
				$("#save_changes_btn").hide();
			}
		}

		$("#attr_box").show();
		$("#objects-bullshit-box").show();

		var cat_id = evt.currentTarget.value;
		this.newAttr = 0;
		this.categorySelected = cat_id;
		$("#newattr_count").hide();

		if (cat_id != undefined) {
			$.post(this.serverURL + "/hope/categories/schema/"+cat_id+"/", {csrfmiddlewaretoken:$.cookie('csrftoken')}, function(data) {
				//console.log("[ManageView] Get category fields.");
				//console.log(data);
				var template = _.template($("#attrtable-fields").html(), {
					fields: data.fields
				});

				var details = data.details;
				//console.log(data);
				var parents = data.parents;
				var parents_text = "";
				for (var i = parents.length-1; i >= 0; i--) {
					parents_text += "<a class='child_class' id='"+parents[i].id+"'>"+parents[i].name+"</a> <i class='icon-angle-right'></i> ";
				}
				$("#attrtable_body").html(template);
				var current_cat = "<span id='current_cat_text'>"+$("#manage_cat_select :selected").text()+"</span>";
				$("#element_title").html(parents_text + " " + current_cat);

				$("#edit_cat_name").val(details.name);
				$("#edit_cat_menu_label").val(details.menu_label);
				$("#edit_cat_desc").val(details.description);
				$("#edit_cat_order").val(details.order);





				/**** 	BULLSHIT SHIT ****/



				that.createBullshitView(data.fields);



				/**** 	BULLSHIT SHIT ****/



			});

			
			$.post(this.serverURL + "/hope/categories/childs/"+cat_id+"/", {csrfmiddlewaretoken:$.cookie('csrftoken')}, function(data) {
				//console.log("[ManageView] Get category childs.");
				var template_childs = "";
				var res = $.parseJSON(data)
				for (var i = 0; i < res.length; i++) {
					template_childs += "<li><a id='"+res[i].pk+"' value='"+res[i].fields.menu_label+"' class='child_class'>"+ res[i].fields.order + " -  " + res[i].fields.menu_label+"</a></li>";
				}
				$("#category_box_childs").html(template_childs);
			});

			$("#delete_cat_btn").show();
			$("#edit_cat_btn").show();
			$("#new_attr_btn").show();
			
		}
		

	},

	onChildSelect: function(evt) {
		// SHOW CHILD DETAILS
		//console.log("[ManageView] Child Selected");

		var child_btn = evt.currentTarget;
		var cat_id = $(child_btn).attr("id");
		//console.log(cat_id);
		//this.categorySelected = cat_id;

		$("#manage_cat_select").val(""+cat_id).trigger("change");
	},

	saveChanges: function(evt) {
		
		//console.log("[ManageView] Save Changes");
		//console.log("- CategorySelected = "+this.categorySelected);
		
		newfields = [];
		//console.log("TDs:");
		//console.log($(".newattr td"));
		
		$(".newattr").each(function() { 
			var columns = $(this).find('td');
			var order = $(columns[0]).text();
			var name = $(columns[1].childNodes[2]).text();
			var data_type = $(columns[2]).text();
			var max_value = $(columns[4]).text();
			var min_value = $(columns[3]).text();
			var scale = $(columns[5]).text();
			var a_type = $(columns[6]).text();

			newfields.push({
				name: name,
				data_type: data_type,
				max_value: max_value,
				min_value: min_value,
				scale: scale,
				order: order,
				a_type: a_type,
				nullable: 0,
				visible: 1
			});
		});
		
		if (newfields.length > 0) {
			$.post(this.serverURL + "/hope/categories/field/"+this.categorySelected+"/", {'fields': JSON.stringify(newfields), csrfmiddlewaretoken:$.cookie('csrftoken')}, function(data) {
				//console.log("[ManageView] add new field.");
				if (data.success == true) {
					var ids = data.ids;
					var i = 0;
					$(".newattr").each(function() {
						$(this).attr("class", "status-info");
						$(this).attr("id", ids[i]);

						var span = $(this).find('span')[0];
						$(span).attr('class', 'label label-green');
						$(span).text("");					
						i++;
					});

					$("#cancel_changes_btn").hide();
					$("#save_changes_btn").hide();
					//console.log("- "+data.msg);
					this.newAttr = 0;
					$("#newattr_count").hide();
					this.anyChanges = false;

				} 
			}, "json");
		}

		// DELETE FIELDS
			
		var delete_ids = [];
		
		$(".attrchanged").each(function() {
			if ($(this).attr("class") != 'status-success newattr') {
				var id = $(this).attr("id");
				delete_ids.push(id);
			}
		});

		//console.log(delete_ids);

		if (delete_ids.length > 0) {
			$.post(this.serverURL + "/hope/categories/remove_fields/", {'ids': JSON.stringify(delete_ids), csrfmiddlewaretoken:$.cookie('csrftoken')}, function(data) {
				//console.log("[ManageView] remove fields.");
				if (data.success == true) {
					$(".attrchanged").html('');
					this.toDelete = 0;
					//console.log("- "+data.msg);
					$("#cancel_changes_btn").hide();
					$("#save_changes_btn").hide();
					$("#newattr_count").hide();
					this.anyChanges = false;
				} 
			}, "json");
		}
		

		var fields_edit = [];

		$(".attredit").each(function() {
			var tr = $(this);
			var tds = tr.find("td");

			fields_edit.push({
				id: tr.attr("id"),
				order: $(tds[0]).find("a").html(),
				name: $(tds[1].childNodes[2]).find("a").html(),
				data_type: $(tds[2]).find("a").html(),
				scale:  $(tds[3]).find("a").html(),
				min: $(tds[4]).find("a").html(),
				max: $(tds[5]).find("a").html(),
				a_type: $(tds[6]).find("a").html()
			})
		});

		//console.log(fields_edit);
		if (fields_edit.length > 0) {
			$.post(this.serverURL + "/hope/categories/edit_values/"+this.categorySelected+"/", {
					'fields': JSON.stringify(fields_edit),
					csrfmiddlewaretoken: $.cookie('csrftoken')
				}, function(data) {
					//console.log("[ManageView] remove fields.");
					if (data.success == true) {
						$(".attredit").each(function() {
							$(this).attr("class", "status-info");

							var tds = $(this).find("td");
							$(tds[0]).html($(tds[0]).find("a").html());
							$(tds[1].childNodes[2]).html($(tds[1].childNodes[2]).find("a").html());
							$(tds[2]).html($(tds[2]).find("a").html());
							$(tds[3]).html($(tds[3]).find("a").html());
							$(tds[4]).html($(tds[4]).find("a").html());
							$(tds[5]).html($(tds[5]).find("a").html());
							$(tds[6]).html($(tds[6]).find("a").html());

							var span = $(this).find('span')[0];
							$(span).attr('class', 'label label-green');
							$(span).text("");

						});
						$("#cancel_changes_btn").hide();
						$("#save_changes_btn").hide();
					$("#newattr_count").hide();
					this.anyChanges = false;
				} 
			}, "json");
		}
		//$("#attr_box").hide();
		//$("#objects-bullshit-box").hide();
		this.anyChanges = false;

	},

	cancelChanges: function(evt) {
		/* TODO */
		/* Cancel changes */
		/* Para cancelar: ir fazer o fetch dos atributos outra vez
		   e substituir a tabela de atributos existente */
		this.newAttr = 0;
		this.toDelete = 0;
		$("#newattr_count").hide();
		$("#delattr_count").text(""); 

		$(".newattr").html('');
		$(".attrchanged").each(function() {
			$(this).attr("class","status-info");
			var span = $(this).find('span')[0];
			$(span).attr('class','label label-green');
			$(span).text("");
		});

		$(".attredit").each(function() {
			$(this).attr("class","status-info");
			
			var tds = $(this).find("td");
			$(tds[0]).html($(tds[0]).find("a").html());
			$(tds[1].childNodes[2]).html($(tds[1].childNodes[2]).find("a").html());
			$(tds[2]).html($(tds[2]).find("a").html());
			$(tds[3]).html($(tds[3]).find("a").html());
			$(tds[4]).html($(tds[4]).find("a").html());
			$(tds[5]).html($(tds[5]).find("a").html());
			$(tds[6]).html($(tds[6]).find("a").html());

			var span = $(this).find('span')[0];
			$(span).attr('class','label label-green');
			$(span).text("");

		});
		
		$("#save_changes_btn").hide();
		$("#cancel_changes_btn").hide();
	},

	deleteAttr: function(evt) {
		this.anyChanges = true;
		
		//console.log("[ManageView] click deleteattr");
		var btn = evt.currentTarget;
		var tr = $(btn).closest('tr');
		var span = $(tr).find('span');

		if (tr.attr('class') != "status-success newattr" && tr.attr('class') != "status-info attredit") {
			tr.attr('class',"status-error attrchanged");
			//console.log("- change attr class");
		} else if (tr.attr('class') == "status-info attredit") {
			var tds = tr.find("td");
			$(tds[0]).html($(tds[0]).find("a").html());
			$(tds[1].childNodes[2]).html($(tds[1].childNodes[2]).find("a").html());
			$(tds[2]).html($(tds[2]).find("a").html());
			$(tds[3]).html($(tds[3]).find("a").html());
			$(tds[4]).html($(tds[4]).find("a").html());
			$(tds[5]).html($(tds[5]).find("a").html());
			$(tds[6]).html($(tds[6]).find("a").html());
			tr.attr('class',"status-error attrchanged");
		}
		
		span.attr('class','label label-red');
		span.text("delete");
		
		$("#save_changes_btn").show();
		$("#cancel_changes_btn").show();
	},

	editAttr: function(evt) {
		this.anyChanges = true;
		//console.log("[ManageView] click edit attr");

		var btn = evt.currentTarget;
		var tr = $(btn).closest('tr');
		var span = $(tr).find('span');

		if (tr.attr('class') != "status-success newattr" && tr.attr('class') != "status-info attredit" && tr.attr('class') != "status-error attrchanged") {
			tr.attr('class',"status-info attredit");
			//console.log("- change attr class to attredit");
			var tds = tr.find("td");
			var content = $(tds[0]).html();
			$(tds[0]).html("<a href='#' class='editable'>"+content+"</a>");
			$(tds[1].childNodes[2]).html("<a href='#' class='editable'>"+$(tds[1].childNodes[2]).text()+"</a>")
			$(tds[2]).html("<a href='#' class='selecttype' data-type='select' data-pk='1' data-original-title='select type'></a>");
			$(tds[3]).html("<a href='#' class='editable'>"+$(tds[3]).html()+"</a>");
			$(tds[4]).html("<a href='#' class='editable'>"+$(tds[4]).html()+"</a>");
			$(tds[5]).html("<a href='#' class='editable'>" + $(tds[5]).html() + "</a>");
			$(tds[6]).html("<a href='#' class='selecttype_a' data-type='select' data-pk='1' data-original-title='select type'></a>");
			$(".editable").editable();
			$('.selecttype').editable({
				value: 2,
				source: [{
					value: 1,
					text: 'integer'
				}, {
					value: 2,
					text: 'string'
				}, {
					value: 3,
					text: 'double'
				}, {
					value: 4,
					text: 'longint'
				}]
			});

			$('.selecttype_a').editable({
				value: 2,
				source: [{
					value: 1,
					text: 'cost'
				}, {
					value: 2,
					text: 'benefit'
				}, {
					value: 3,
					text: 'classification'
				}, {
					value: 4,
					text: 'identification'
				}]
			});

			span.attr('class','label label-gray');
			span.text("edit");

			$("#save_changes_btn").show();
			$("#cancel_changes_btn").show();
		}
		
				
		

	},

	/**
	 *
	 * single elements model
	 *
	 **/
	buildSingle: function(data) {
		//console.log(data);
		var initialData = data;
		var tree = [];

		var i = 0;
		for (var i = 0; i < initialData.length; i++) {
			obj = {
				attr: {
					"id": initialData[i].attributes.pk
				},
				data: initialData[i].attributes.fields.menu_label,
				parent_id : initialData[i].attributes.fields.parent_id
			}
			tree.push(obj);
		}
		return tree;
	},

	/* --- HELPERS --- */
	hide: function() {
		$("#manage-page").hide();
	},
	
	show: function() {
		$("#manage-page").show();
	},

	initHook: function() {
		//console.log('[ManageView] Initting');
		var that = this;

		if(!this.isLoaded) {
			this.load();
		}

	},

	exitHook: function() {
		//this.options.app.log('[ManageView] Exiting');
	},

	unload: function() {
		this.loaded = false;
	},
	
	isLoaded: function() {
		return this.loaded;
	},
	/* -- -- */

});





/**
 *
 * BULLSHIT VIEW
 *
 **/

 var BullshitView = Backbone.View.extend({

 	events: {
		'click .save-bullshit': 'saveBullShit',
		'click .reset-bullshit': 'clearBullShit',
	},

 	initialize: function(options) {
 		this.el = options.el;
 		this.fields = options.fields;
 		this.category = options.cat;

 		//console.log(this.el);
 		//console.log(this.fields);
 		this.renderForm();
 		this.renderObjectsList();
 		this.serverURL = window.location.origin;
 	},

 	renderForm: function() {
 		var form = $('#bullshit-form');
 		form.html('');

 		form.append('<li class="input"> Nome do objecto <input type="text" class="bullshit-title" placeholder="Insira o nome do objecto"></li>');

 		for(var p in this.fields) {
 			form.append('<li class="input"> ' + this.fields[p].name + ' (' + this.fields[p].data_type + ')  <input type="text" class="bullshit-input" data-attrid="' + this.fields[p].id + '" name="' + this.fields[p].name + '" placeholder="' + this.fields[p].name + '"></li>');
 		}

 		form.append('<div class="form-actions" style="display:none"> <button type="submit" class="btn btn-blue save-bullshit">Save changes</button> <button type="button" class="btn btn-default reset-bullshit">Reset</button></div>');

 		if(this.fields.length > 0 ) {
 			$('.form-actions').show();
 		} 

 		this.delegateEvents();
 	},

 	saveBullShit: function(evt) {
 		var that = this;
 		var obj_schema = [];

 		var $schema_values = $('.bullshit-input');
 		var title = $('.bullshit-title').val();


 		_.each($schema_values, function(el) {
			obj = {'name':el.name,'attribute_id':$(el).data('attrid'),'value':$(el).val()};
			obj_schema.push(obj);
		});

		//console.log(obj_schema);

		$.post(this.serverURL + "/hope/bullshit/create/", {
			csrfmiddlewaretoken: $.cookie('csrftoken'), 'schema_values': JSON.stringify(obj_schema), 'category_id':this.category,'title':title
		}, function(data) {
			//console.log("[ManageView] SAVE EDIT.");
			//console.log(data);

			if (data.success == true) {
				//console.log('CRIADO NOVO OBJECTO');
				that.renderObjectsList();

			} else {
				//console.log('ERRO');
			}
			
		}, "json");

		this.clearBullShit();

 		evt.preventDefault();
 		return false;
 	},

 	clearBullShit: function(evt) {
 		$('.bullshit-title').attr('value','');
 		$('.bullshit-input').attr('value','');

        evt.preventDefault();
        return false;
 	},

 	renderObjectsList: function() {
 		var $el = $('#bullshit_objects');
 		$el.html('');

 		$.get('/hope/bullshit/' + this.category, function(data) {
 			if(data.success != false) {
 				_.each(data, function(o) {
 					$el.append('<p style="font-weight:bold"> ' + o.title + ' </p>');
 					for(var s in o.schema_values) {
 						$el.append('<p style="margin-left:20px;"> ' + o.schema_values[s].name + ': ' + o.schema_values[s].value + ' </p>');
 					}
 					$el.append('<hr></hr>');
 				});
 			}
 		});

 	}



 });











