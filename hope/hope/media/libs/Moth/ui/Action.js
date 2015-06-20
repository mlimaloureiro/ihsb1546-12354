Moth.ui.Grid.action = {}

Moth.ui.Grid.action.Generic = function(){
}

_.extend(Moth.ui.Grid.action.Generic.prototype, Backbone.Events, {
	initialize: function(tgrid){},
	doAction: function(X, Y, nval, grid){}
})

// Set up inheritance for the model, collection, and view.
Moth.ui.Grid.action.Generic.extend = extend;