////////////////////////////////////////////////////////////////////////////////
// Level UI class for subtrees

// derives from UINode
Level.prototype = Object.create(UINode.prototype);

function Level(R, node, nodeDict) {
    this.superClass = Object.getPrototypeOf(Level.prototype);	
    this.superClass.constructor.call(this,R,node,nodeDict);
}

Level.prototype.createShape = function() {
	this.removeShape();
	this.shape = this.paper.rect(0,0,1,1);
	
    if(this.node.parent) { // cuts
		//mouseover effects
        this.shape.mouseover(function () {
        //    this.attr({"fill-opacity": 0.2});
        });
		this.shape.mouseout(function () {
		//	this.attr({"fill-opacity": 0.0}); 
        });
		
		this.setDragHandlers(this.onDragMove,this.onDragStart,this.onDragEnd);
	}    

	this.shape.parent = this;
	this.shape.mousedown(this.clicked());
	this.shape.dblclick(this.clicked());
	// turn off right menu
    $(document).bind('contextmenu', function(e) { e.preventDefault(); });
};

Level.prototype.defaultAttr = function() {
	// level fills
	var oddFill = "#FFFFFF";
	var evenFill = "#888";
    // plane
    if(!this.node.parent) {
		return {
			"stroke-dasharray": "",
            x: 0,
            y: 0,
            width: DEFAULT_PLANE_WIDTH || 5000,
            height: DEFAULT_PLANE_HEIGHT || 5000,
			fill: evenFill,
			stroke: evenFill, 
			"fill-opacity": 0.1
		};
    } else { // cut
        //color spectrum based on level
		var color = 0; 
        Raphael.getColor.reset();
		for(var x =1; x<=this.node.getLevel()+1;x++){
			color = Raphael.getColor();
		}
		return {
			"stroke-dasharray": "",
            x: 0,
            y: 0,
            width: DEFAULT_CHILD_WIDTH || 50,
            height: DEFAULT_CHILD_HEIGHT || 50,
            r: DEFAULT_CURVATURE || 20,
            fill: (this.node.getLevel() % 2) ? evenFill : oddFill,
			stroke: color, 
			"fill-opacity": 0.6
        };
    }
};

Level.prototype.getShapeAttr = function() {
	var attr = {};
	var shapeAttr = (this.shape.attr() ? this.shape.attr() : this.defaultAttr());
	if("x" in shapeAttr && "y" in shapeAttr && "stroke-dasharray" in shapeAttr) {
		attr.x = shapeAttr.x;
		attr.y = shapeAttr.y;
		attr["stroke-dasharray"] = shapeAttr["stroke-dasharray"];
	}
	return attr;
};

Level.prototype.setSelected = function(flag) {
	if(!flag)
		this.setShapeAttr({"stroke-width": 1});
	else
		this.setShapeAttr({"stroke-width": 3});
};

Level.prototype.getMousePoint = function(event) {
	//D(event);
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

Level.prototype.updateShape = function() {
	this.envelopeChildren();
};

// wrap level around level's children
Level.prototype.envelopeChildren = function() {
	if(this.node.parent) {
		var padding = 30;
		// children hull
		var newX1 = null; var newY1 = null; var newX2 = null; var newY2 = null;
		if(this.node.subtrees.length + this.node.leaves.length >= 1) {
			// get boundaries around children
			var self = this;
			var updateHull = function(node) {
				var childAttrs = self.getUINode(node).shape.getBBox();
				if(newX1 == null) newX1 = childAttrs.x - padding;
				else newX1 = Math.min(newX1, childAttrs.x - padding);
				if(newY1 == null) newY1 = childAttrs.y - padding;
				else newY1 = Math.min(newY1, childAttrs.y - padding);
				if(newX2 == null) newX2 = childAttrs.x2 + padding;
				else newX2 = Math.max(newX2, childAttrs.x2 + padding);
				if(newY2 == null) newY2 = childAttrs.y2 + padding;
				else newY2 = Math.max(newY2, childAttrs.y2 + padding);
			};
			this.node.subtrees.iterate(updateHull);
			this.node.leaves.iterate(updateHull);
		} else { // no update due to no children
			newX1 = this.shape.attrs.x;
			newY1 = this.shape.attrs.y;
			newX2 = this.shape.attrs.x + this.shape.attrs.width;
			newY2 = this.shape.attrs.y + this.shape.attrs.height;
		}

		// update self and parent
		this.setShapeAttr({x:newX1, y:newY1, width:newX2-newX1, height:newY2-newY1});
		this.getUINode(this.node.parent).envelopeChildren();  
	}
};

////////////////////////////////////////////////////////////////////////////////
// Dragging events

/*
Level.dragStart

Object level handler for
drag event initilization;
Adds attributes of orignal
coordinates to use for shifting
the shape during drag
*/
Level.prototype.dragStart = function() {
    //save orignal positions of children
    var itr = this.node.subtrees.begin();
    while(itr!=this.node.subtrees.end()) {
        this.getUINode(itr.val).dragStart();
        itr = itr.next;
    }
    //save orignal positions of variables
    itr = this.node.leaves.begin();
    while(itr!=this.node.leaves.end()) {
        this.getUINode(itr.val).dragStart();
        itr = itr.next;
    }
	// save parents attributes
	var p = this.node.parent;
	while(p) {
		var uiparent = this.getUINode(p);
		uiparent.ox = uiparent.shape.attr("x");
		uiparent.oy = uiparent.shape.attr("y");
		p = p.parent;
	}
    //save level's orignal position
    this.ox = this.shape.attr("x");
    this.oy = this.shape.attr("y");

    //highlight shape
    //this.setShapeAttr({"fill-opacity": 0.5});
};

Level.prototype.dragMove = function(dx, dy, noCollision) {
	var dpoint; // delta point for movement

	if(!noCollision) {
		// find maximum delta within collision
		dpoint = this.collisionDelta(this.ox,this.oy,dx,dy);
	} else {
		dpoint = {x: dx, y: dy};
	}
	var point = {x: dpoint.x+this.ox,
				 y: dpoint.y+this.oy};
	this.setShapeAttr(point);

    //shift children
	var self = this;
	var moveChildren = function(node) {
		self.getUINode(node).dragMove(dpoint.x, dpoint.y, true);
	};
	this.node.subtrees.iterate(moveChildren);
	this.node.leaves.iterate(moveChildren);
	// envelope children

    //fit hull to new area
	if(!noCollision)
		if (this.node.parent)
			this.getUINode(this.node.parent).envelopeChildren();
		else
			this.envelopeChildren();
};

Level.prototype.dragEnd = function() {
	if (this.node.parent)
    	this.getUINode(this.node.parent).envelopeChildren();
    else
    	this.envelopeChildren();
    //this.setShapeAttr({"fill-opacity": 0.3});
};

////////////////////////////////////////////////////////////////////////////////
// Collision logic

Level.prototype.bboxCollisionDelta = function(bbox, del, cbbox) {
	var delta = {x: del.x, y: del.y};
	var dbbox = { x: bbox.x + delta.x, 
				  y: bbox.y + delta.y,
				  x2: bbox.x2 + delta.x,
				  y2: bbox.y2 + delta.y};	
	if(!this.paper.raphael.isBBoxIntersect(dbbox,cbbox))
		return delta;
	
	// differences from opposite walls in order of cbbox walls
	var dl, dr, du, dd;
	dl = dbbox.x2 - cbbox.x;
	dr = cbbox.x2 - dbbox.x;
	du = dbbox.y2 - cbbox.y;
	dd = cbbox.y2 - dbbox.y;
	// delta adjustments
	var dx = 0; var dy = 0;

	if(dl > 0 || dr > 0) {
		if(dl < 0) dx = dr;
		else if(dr < 0) dx = -dl;
		else if(dl < dr) dx = -dl;
		else dx = dr;
	}
	// flip if cbbox is in bbox
	if(dbbox.x <= cbbox.x && cbbox.x2 <= dbbox.x2) {
		//dx = -dx;
	}
	if(du > 0 || dd > 0) {
		if(du < 0) dy = dd;
		else if(dd < 0) dy = -du;
		else if(du < dd) dy = -du;
		else dy = dd;
	}		
	// flip if cbbox is in bbox
	if(dbbox.y <= cbbox.y && cbbox.y2 <= dbbox.y2) {
		//dy = -dy;
	}
	
	// move in delta axis that minimizes overall change
	if(Math.abs(dx) > Math.abs(dy))
		delta.y += dy;
	else
		delta.x += dx;

	return delta;
};

Level.prototype.globalCollisionDelta = function(bbox, del, delslack) {
	var delta = {x: del.x, y: del.y};
	var slack = delslack || 5;

	// global bounds
	var globalBoundingBox = this.getUINode(this.node.getRoot()).shape.getBBox();
	if(bbox.x-slack+delta.x < globalBoundingBox.x)
		delta.x = globalBoundingBox.x + - bbox.x + slack;
	if(bbox.x2+slack+delta.x > globalBoundingBox.x2)
		delta.x = globalBoundingBox.x2 + - bbox.x2 - slack;
	if(bbox.y-slack+delta.y < globalBoundingBox.y)
		delta.y = globalBoundingBox.y + - bbox.y + slack;
	if(bbox.y2+slack+delta.y > globalBoundingBox.y2)
		delta.y = globalBoundingBox.y2 + - bbox.y2 - slack;
	return delta;
};

Level.prototype.collideChildDelta = function(child, bbox, del) {
	var delta = {x: del.x, y: del.y};
	var slack = 3;
	var deltaBBox = function() { 
		return { x: bbox.x + delta.x, 
				 y: bbox.y + delta.y,
				 x2: bbox.x2 + delta.x,
				 y2: bbox.y2 + delta.y};
	};
	// adjust delta to avoid collision with input bbox
	var self = this;
	var adjustDelta = function(node) {
		if(node.getIdentifier() != child.node.getIdentifier()) {
			var obbox = self.getUINode(node).shape.getBBox();
			delta = self.bboxCollisionDelta(bbox, delta, obbox);
		}
	};
	this.node.subtrees.iterate(adjustDelta);
	this.node.leaves.iterate(adjustDelta);
	return delta;
};

Level.prototype.collisionDelta = function(ox, oy, dx, dy) {
	var delta = {x: dx, y: dy};
	if(!this.node.parent)
		return delta;
	var bbox = this.shape.getBBox();
	bbox = {x: ox, 
			x2: ox+bbox.width,
			y: oy, 
			y2:	oy+bbox.height};
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
	delta = this.globalCollisionDelta(bbox,delta);

	// adjacent children collision filter
	delta = uiparent.collideChildDelta(this,bbox,delta);

	
	return delta;
};
