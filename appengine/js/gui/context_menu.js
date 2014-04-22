////////////////////////////////////////////////////////////////////////////////
// Context menu handler for selecting nodes and creating context menus

function ContextHandler(R, Proof) {
	this.paper = R;
	this.proof = Proof;
	this.selectedUINodes = new List();
	this.prev_x = undefined;
	this.prev_y = undefined;
	this.context = undefined;
	this.multiactive = false;
	this.ShowMultiStatus();

	// ctrl controls multi-select
	Mousetrap.bind('ctrl', this.ToggleMultiActive(), 'keydown');

	// disable on loss of focus
	// $(document).mousedown(
	// 	(function(ch) {
	// 		return function() {ch.CloseContext();};
	// 	})(this)
	// );
}

ContextHandler.prototype.NewContext = function(uinode,x,y) {
	var uinodes = new List();
	uinodes.push_back(uinode);
	this.NewContextMulti(uinodes,x,y);
};

ContextHandler.prototype.NewContextMulti = function(uinodes,x,y) {
	this.CloseContext();
	if(uinodes.length > 0) {
		// pull nodes from uinodes
		var nodes = new List();
		uinodes.iterate(function(uinode) {
			nodes.push_back(uinode.node);
		});
		this.context = new Context(this.paper,this.proof,nodes,x,y);
	}
};

ContextHandler.prototype.CloseContext = function() {
	if(this.context) {
		this.context.close();
		delete this.context;
	}
};

ContextHandler.prototype.ToggleMultiActive = function () {
	var self = this;
	return function () {
		if(!self.multiactive) {
			self.multiactive = true;
		} else {
			self.multiactive = false;
			// turning off multi-select starts a multiselected context
			self.ActivateMultiContext();
		}
		self.ShowMultiStatus();
	};
};

ContextHandler.prototype.ShowMultiStatus = function() {
	if(this.multiactive) {
		document.getElementById('MultiSelectStatus').innerHTML = '<button id="MultiSelectStatusButton" class="btn navbar-btn btn-info">Multi-Select On</button>';
	} else {
		document.getElementById('MultiSelectStatus').innerHTML = '<button id="MultiSelectStatusButton" class="btn navbar-btn btn-default">Multi-Select Off</button>';
	}	
	var self = this;
	document.getElementById('MultiSelectStatusButton').onclick = this.ToggleMultiActive();
};

ContextHandler.prototype.ActivateMultiContext = function() {
	this.selectedUINodes.iterate( function (uinode) {
		uinode.setSelected(false);
	});
	
	// create context
	if(this.selectedUINodes.length)
		this.NewContextMulti(this.selectedUINodes,this.prev_x,this.prev_y);
	this.selectedUINodes = new List();
};

// single clicks in multi selects
ContextHandler.prototype.SingleClickHandler = function(uinode,x,y,event) {
	if (this.multiactive) {
		this.prev_x = x;
		this.prev_y = y;
		this.toggleSelection(uinode);
	} else {
		if(event.which == 3 || event.type == "dblclick") { // right click and double click
			this.NewContext(uinode,x,y);
		}
	}
};


ContextHandler.prototype.toggleSelection = function(uinode) {
	// Can't select the top level
	if(!uinode.node.parent) return;
	// toggle visual on or off
	if(this.selectedUINodes.contains(uinode)) {
		uinode.setSelected(false);
	}
	else {
		uinode.setSelected(true);
	}

	// remove or add uinode
	var listItr = this.selectedUINodes.contains(uinode);
	if(!listItr)
		this.selectedUINodes.push_back(uinode);
	else 
		this.selectedUINodes.erase(listItr);
};

////////////////////////////////////////////////////////////////////////////////
// Context menu for a selected set of nodes

function Context(R,Proof,nodes,x,y) {
	this.paper = R;
	this.proof = Proof;
	this.nodes = nodes || null;
	this.x = x; this.y = y;

	this.menu_items = this.paper.set();
	this.items = {};
	this.num_items = 0;

	this.rules = this.proof.currentInferenceRules();

	this.setup();
	this.show();
}

Context.prototype.addItem = function(name,func) {
	this.items[name] = func;
	this.num_items++;
};

Context.prototype.setup = function() {
	var valid_rules = ValidateInferenceRules(this.rules,this.nodes);
	for(var k in valid_rules) {
		this.addItem(k,valid_rules[k]);
	}
};

// render context menu
Context.prototype.show = function() {
	var n = this.num_items; //shorthand variable
	if (n===0) return; //return for no items
	//get longest menu item name length
	var max_length = 0;
	for(var x in this.items) {
		max_length = Math.max(max_length,x.length);
	}

	//set default menu properties
	var font_size = 11;
	//var text_prop = {font: ""+font_size+"px Helvetica, Arial", fill: "#fff"}
	var partition = font_size+14; //height of item box
	var width = (font_size-3)*max_length; //width of item box
	var tol = 5, offset = 3; //tolerance of window bounds; offset from mouse

	//set correct initial x and y values
	//fit overflow from width
	var ox;
	if(this.x+offset+width+tol > this.paper._viewBox[0] + this.paper._viewBox[2])
		ox = this.x-(width+tol)+offset; // offset to the right if past right edge
	else
		ox = this.x+offset;
	//fit overflow from height
	var oy;
	if(this.y+offset+partition*n+tol > this.paper._viewBox[1] + this.paper._viewBox[3] - this.paper.canvas.offsetTop)
		oy = this.y-(partition*n+tol)+offset; // offset up if past the bottom edge
	else
		oy = this.y+offset;

	var c=0; //item counter
	for(x in this.items) {
		var menu_item = this.paper.set(); //menu button set
		var y = oy+partition*c; //start y at correct distance
		//construct menu box
		menu_item.push(
			this.paper.rect(ox, y, width, partition)
			.attr({stroke:"#000",fill: "#aabbcc", "stroke-width": 1, "text":"asdf"})
		);
		//construct menu text
		menu_item.push(
			this.paper.text((ox+ox+width)/2,
							(y+y+partition)/2,
							x)
			.attr({"font-size":font_size})
		);
		
		var self = this;
		//set up menu button click function
		menu_item.click(
			//closure that creates function that executes button function at mouse event
			//then closes menu
			(function(ruleName, nodes, ex, ey) {
				return function() { 
					var visualParams = {point: {x: ex, y: ey}};
					self.proof.useRuleOnCurrentStep(ruleName, nodes, null, visualParams);
					self.close();
				};
			})(x, this.nodes, this.x, this.y)
		);

		this.menu_items.push(menu_item); //push button into menu_items set
		c++;
	}
};

Context.prototype.close = function() {
	this.menu_items.remove();
	this.menu_items.clear();
};
