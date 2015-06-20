Moth.ui.Window = function(options){
	_.bindAll(this, 'beforeCloseCallback', 'onClose', "render_window", "getWindowCoordinates", "close");
	
	this._configure(options || {});
	
	if (options.container)     this.container      = options.container;
	if (options.title) this.title = options.title;
	this._ensureElement();
	
	if (this.container)
		$(this.container).append($(this.el))
    
	//this.delegateEvents()
	
	this._contentContainer = this.make("div", {"class": "outter_container"}, this.el)
	this._drawerDOM = this.make("div", {"class": "drawer"})
	
	this._wrapper = this.make("div", {"class": "window_wrapper"})
	$(this._wrapper).html(this._contentContainer)
	$(this._wrapper).append(this._drawerDOM)
	
	this._guid = guidGenerator()
	Moth._ActiveWindows[this._guid] = this;
	
	this.initialize(options)

	this.render_window()
	
	this.trigger('initComplete')
	
}


_.extend(Moth.ui.Window.prototype, Backbone.View.prototype, {
	
	getWindowCoordinates: function(){
		sCoord = [0,27]
		do {
			var found = false
			for (var keys in Moth._ActiveWindows) {
				if (Moth._ActiveWindows[keys]){
					
					var w = $(Moth._ActiveWindows[keys]._dialog).dialog("option", "position")
					if (w.length == 2 && (Math.abs(sCoord[0]-w[0])<30 && Math.abs(sCoord[1]-w[1])<30)) {
						found = true
					}
				}
			}
			if (found){
				sCoord[0] += 30
				sCoord[1] += 30
			} else {
				break;
			}
			
		} while(true)
		
		return sCoord
	},
	
	close: function(){
		$(this._dialog).dialog('close')
	},
	
	/*
	*	Callback called before closing the window
	*/
	beforeCloseCallback: function(){ 
		if (this.onClose()){
			Moth._ActiveWindows[this._guid] = null
			return true
		} else {
			return false
		}
	},
	
	onClose: function(){ return true },
	
	render_window: function(){
		
		var that = this
		this._dialog = $(this._wrapper).dialog({ 	position: this.getWindowCoordinates(),
											width: 300,
											height: 187,
											closeOnEscape: false,
											title: this.title,
											dragStart: function(event, ui){
												$(event.target.childNodes[0]).hide();
												$(event.target).parent().css('opacity', 0.5);
											},
											dragStop: function(event, ui){
												$(event.target.childNodes[0]).show();
												$(event.target).parent().css('opacity', 1);
											},
											beforeClose: this.beforeCloseCallback,
											resize: function(event, ui) { 
												if (that._drawer) that._drawer.resizeAll()
											}
										});
		this._dialog.view = this
		$(this._wrapper).parent().addClass('pane');
		
		if (this.options.drawer) {
			this._drawer = $(this._wrapper).layout({
					initClosed: true,
					applyDefaultStyles: true,
					center__paneSelector: 	".outter_container",
					east__paneSelector: 	".drawer",
			});
		}
			
		if (!this.options.closable)
			$(this._wrapper).parent().addClass('no-close');
	}
})

Moth.ui.Window.extend = extend;