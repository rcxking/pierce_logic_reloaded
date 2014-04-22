////////////////////////////////////////////////////////////////////////////////
// Minimap for rendering quick view of an entire Raphael paper and controlling its view

function Minimap(R) {
    this.x = 3;
    this.y = 3;
    this.width = 100;
    this.height = 100;
    this.relief = 4;
    this.points = [];
    var plane_width = DEFAULT_PLANE_WIDTH;
    var plane_height = DEFAULT_PLANE_HEIGHT;

    this.R = R;
    this.R_overlay = induce_overlay('minimap', this.x, this.y+PLANE_VOFFSET, this.x+this.width+1, this.y+this.height+1);

    this.viewport = this.R_overlay.rect(this.x, this.y, (PLANE_CANVAS_WIDTH()/plane_width)*this.width,
                                                        (PLANE_CANVAS_HEIGHT()/plane_height)*this.height);
    this.viewport.parent = this;
    this.viewport.ox = this.x;
    this.viewport.oy = this.y;

    this.viewport.attr({
        'stroke-width': 1,
        fill: 'white',
        stroke: 'black',
        'fill-opacity': 0.15
    });

    this.minimap = this.R_overlay.rect(this.x, this.y, this.width, this.height).attr({
        fill: 'black',
        stroke: 'black',
        'stroke-width': 1,
        'fill-opacity': 0.15
    });
    this.minimap.parent = this;



    this.zoom_x = 0;
    this.zoom_y = 0;
    this.zoom_width = PLANE_CANVAS_WIDTH();
    this.zoom_height = PLANE_CANVAS_HEIGHT();
    R.setViewBox(this.zoom_x, this.zoom_y, this.zoom_width, this.zoom_height, false);

    this.minimap.drag(this.move, this.start, this.end);
	this.minimap.touchmove(this.move);
	this.minimap.touchstart(this.start);
	this.minimap.touchend(this.end);
    this.minimap.dblclick(this.minimapClick);
}

Minimap.prototype.minimapClick = function(event) {
    var coords = mouse_to_svg_coordinates(this,event);
    this.parent.collisionMove(coords.x+event.clientX-this.parent.relief,coords.y+event.clientY-PLANE_VOFFSET-this.parent.relief);
};

Minimap.prototype.start = function () {
    // this.attr({
    //     opacity: 0.5
    // });
    this.parent.viewport.ox = this.parent.viewport.attr("x");
    this.parent.viewport.oy = this.parent.viewport.attr("y");
};

Minimap.prototype.move = function (dx, dy) {
    this.parent.collisionMove(this.parent.viewport.ox + dx, this.parent.viewport.oy + dy);
};

Minimap.prototype.end = function () {
    // this.attr({
    //     opacity: 100
    // });
};

Minimap.prototype.collisionMove = function (x, y) {
    var v_bbox = this.viewport.getBBox();
    var m_bbox = this.minimap.getBBox();
    var ox = this.viewport.ox;
    var oy = this.viewport.oy;
    var new_x = x;
    var new_y = y;
    var v_width = this.viewport.attr("width");
    var v_height = this.viewport.attr("height");
    var m_width = this.minimap.attr("width");
    var m_height = this.minimap.attr("height");

    //If viewport is colliding with left-bound
    //of minimap.
    if (new_x <= m_bbox.x)
        new_x = m_bbox.x;

    //If viewport is colliding with the right-
    //bound of minimap
    if (new_x + v_width >= m_bbox.x2)
        new_x =  m_bbox.x2 - v_width;

    //If viewport is colliding with the upper-
    //bound of the minimap
    if (new_y <= m_bbox.y)
        new_y = m_bbox.y;

    //If viewport is colliding with the lower-
    //bound of the minimap
    if (new_y + v_height >= m_bbox.y2)
        new_y = m_bbox.y2 - v_height;

    this.viewport.attr({
        x: new_x,
        y: new_y
    });

    var v_ox = new_x;
    var v_oy = new_y;
    var m_ox = this.x;
    var m_oy = this.y;

    this.zoom_x = ((v_ox-m_ox)/m_width)*DEFAULT_PLANE_WIDTH;
    this.zoom_y = ((v_oy-m_oy)/m_height)*DEFAULT_PLANE_HEIGHT;
    this.zoom_width = PLANE_CANVAS_WIDTH();
    this.zoom_height = PLANE_CANVAS_HEIGHT();

    this.R.setViewBox(this.zoom_x, this.zoom_y, this.zoom_width, this.zoom_height, false);
};

Minimap.prototype.windowResizeView = function() {
    var plane_width = DEFAULT_PLANE_WIDTH;
    var plane_height = DEFAULT_PLANE_HEIGHT;
    this.zoom_width = PLANE_CANVAS_WIDTH();
    this.zoom_height = PLANE_CANVAS_HEIGHT();

    this.viewport.attr({"width": (PLANE_CANVAS_WIDTH()/plane_width)*this.width});
    this.viewport.attr({"height": (PLANE_CANVAS_HEIGHT()/plane_height)*this.height});

    this.R.setViewBox(this.zoom_x, this.zoom_y, this.zoom_width, this.zoom_height, false);
};

Minimap.prototype.redraw = function() {
    var tree = TheProof.current.nodeTree;
	var attrs = TheProof.current.uiTree.getAttrs();
    for(var p in this.points) {
        this.points[p].remove();
    }
    this.points = [];
    var mm = this;
    tree.subtrees.iterate(function(node) {
		var attr = attrs[node.getIdentifier()];
        var x = attr.x;
        var y = attr.y;
        mm.addPoint(x,y,"red");
    });
    tree.leaves.iterate(function(node) {
		var attr = attrs[node.getIdentifier()];
        var x = attr.x;
        var y = attr.y;
        mm.addPoint(x,y,"gray");
    });
};

Minimap.prototype.addPoint = function (x, y, color) {
    var m_width = this.minimap.attr('width');
    var m_height = this.minimap.attr('height');
    var x_offset = this.minimap.attr('x');
    var y_offset = this.minimap.attr('y');
    var plane_height = DEFAULT_PLANE_HEIGHT;
    var plane_width = DEFAULT_PLANE_WIDTH;

    var zoom_x = ((x/plane_width)*m_width)+x_offset;
    var zoom_y = ((y/plane_height)*m_height)+y_offset;

    var point = this.R_overlay.rect(zoom_x, zoom_y, 1, 1, DEFAULT_CURVATURE).attr({fill: color, stroke: color});
    this.points.push(point);
};
