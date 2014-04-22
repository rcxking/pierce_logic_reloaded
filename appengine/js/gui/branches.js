////////////////////////////////////////////////////////////////////////////////
// Upgraded Raphael plugin for rendering Proof Timeline

// Updated popup.js plugin
// Taken from http://raphaeljs.com/analytics.html
(function() {
    var tokenRegex = /\{([^\}]+)\}/g,
        objNotationRegex = /(?:(?:^|\.)(.+?)(?=\[|\.|$|\()|\[('|")(.+?)\2\])(\(\))?/g,
        // matches .xxxxx or ["xxxxx"] to run over object properties
        replacer = function(all, key, obj) {
            var res = obj;
            key.replace(objNotationRegex, function(all, name, quote, quotedName, isFunc) {
                name = name || quotedName;
                if(res) {
                    if(name in res) {
                        res = res[name];
                    }
                    typeof res == "function" && isFunc && (res = res());
                }
            });
            res = (res === null || res == obj ? all : res) + "";
            return res;
        },
        fill = function(str, obj) {
            return String(str).replace(tokenRegex, function(all, key) {
                return replacer(all, key, obj);
            });
        };
    Raphael.fn.popup = function(X, Y, set, pos, ret) {
        set.attr({x:X,y:Y});
        pos = String(pos || "top-middle").split("-");
        pos[1] = pos[1] || "middle";
        var r = 5,
            bb = set.getBBox(),
            w = Math.round(bb.width),
            h = Math.round(bb.height),
            x = Math.round(bb.x) - r,
            y = Math.round(bb.y) - r,
            gap = Math.min(h / 2, w / 2, 10),
            shapes = {
                top: "M{x},{y}h{w4},{w4},{w4},{w4}a{r},{r},0,0,1,{r},{r}v{h4},{h4},{h4},{h4}a{r},{r},0,0,1,-{r},{r}l-{right},0-{gap},{gap}-{gap}-{gap}-{left},0a{r},{r},0,0,1-{r}-{r}v-{h4}-{h4}-{h4}-{h4}a{r},{r},0,0,1,{r}-{r}z",
                bottom: "M{x},{y}l{left},0,{gap}-{gap},{gap},{gap},{right},0a{r},{r},0,0,1,{r},{r}v{h4},{h4},{h4},{h4}a{r},{r},0,0,1,-{r},{r}h-{w4}-{w4}-{w4}-{w4}a{r},{r},0,0,1-{r}-{r}v-{h4}-{h4}-{h4}-{h4}a{r},{r},0,0,1,{r}-{r}z",
                right: "M{x},{y}h{w4},{w4},{w4},{w4}a{r},{r},0,0,1,{r},{r}v{h4},{h4},{h4},{h4}a{r},{r},0,0,1,-{r},{r}h-{w4}-{w4}-{w4}-{w4}a{r},{r},0,0,1-{r}-{r}l0-{bottom}-{gap}-{gap},{gap}-{gap},0-{top}a{r},{r},0,0,1,{r}-{r}z",
                left: "M{x},{y}h{w4},{w4},{w4},{w4}a{r},{r},0,0,1,{r},{r}l0,{top},{gap},{gap}-{gap},{gap},0,{bottom}a{r},{r},0,0,1,-{r},{r}h-{w4}-{w4}-{w4}-{w4}a{r},{r},0,0,1-{r}-{r}v-{h4}-{h4}-{h4}-{h4}a{r},{r},0,0,1,{r}-{r}z"
            },
            offset = {
                hx0: X - (x + r + w - gap * 2),
                hx1: X - (x + r + w / 2 - gap),
                hx2: X - (x + r + gap),
                vhy: Y - (y + r + h + r + gap),
                "^hy": Y - (y - gap)

            },
            mask = [{
                x: x + r,
                y: y,
                w: w,
                w4: w / 4,
                h4: h / 4,
                right: 0,
                left: w - gap * 2,
                bottom: 0,
                top: h - gap * 2,
                r: r,
                h: h,
                gap: gap
            }, {
                x: x + r,
                y: y,
                w: w,
                w4: w / 4,
                h4: h / 4,
                left: w / 2 - gap,
                right: w / 2 - gap,
                top: h / 2 - gap,
                bottom: h / 2 - gap,
                r: r,
                h: h,
                gap: gap
            }, {
                x: x + r,
                y: y,
                w: w,
                w4: w / 4,
                h4: h / 4,
                left: 0,
                right: w - gap * 2,
                top: 0,
                bottom: h - gap * 2,
                r: r,
                h: h,
                gap: gap
            }][pos[1] == "middle" ? 1 : (pos[1] == "top" || pos[1] == "left") * 2];
        var dx = 0,
            dy = 0,
            out = this.path(fill(shapes[pos[0]], mask)).insertBefore(set);
        switch(pos[0]) {
        case "top":
            dx = X - (x + r + mask.left + gap);
            dy = Y - (y + r + h + r + gap);
            break;
        case "bottom":
            dx = X - (x + r + mask.left + gap);
            dy = Y - (y - gap);
            break;
        case "left":
            dx = X - (x + r + w + r + gap);
            dy = Y - (y + r + mask.top + gap);
            break;
        case "right":
            dx = X - (x - gap);
            dy = Y - (y + r + mask.top + gap);
            break;
        }
        out.translate(dx, dy);
        if(ret) {
            ret = out.attr("path");
            out.remove();
            return {
                path: ret,
                dx: dx,
                dy: dy
            };
        }
        set.attr({x:set.getBBox().x+set.getBBox().width/2+dx,y:set.getBBox().y+set.getBBox().height/2+dy});
        set.toFront();
        return out;
    };
})();


branches = {
    draw: function(tree,options) {
        this.clear();
        if(options === undefined)
            options = {};
        var settings = {
            color: options.color || '#000',
            normal_r: options.normal_r || 4,
            highlight_r: options.highlight_r || 8,
            normal_stroke: options.normal_stroke || "#000",
            highlight_stroke: options.highlight_stroke || "#fff",
            normal_fill: options.normal_fill || {
				"goal":"#f00",
				"premise":"#0f0",
				"proof":"#00f",
				"insertion":"#FF6600"
			},
            highlight_fill: options.highlight_fill || options.color || '#fff',
            popup_text_attr: options.popup_text_attr || {
                fill: '#000',
                font: '10px verdana, arial, helvetica, sans-serif'
            },
            popup_attr: options.popup_attr || {
                fill: options.normal_fill || '#fff',
                "stroke-width": 2,
                stroke: options.color || '#000'
            },
            select_index: options.select_index || 0
        };

        // use for redrawing without a new tree
        if(tree === undefined)
            tree = this.cached_tree;
        else
            this.cached_tree = tree;
        var fclick = tree.select.bind(tree);

        dots_and_curr_index = branches.draw_dots.call(this, tree, settings, fclick);
        BranchHelper.highlight(dots_and_curr_index[0], dots_and_curr_index[1], settings);
    },


    draw_dots: function(tree, settings, fclick) {
        var dots = [],
            h_slack = 30,
            v_slack = 10,
            x_offset = h_slack,
            y_offset = TIMELINE_CANVAS_HEIGHT() / 2,
            title = this.text(0, 0, 'title').attr(settings.popup_text_attr).attr({
                'font-weight': 'bold',
                'font-size': '12px'
            }),
            label = this.set().push(title).hide(),
            popup = '',
            current = tree.front,
            bfs_stack = [
                [current, 0, 1]
            ],
            layers = [],
            max_layer_size = 1,
            dots_index = -1,
            curr_index = -1;
        //bfs_node_struct = [node,xlayer,parent_ylayer]
        //layers_node_struct = [node,y_layer,parent_ylayer]
        //construct generic layers
        while(bfs_stack.length > 0) {
            var node_struct = bfs_stack.pop();
            var node = node_struct[0];
            var xlayer = node_struct[1];
            var parent_ylayer = node_struct[2];
            var ylayer = null;
            if(layers.length < xlayer + 1) {
                ylayer = 1;
                layers[xlayer] = [
                    [node, ylayer, parent_ylayer]
                ];
            } else {
                ylayer = layers[xlayer].length + 1;
                layers[xlayer].push([node, ylayer, parent_ylayer]);
                if(max_layer_size < layers[xlayer].length) max_layer_size = layers[xlayer].length;
            }

            node.next.iterate(function(n) {
                bfs_stack.push([n, xlayer + 1, ylayer]);
            });
        }

        var branch_horizontal_distance = (TIMELINE_CANVAS_WIDTH() - 2.0 * h_slack) / (layers.length - 1 ? layers.length - 1 : 1);
        var branch_vertical_distance = (TIMELINE_CANVAS_HEIGHT() - 2.0 * v_slack) / max_layer_size;

        // go through layers making branches depending on y layer
        var node_ylayer = 0;
        var node_parent_ylayer = 0;
        var parent_mid_layer = 1;
        for(var i = 0; i < layers.length; i++) {
            var layer = layers[i];

            // layer x positions
            var layer_x = i * branch_horizontal_distance + x_offset;
            var prev_layer_x = 0;
            if(i > 0) {
                var prev_layer_x = (i - 1) * branch_horizontal_distance + x_offset;
                if(layer_x < (prev_layer_x + settings.normal_r * 2)) { //guarantee no overlapped with last layer
                    layer_x = prev_layer_x + settings.normal_r * 2;
                }
                //todo if layer_x > width then resize the width
            }

            // y midpoint jump, offset by 1 due to 0-indexing
            var mid_layer = (layer.length % 2 ? layer.length + 1 : layer.length + 1) / 2.0;
            // draw dots in layer
            for(var n = 0; n < layer.length; n++) {
                var node_struct = layer[n];
                var node = node_struct[0];
                node_ylayer = (-node_struct[1] + mid_layer);
                node_parent_ylayer = (-node_struct[2] + parent_mid_layer);

                var prev_layer_y = node_parent_ylayer * branch_vertical_distance + y_offset;
                var layer_y = node_ylayer * branch_vertical_distance + y_offset;

                this.path('M' + prev_layer_x + ' ' + prev_layer_y + 'L' + layer_x + ' ' + layer_y).attr({
                    stroke: settings.color,
                    "stroke-width": 3
                }).toBack();


                ++dots_index;

                dots[dots_index] = this.circle(layer_x, layer_y, settings.normal_r).attr({
                    fill: settings.normal_fill[node.mode],
                    stroke: settings.color,
                    "stroke-width": 2
                });

                dots[dots_index].node_mode = node.mode;

                if(node === tree.current) {
                    curr_index = dots_index;
                }

                (function(canvas, treenode,layer_x,layer_y,layer,dots_index) {
                    dots[dots_index].hover(function() {
                        this.attr({
                            r: settings.highlight_r
                        });
                        //var name = (treenode.rule_name.length > 40) ? treenode.rule_name.substring(0, 40) + "..." : treenode.rule_name;
                        var name = treenode.ruleName;
                        title.attr({
                            text: name
                            });
                        if(layer>=0) {
                            var x = this.getBBox().x + this.getBBox().width / 2;
                            var posx = "middle";
                            var posy = "top";
                            var diry = 1;
                            var x_slack = 100;
                            var y_slack = 3;
                            label.show();
                            popup = canvas.popup(x, layer_y - diry*15, label, posy+"-"+posx).attr(settings.popup_attr);
                            if(popup.getBBox().x <  x_slack) {
                                posx = "left";
                            }
                            if(layer == layers.length-1) {
                                posx = "right";
                            }
                            if(popup.getBBox().y < y_slack) {
                                posy = "bottom";
                                diry *= -1;
                            }
                            popup.remove();
                            popup = canvas.popup(x, layer_y - diry*15, label, posy+"-"+posx).attr(settings.popup_attr);
                            document.body.style.cursor = "pointer";
                        }
                    }, function() {
                        this.attr({
                            r: settings.normal_r
                        });
                        label.hide();
                        popup.remove();
                        document.body.style.cursor = "default";
                    });

                    dots[dots_index].click(function() {
                        fclick(treenode);
                        for(var j = 0; j < dots.length; j++) {
                            dots[j].attr({
                                fill: settings.normal_fill[dots[j].node_mode],
                                stroke: settings.normal_stroke*2
                            });
                        }
                        this.attr({
                            fill: settings.highlight_fill,
                            stroke: settings.normal_fill[dots[dots_index].node_mode]
                        });
                    });
                })(this, node, layer_x, layer_y,i,dots_index);
            }
            // set parent layer offset
            parent_mid_layer = mid_layer;
        }
        return [dots, curr_index];
    }
};

function BranchHelper() {}

BranchHelper.highlight = function(dots, index, settings) {
    for(var j = 0; j < dots.length; j++) {
        dots[j].attr({
            fill: settings.normal_fill[dots[j].node_mode],
            stroke: settings.normal_stroke
        });
    }
    dots[index].attr({
        fill: settings.highlight_fill,
        stroke: settings.normal_fill[dots[index].node_mode]
    });
};
