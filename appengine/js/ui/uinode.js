////////////////////////////////////////////////////////////////////////////////
// Container for ui nodes

function UINodeTree(R, node_tree, subtree_class, leaf_class, tree_attrs) {
    this.R = R;
    this.tree = node_tree; // underlying node tree
    this.subtree_class = subtree_class; // ui class for subtrees
    this.leaf_class = leaf_class; // ui class for leaves
    this.uinodes = {}; // id -> uinode
	// construct ui based on input attr
    if(tree_attrs) { 
		// ui decorator that uses previous attrs and defaults
        this.constructUI(function(id,uinode) {
            var attr = tree_attrs[id] || {};
            var defaultAttrs = uinode.defaultAttr();
			// input attr union default attr
            for(var a in defaultAttrs) {
                if(!(a in attr)) {
                    attr[a] = defaultAttrs[a];
                }
            }
            uinode.setShapeAttr(attr);
        });
    } else { 
		// ui decorator that uses just the default attrs
        this.constructUI(function(id,uinode) {
            uinode.setShapeAttr(uinode.defaultAttr());
        });
    }
}

// takes in a decorator that gives attrs to uinodes
// attr_decorator: func(id, uinode)
UINodeTree.prototype.constructUI = function(attr_decorator) {
    // convert node tree into id:node dict
    var treeDict = this.tree.toDict();
	var ids = this.tree.preOrderFlattenToIDs();
    for(var i in ids) {
		var id = ids[i];
        var uinode = null;
        var node = treeDict[id];
        if(node.isLeaf())
            uinode = new this.leaf_class(this.R, node, this.uinodes);
        else
            uinode = new this.subtree_class(this.R, node, this.uinodes);
        uinode.createShape();
        attr_decorator(id, uinode);
        this.uinodes[id] = uinode;
    }
	// update shapes
	var self = this;
	this.tree.inOrderFMap(function(node) {
		var uinode = self.uinodes[node.getIdentifier()];
		uinode.updateShape();
	});
};

UINodeTree.prototype.deconstructUI = function() {
    for(var id in this.uinodes) {
        this.uinodes[id].removeShape();
    }
    this.uinodes = null;
};

UINodeTree.prototype.getAttrs = function() {
	var attrs = {};
	for(var id in this.uinodes) {
		attrs[id] = this.uinodes[id].getShapeAttr();
	}
	return attrs;
};

////////////////////////////////////////////////////////////////////////////////
// UINode that is a decorator around Nodes for GUI elements
// UI classes derive from this class to be used in UINodeTree

function UINode(R, node, nodeDict) {
    this.node = node; // underlying node
    this.nodeDict = nodeDict; // id -> Node

    this.paper = R;
    this.shape = null; // raphael element
}

UINode.prototype.getUINode = function(node) {
    if(node) {
        return this.nodeDict[node.getIdentifier()];
    }
    return null;
};

UINode.prototype.defaultAttr = function() {
    return {};
}

UINode.prototype.createShape = function() {
    this.shape = null;
}

UINode.prototype.updateShape = function() {
	// update shape based on attributes
}

UINode.prototype.removeShape = function() {
    if(this.shape) {
        this.shape.remove();
        this.shape = null;
    }
}

UINode.prototype.getShapeAttr = function() {
    return (this.shape.attr() ? this.shape.attr() : this.defaultAttr());
}

UINode.prototype.setShapeAttr = function(attr) {
    this.shape.attr(attr);
}

UINode.prototype.setSelected = function(flag) {
    // toggle on flag
}

UINode.prototype.getMousePoint = function(event) {
	var coords = mouse_to_svg_coordinates(this.paper,event);
	return {x: coords.x, y: coords.y};
}

UINode.prototype.clicked = function() {
	var self = this;
	return function(event) {
		ContextMenu.CloseContext();
		var point = self.getMousePoint(event);
		ContextMenu.SingleClickHandler(self, point.x, point.y, event);    
	};
}

UINode.prototype.setDragHandlers = function(dragMove, dragStart, dragEnd) {
	this.shape.drag(dragMove, dragStart, dragEnd);
	this.shape.touchmove(dragMove);
	this.shape.touchstart(dragStart);
	this.shape.touchend(dragEnd);
}

UINode.prototype.drag = function(dx,dy) {
    this.dragStart();
    this.dragMove(dx,dy);
    this.dragEnd();
}

UINode.prototype.dragStart = function() {
    // drag start inital state
}

//shape callback for drag starting
UINode.prototype.onDragStart = function() {
    this.parent.dragStart();
    if(this.parent.superClass)
        this.parent.superClass.dragStart.call(this);
};

UINode.prototype.dragMove = function(dx, dy) {
    minimap.redraw(); // global minimap
};

//shape callback for drag move
UINode.prototype.onDragMove = function(dx,dy) {
    this.parent.dragMove(dx,dy);
    if(this.parent.superClass)
        this.parent.superClass.dragMove.call(this,dx,dy);
};

UINode.prototype.dragEnd = function () {
    this.paper.renderfix();
}

//shape callback for drag ending
UINode.prototype.onDragEnd = function() {
    this.parent.dragEnd();
    if(this.parent.superClass)
        this.parent.superClass.dragEnd.call(this);
};
