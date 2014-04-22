////////////////////////////////////////////////////////////////////////////////
// Variable UI class for leaves

// derives from UINode
Variable.prototype = Object.create(UINode.prototype);

function Variable(R, node, nodeDict) {
    this.superClass = Object.getPrototypeOf(Variable.prototype);
	this.superClass.constructor.call(this,R,node,nodeDict);
}

Variable.prototype.createShape = function() {
    this.removeShape();
	this.shape = this.paper.text(0,0,"~")
	this.shape.parent = this;

	this.setDragHandlers(this.onDragMove,this.onDragStart,this.onDragEnd);
	this.shape.mousedown(this.clicked());
	this.shape.dblclick(this.clicked());
	$(this.shape).css("-moz-user-select", "none");
	$(this.shape).css("-webkit-user-select", "none");
	$(this.shape).css("-ms-user-select", "none");
	$(this.shape).css("user-select", "none");
	// turn off right menu
    $(document).bind('contextmenu', function(e) { e.preventDefault(); });
};

Variable.prototype.defaultAttr = function() {
	return {
		x: 0,
		y: 0,
		text: this.node.getAttribute("label"),
		"font-family": "Arial",
		"font-size": "22px"
	};
};

Variable.prototype.getShapeAttr = function() {
	var attr = {};
	var shapeAttr = (this.shape.attr() ? this.shape.attr() : this.defaultAttr());
	if("x" in shapeAttr && "y" in shapeAttr && "text" in shapeAttr) {
		attr.x = shapeAttr.x;
		attr.y = shapeAttr.y;
		attr.text = shapeAttr.text;
	}
	return attr;
};

Variable.prototype.setSelected = function(flag) {
	if(!flag)
		this.shape.attr({"stroke-width": "0"});
	else
		this.shape.attr({"stroke-width": "2"});
		this.shape.attr({"stroke": "#000000"});
};

Variable.prototype.getMousePoint = function(event) {
	var coords = mouse_to_svg_coordinates(this.paper,event);
	var ex = 200; 
	var ey = 200;
	if(jQuery.browser.chrome) {
		ex = coords.x;
		ey = coords.y - this.paper.canvas.offsetTop;
	} else if(jQuery.browser.mozilla) {
		ex = coords.x;
		ey = coords.y;
	} else {
		ex = coords.x;
		ey = coords.y;
	}
	return {x:ex,y:ey};
};

////////////////////////////////////////////////////////////////////////////////
// Dragging events

Variable.prototype.dragStart = function() {
	//save Variable's orignal position
	this.ox = this.shape.attr("x");
	this.oy = this.shape.attr("y");
	// save parents attributes
	var p = this.node.parent;
	while(p) {
		var uiparent = this.getUINode(p);
		uiparent.ox = uiparent.shape.attr("x");
		uiparent.oy = uiparent.shape.attr("y");
		p = p.parent;
	}
};

Variable.prototype.dragMove = function(dx, dy, noCollision) {
	var dpoint; // delta point for movement
	if(!noCollision) {
		// find maximum delta within collision
		dpoint = this.collisionDelta(this.ox, this.oy, dx,dy);
	} else {
		dpoint = {x: dx, y: dy};
	}
	dpoint.x += this.ox;
	dpoint.y += this.oy;
	this.setShapeAttr(dpoint);

	//fit parent hull to new area
	this.getUINode(this.node.parent).envelopeChildren();
};

Variable.prototype.dragEnd = function() {
	this.getUINode(this.node.parent).envelopeChildren();
};

////////////////////////////////////////////////////////////////////////////////
// Collision logic

Variable.prototype.collisionDelta = function(ox, oy, dx, dy) {
	var delta = {x: dx, y: dy};
	var bbox = this.shape.getBBox();
	bbox = {x: ox-bbox.width/2, 
			x2: ox+bbox.width/2,
			y: oy-bbox.height/2, 
			y2:	oy+bbox.height/2};
	var uiparent = this.getUINode(this.node.parent);

	// parent collision filter
	var pbbox = {x: uiparent.ox, 
				 x2: uiparent.ox+uiparent.shape.getBBox().width,
				 y: uiparent.oy, 
				 y2: uiparent.oy+uiparent.shape.getBBox().height};
	// if delta movement out of parent with slack
	//	var bslack = 0;
	// if((delta.x > 0 && !(bbox.x2+delta.x+bslack <= pbbox.x2)) ||
	//    (delta.x < 0 && !(pbbox.x <= bbox.x+delta.x-bslack)) ||
	//    (delta.y > 0 && !(bbox.y2+delta.y+bslack <= pbbox.y2)) ||
	//    (delta.y < 0 && !(pbbox.y <= bbox.y+delta.y-bslack)))
		delta = uiparent.collisionDelta(pbbox.x, pbbox.y, delta.x, delta.y);
	
	// global bounds filter
	delta = uiparent.globalCollisionDelta(bbox,delta);

	// adjacent children collision filter
	delta = uiparent.collideChildDelta(this,bbox,delta);

	return delta;
};

