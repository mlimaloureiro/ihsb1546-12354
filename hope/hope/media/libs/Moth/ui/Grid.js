Moth.ui.Grid = Backbone.View.extend({
	
	
	initialize: function(options){
		_.bindAll(this, "registerValidator", "registerAction", 
			"setActiveRows", "getActiveRows", "setRowByCode", "getRowByCode", 
			"setRowStructure", "buildSelect", "buildColumns", "removeColumns", 
			"changeCheckBox", "changeCheckBox", "getData", "onTableInputChange", 
			"changeColumns", "changeDataRow", "outputMatrix", "solveMatrix", "render");
		

		this._activeColumns = []
		this.column_data = []
		this._activeRows = []

		this.columns = [
			['1', 'id', 'user', 'cenas', 'user', 'default', '1', '']
		];
		
		this.options = {
						showColumnNames: true,
						addRows: true,
						deleteRows: false,
						idColumnsEditable: false,
						rowCheckbox: true,
						columnCheckbox: false,
						useRowStructure: false,
						hideInactiveColumns: false,
						hideInactiveRows: false,
						rowsAsColumn: false,
					}
					
		this.options = _.extend({}, this.options, options );
		
		if (options.showColumnNames) this.options.showColumnNames = true
		if (options.addRows) this.options.addRows = false
		//if (options.idColumnsEditable) this.options.idColumnsEditable = false
		
		this.Data = [];
		this.column_data = [];
		this.column_structure = [
			{
				readable: 'Att. Name',
				name: 'attr_name',
				'type': 'text',
				'data': '',
				'class': 'column_header'
			}
		];
		
		this.base_row = {
			'readable': 'Row Name',
			'type': 'text'
		}
		
		this.row_structure = []
		this.code2Row = {}
		
		this._activeRows = []
		this._validators = []
		this._actions = []
		
		
		this.matrix = options.matrix
		this.columns = this.matrix.columns.slice()
		
		if (options.useRowStructure) {
			this.setRowStructure(options.row_structure)
			
			for(var i=0;i<options.row_structure.length;i++){
				this.code2Row[options.row_structure[i]['code']] = i
				this.Data[i] = []
				
				if ("init" in options.row_structure[i])
					this.Data[i] = options.row_structure[i]['init'].slice()
				else if ("default" in options.row_structure[i]){
					this.Data[i] = [options.row_structure[i]['default']]
				}
			}
			
		} else {
			this.rowNames = []
			if (this.matrix.rowNames)
				this.rowNames = this.matrix.rowNames
		}
		
		if (this.matrix.data)
			this.Data = this.matrix.data
			
		if (this.Data == undefined)
			this.Data = []
		if (this.rowNames == undefined )
			this.rowNames = []
		
		
		this._dirty = false
		
		this._guid = guidGenerator()
		
		//this.render();
		
	},

	registerValidator: function(validator){
		this._validators.push(validator)
	},

	registerAction: function(action){
		action.initialize(this)
		this._actions.push(action)
	},
	
	setRowByCode: function(code, row){
		if (row === undefined) return false;
		var retData = []
		for(var i in this.row_structure){
			if ("code" in this.row_structure[i] && this.row_structure[i].code == code){
				this.Data[i] = row.slice()
				break;
			}
		}
	},
	
	getRowByCode: function(code){
		
		var retData = []
		for(var i in this.row_structure){
			if ("code" in this.row_structure[i] && this.row_structure[i].code == code && this.Data[i] != undefined){
				retData = this.Data[i].slice()
				break;
			}
		}

		
		return retData.slice()
	},
	
	
	setActiveRows: function(ac){
		if (!this.options.useRowStructure) {
			return;
		}
		
		for(var i in ac){
			if (i in this.code2Row){
				this._activeRows[this.code2Row[i]] = ac[i];
			}
		}
	},
	
	getActiveRows: function(){
		var res = {}
		for(var i=0;i<this._activeRows.length;i++){
			if (this.row_structure[i] !== undefined)
				res[this.row_structure[i]['code']] = this._activeRows[i]
		}
		return res;
	},
	
	setRowStructure: function(nstruct)
	{
		this.row_structure = []
		for (var i in nstruct){
			this.row_structure.push(_.extend({}, this.base_row, nstruct[i] ))
		}
	},
	
	buildSelect: function(name, options, select){
		var dom = $('<select />');
		dom.attr('name', name);
		
		_.each(options, function(x){
			attr = x
			dom.append('<option value="'+attr.id+'" '+(select===undefined?'-':(select==attr.id)?'selected':select)+'>'+attr.value+'</option>');
		})
		
		return dom;
	},
	
	buildColumns: function(){
		var columnDOM = $('<table cellpadding="0" cellspacing="0" id="'+this._guid+'"/>');
		var tmp;
		
		var i, j;
		
		if (this.options.showColumnNames){
			var lineDOM
			var headDOM = $("<thead />")
			/* Create columns info data*/
			//for (i = 0; i < this.column_structure.length; i++){
			//	tmp = this.column_structure[i];
			
			// -----------------------------------------------------
			// add Column Checkbox
			if (this.options.columnCheckbox){
				lineDOM = $('<tr class="column_checkbox_row" />');

				lineDOM.append($('<td />'))
				
				
				for (j = 0; j < this.columns.length; j++) {
					var checked = true
					if (this.columns[j][6] && this.columns[j][6]=='0'){
						checked = false
						this.columns[j][6] = '0'
					} else {
						this.columns[j][6] = '1'
					}
					
					lineRow = $('<td />')
					lineRow.append('<input type="checkbox" name="matrix_column_'+j+'" class="matrix_select_column_checkbox" rel="'+j+'" '+(checked?'checked':'')+'/>')
					
					lineDOM.append(lineRow)
				}
				headDOM.append(lineDOM)
			}
			
				
			lineDOM = $('<tr class="matrix_definition_row" />');
			lineDOM.append($('<td class="matrix_column_header" />').html(""));
			//lineDOM.append($('<td colspan="2" class="matrix_column_header" />').html(tmp.readable));
			for (j = 0; j < this.columns.length; j++) {
					
					columnVisible = true
					if (this.options.hideInactiveColumns) {
						if (this._activeColumns == undefined)
							this._activeColumns = []
						if (this._activeColumns[j] == undefined)
							this._activeColumns[j] = true
						else
							columnVisible = this._activeColumns[j]
					}

					var dom = "";
					var elmName = 'def_'+j+'_'+i;
					dom = "<p>"+(this.columns[j]!==undefined?this.columns[j][7]:'')+"</p>"
					
					var elmClasses = "matrix_column ";
					elmClasses += "column_header" //((tmp['class'])!==undefined)?(tmp['class']):"";
					
					if (!columnVisible)
						elmClasses += " hideColumn"

					lineDOM.append($('<th class="'+elmClasses+'" />').html(dom));
					headDOM.append(lineDOM)
			}
			//}
		columnDOM.append(headDOM);
		}
		// Fill Data
		var bodyDOM = $("<tbody />")
		
		
		if (this.Data == undefined){
			this.Data = []
		}
			
		if (this.rowNames == undefined ){
			this.rowNames = []
		}
			
		
		var matLen = Math.max(this.rowNames.length, this.Data.length)
		
		for (var i=0; i< matLen; i++){
			var checked = true
			if (this._activeRows == undefined)
				this._activeRows = []
			if (this._activeRows[i] == undefined)
				this._activeRows[i] = true
			else
				checked = this._activeRows[i]
				
			var rowClasses = "matrix_data_row"
			if (this.options.hideInactiveRows && !checked){
				rowClasses += " hideRow"
			}

			lineDOM = $('<tr class="'+rowClasses+'"/>');
			
			firstColumn = $('<td/>')
			
			if (this.options.deleteRows){
				firstColumn.append('<a href="#" class="rm_matrix_data_row minus_bt_row" rel="'+i+'">remove new Row</a>&nbsp;')
			}
				
			//firstColumn.append('<a href="#" class="add_matrix_data_row plus_bt_row" rel="'+i+'">[aR]</a>')
			//firstColumn.append('<a href="#" class="rm_matrix_data_row minus_bt_row" rel="'+i+'">[rR]</a>')
			showCheckBox = false
			
			if (this.options.useRowStructure && "rowCheckbox" in this.row_structure[i]){
				if (this.row_structure[i].rowCheckbox){
					showCheckBox = true
				} else {
					showCheckBox = false
				}
			} else {
				if (this.options.rowCheckbox){
					showCheckBox = true
				}
			}
			
			var className = "matrix_select_checkbox "
			if (this.options.useRowStructure){
				
				// set row classes
				if ("classes" in this.row_structure[i])
					lineDOM.attr('class', lineDOM.attr('class')+" "+this.row_structure[i].classes)
						
				if ("type" in this.row_structure[i] && this.row_structure[i].type=="string")
					className += "invisible"
			}
				
			if (showCheckBox)
				firstColumn.append('<input type="checkbox" name="matrix_row_'+i+'" class="'+className+'" rel="'+i+'" '+(checked?'checked':'')+'/>')
			
			if (this.options.useRowStructure){
				firstColumn.append("<span>"+this.row_structure[i].readable+"</span>")
			} else if (this.options.rowsAsColumn){
				firstColumn.append("<span>"+(this.columns[i]!==undefined?this.columns[i][7]:'')+"</span>")
			} else if (this.rowNames[i]){
				firstColumn.append("<span>"+this.rowNames[i]+"</span>")
			} 


			
			lineDOM.append(firstColumn)
			
			columnsLen = this.columns.length // default column size
			var specialRow = false
			if (this.options.useRowStructure && "size" in this.row_structure[i]){ // this row collumn size is different than usual
				columnsLen = this.row_structure[i].size
				specialRow = true
			}
				
			for (var j = 0; j < columnsLen; j++) {

				// --- hide inactive columns
				var columnVisible = true
				if (this.options.hideInactiveColumns) {
					columnVisible = this._activeColumns[j]
				}
				
				var columnClasses = "matrix_data_cell"
				if (!columnVisible)
					columnClasses += " hideColumn"
				data_tr = $('<td class="'+columnClasses+'" />')
				
				if (this.options.useRowStructure){ // handle row structure
						
					if (this.row_structure[i].type == "select"){
						data_cell = $('<select name="data_'+i+'_'+j+'" />')
						
						tmpOptions = this.row_structure[i].options
						for (var k in tmpOptions){
							data_cell.append('<option value="'+tmpOptions[k][0]+'">'+tmpOptions[k][1]+'</option>"')
						}
					
					} else {
						if (this.row_structure[i].type == "string"){
							data_cell = $('<p/>')
						}	else { // text
							data_cell = $('<input type="text" name="data_'+i+'_'+j+'" />')
						}
					}
					
				}else{	// without row structure
					data_cell = $('<input type="text" name="data_'+i+'_'+j+'" />')
				}
				
				// set previous saved data
				var dados = (this.Data[i]!==undefined?(this.Data[i][j]!==undefined?this.Data[i][j]:''):'')
				
				if (this.row_structure[i] != undefined && "type" in this.row_structure[i] && this.row_structure[i].type == "string"){
					data_cell.append(dados)
				} else {
					data_cell.val(dados)
				}
				
				
				// if this row hasn't all columns
				if (!specialRow){
					if (this.columns[j][0] == '0' || !checked || this.columns[j][1] == 'id')
						data_cell.attr('disabled', true)
					else
						data_cell.attr('disabled', false)
				
					if (this.columns[j][0]=='0') {
						data_cell.addClass('inactive')
					
						if (this.options.idColumnsEditable){
							data_cell.addClass('editable')
						}
					}
				} else {
					data_cell.addClass('editable')
				}

				
				
				
				data_tr.append(data_cell)
				lineDOM.append(data_tr)
			}
			bodyDOM.append(lineDOM)
		}
		
		if (this.options.addRows)
			bodyDOM.append('<tr class="metarow"><td colspan="'+(this.columns.length+1)+'"><a href="#" class="add_matrix_data_row plus_bt last_row">add new Row</a></td></tr>');
		
		columnDOM.append(bodyDOM);
		
		// unbind events before updating table html
		$('#add_matrix_property', this.el).unbind();
		$('.add_matrix_column', this.el).unbind();
		$('.add_matrix_data_row', this.el).unbind();
		
		$('tr.matrix_definition_row input', this.el).unbind();
		$('td.matrix_data_cell input', this.el).unbind();
		
		$(this.el).html(columnDOM)
		//var table = $('#matrix_grid').html(columnDOM);
		//table.addClass('matrix_table');
		
		// bind new events
		var that = this
		$('tr.matrix_definition_row input', this.el).bind('change', this.onTableInputChange);
		$('tr.matrix_definition_row select', this.el).bind('change', this.onTableInputChange);
		$('tr.matrix_definition_row select', this.el).bind('focusout', this.onTableInputChange);
		$('td.matrix_data_cell input', this.el).bind('focusout', this.onTableInputChange);
		$('td.matrix_data_cell select', this.el).bind('change', this.onTableInputChange);
		   
		$('.add_matrix_column', this.el).bind('click', this.changeColumns);
		$('.rm_matrix_column', this.el).bind('click', this.changeColumns);
		   
		$('.add_matrix_data_row', this.el).bind('click', this.changeDataRow);
		$('.rm_matrix_data_row', this.el).bind('click', this.changeDataRow);
		   
		$('.matrix_select_checkbox', this.el).bind('click', this.changeCheckBox)
		
		$('.matrix_select_column_checkbox', this.el).bind('click', this.changeColumnCheckBox)
		
		$('th.hideColumn', this.el).hide();
		$('td.hideColumn', this.el).hide();
		$('tr.hideRow', this.el).hide();
		
		if (!this.options.columnCheckbox){
			$('.inactive', this.el).attr('disabled', true)
			$('.editable', this.el).attr('disabled', false)
		}

		for(var k=0;k<this._actions.length;k++){
			this._actions[k].buildTrigger(this.el)
		}

		$($(".equalize td", this.el)[0]).append($('<button id="equal" style="float:right;">=</button>'));


		$("#equal", this.el).click(function(evt){
			var total = 0;

			console.log(that.columns);

			for(i in that.columns){
				if (that.columns[i][0] == '0' || that.columns[i][1] == 'id'){
					continue;
				}else{
					total++;
				}					
			}

			console.log(total);

			$(".equalize td.matrix_data_cell input", that.el).each(function(index){
				if (!(that.columns[index][0] == '0') && !(that.columns[index][1] == 'id')){
					$(this).attr("value", ""+(1.0/total));
					that.onTableInputChange({target: this});
				}
					
			});

			
		});


		this.initialized = true;
	},
	
	changeCheckBox: function(evt){
		telm = $(evt.target)
		
		this._activeRows[telm.attr('rel')] = telm.attr('checked')!=undefined?true:false
		
		this.buildColumns()
		
		this._dirty = true
	},
	
	changeColumnCheckBox: function(evt){
		telm = $(evt.target)
		this.columns[telm.attr('rel')][6] = telm.attr('checked')?'1':'0'
		
		console.log("changed column")
		this.buildColumns()

		
		this._dirty = true
	},
	
	getData: function(force){
		if (force)
			return this.Data.slice()

		var resMatrix = []
		for (var i in this._activeRows){
			checked = this._activeRows[i]
			if (checked){
				resMatrix.push(this.Data[i])
			}
		}
		return resMatrix
	},
	
	onTableInputChange: function(evt){
		var elms = evt.target.name.split('_');
		if (elms.length != 3) return;
		
		var i = elms[1];
		var j = elms[2];
		
		var prevData = this.Data[i][j]

		switch(elms[0]){
			case 'def': // if change was in column definition
				if (this.columns[i] === undefined)
					this.columns[i] = [];
					
				this.columns[i][j] = $(evt.target).val();
			break;
			
			case 'data': // if change was in matrix Data
				if (this.Data[i] === undefined)
					this.Data[i] = [];
					
				//this.Data[i][j] = $(evt.target).val();
				console.log("new Data ="+this.Data[i][j])
				
				var validated = true
				for(var k=0;k<this._validators.length;k++){
					var vflag = this._validators[k].validate(j,i, $(evt.target).val(), this )
					validated = validated && vflag
					
					if (!vflag)
						console.log("["+this._validators[k]._name+"]]Failed to validate data!")
				}

				if (validated)
					this.Data[i][j] = $(evt.target).val();
				//else
					
				

			break;
			
			case 'prop': // if change was in matrix properties
				if (this.property_data[i] === undefined)
					this.property_data[i] = [];
			
				this.property_data[i][j] = $(evt.target).val();
			break;
		}
	},
	
	removeColumns: function(idx){

		if (idx === undefined)
			return;

		this.columns.splice(idx, 1);
		for(var i=0; i<this.Data.length; i++){
			if (this.options.useRowStructure && this.row_structure[i] != undefined && "size" in this.row_structure[i])
				continue;

			if (this.Data[i] == undefined){
				continue;
			}
			
			if (this.Data[i].length > idx)
				this.Data[i].splice(idx, 1);
		}
	},
	
	
	changeColumns: function(evt){
		var doRemove = $(evt.target).hasClass('rm_matrix_column');
		
		var idx = evt.target.rel;
		if (idx != '' && idx>=0 && idx<this.columns.length){
			// if wanna remove a column
			if (doRemove){
				removeColumns(idx)
			// if wanna add a column
			} else {
				this.columns.splice(idx, 0, ['id', 'user', 'cenas', 'user', 'default', '']);	
				for(row in this.Data){
					this.Data[row].splice(idx, 0, []);
				}
				for(row in this.property_data){
					this.property_data[row].splice(idx+2, 0, '');
				}
			}
			
		} else if (!doRemove){	// if pressed last add column
			this.columns.push(['id', 'user', 'cenas', 'user', 'default', '']);
		}
		
		this.buildColumns();
	},
	
	changeDataRow: function(evt){
		console.log("Changed Data ROW!");
		var doRemove = $(evt.target).hasClass('rm_matrix_data_row');
		
		var idx = evt.target.rel;
		
		if (idx != '' && idx>=0 && idx<this.Data.length){
			if (doRemove){
				this.Data.splice(idx, 1);
				this._activeRows.splice(idx, 1);
			} else {
				this.Data.splice(idx, 0, []);
				this._activeRows.splice(idx, 0, true)
			}
		} else if (!doRemove){
			this.Data.push([]);
		}
		
		this._dirty = true
		this.buildColumns();
	},
	
	outputMatrix: function(evt){
		var saveAsNew = $(evt.target).hasClass('saveAsNew');
		
		var name_elm= $('#matrix_name');
		var matrixModel = new Matrix({columns: this.columns, data: this.Data});
		
		if (name_elm.val() != '' && !saveAsNew){
			//alert("not empty")
			matrixModel.set({_id: {"$oid": name_elm.val()}}, {silent:true});
		} else {
			//alert("empty");
		}
		
		
		matrixModel.save(null, {
			success: function(model){
				new Notice({message: "Matrix guardada com sucesso."});
				$('#matrix_name').val(model.get('_id')['$oid']);
				app.matrix_id = model.get('_id')['$oid'];
				$('#update_matrix').show();
				$('#solve_matrix').attr('disabled', false);
			},
			error: function(){
				new Error({message: "Occorreu um erro a salvar a matriz. Tente Novamente."});
			}
		})
		
	},
	
	solveMatrix: function(evt){
		
		var name_elm= $('#matrix_name');
		var matrix_id= name_elm.val();
		
		$.ajax({
			url: '/1/matrix/'+matrix_id+'/solve/',
			type: 'POST',
			success: function(){
				new Notice({message: "Matriz enviada para o servidor de algoritmos"});
			},
			error: function(){
				new Error({message: "Algo correu mal!"});
			}
		});
		
		evt.preventDefault();
	},
	
	render: function(){
		var grid;
 
 
		var options = {
			enableCellNavigation: true,
			enableColumnReorder: false
		};
 
		
		this.buildColumns()



		/*$('#save_matrix').click(this.outputMatrix);
		$('#update_matrix').click(this.outputMatrix);
		$('#solve_matrix').click(this.solveMatrix);
		
		
		$('#update_matrix').hide();*/
	}
	
});

Moth.ui.Grid.validator = {}
