var debug;
var D = function(d) {
	debug = d;
	console.log(d);
};
var R;

window.onload = function() {
	// global constants
	Proof.SetupConstants();
	PLANE_VOFFSET = 0; // used to position things onto main plane
	BOOTSTRAP_HEIGHT = $(".navbar").outerHeight(); // header height
	PLANE_VOFFSET += 50;
	MODE_BUTTON_HEIGHT = 22; // height of mode status button
	TIMELINE_HEIGHT = 100;
	DEFAULT_PLANE_WIDTH = 5000;
	DEFAULT_PLANE_HEIGHT = 5000;
	DEFAULT_CHILD_WIDTH = 50;
	DEFAULT_CHILD_HEIGHT = 50;
	DEFAULT_CURVATURE = 20;
	PLANE_CANVAS_WIDTH = function() { return $(window).width(); };
	PLANE_CANVAS_HEIGHT = function() { return $(window).height() -BOOTSTRAP_HEIGHT -MODE_BUTTON_HEIGHT -TIMELINE_HEIGHT; };
	TIMELINE_CANVAS_WIDTH = PLANE_CANVAS_WIDTH;
	TIMELINE_CANVAS_HEIGHT = function() { return TIMELINE_HEIGHT; };

	// main raphael paper
	R = Raphael("paper", PLANE_CANVAS_WIDTH(), PLANE_CANVAS_HEIGHT());

	// ui minimap
	minimap = new Minimap(R);

	// ui timeline
	Timeline = Raphael('timeline', '100%', TIMELINE_CANVAS_HEIGHT());

	// main proof
	TheProof = new Proof(R);
	// add ui reactors to proof events
	AddUIReactors(TheProof);
	// add cookie storing reactor
	TheProof.addReactor(Proof.EVENTS.SELECT_NODE, function(proof) {
		sessionStorage.setItem("PeirceLogicTempProof", proof.SaveProof());
	});
	// setup reset
	$("#newButton").click(function () {
		if( confirm( "All unsaved changed will be lost!" )) {
			TheProof.Reset();
			TheProof.Begin();
		} else {
			// Do nothing!
		}
		this.blur();
	});

	// load temp proof if in sessionStorage
	if(sessionStorage.getItem("PeirceLogicTempProof"))
		TheProof.LoadProof(sessionStorage.getItem("PeirceLogicTempProof"));
	else // start new proof
		TheProof.Begin();

	// ui context menu
	ContextMenu = new ContextHandler(R, TheProof);

	// ui next and prev
	$('#backwardtick').click(function(e) {
		TheProof.prev();
	});
	$('#forwardtick').click(function(e) {
		TheProof.next();
	});

	// ui return to goal button
	var backNode;
	$('#goalbutton').click(function() {
		if ($(this).attr('value') == 'goGoal') {
			backNode = TheProof.current;
			node = TheProof.current;
			while ( node.mode !== Proof.LOGIC_MODES.GOAL_MODE ) {
				node = node.prev;
			}
			TheProof.select(node);
			this.disabled = false;
			this.innerHTML = 'Go Back';
			$(this).attr('value', 'goBack');
			$(this).attr('class', 'btn btn-primary navbar-btn');
		} else {
			TheProof.select(backNode);
			this.disabled = false;
			this.innerHTML = 'See Goal';
			$(this).attr('value', 'goGoal');
			$(this).attr('class', 'btn btn-danger navbar-btn');
		}
		this.blur();
	});

	// run these before submission
	$('#saveFormSubmit').click( function( event ) {
		$('#serializedProof').val(TheProof.SaveProof());
		$('#saveFormData').submit();
	});

	$('.loadProof').click( function( event ) {
		TheProof.LoadProof($(this).find('#jsonProof').val());
    	$("#loadModal").modal('toggle');
	});

	$('#tempButton').click( function( event ) {
    	TheProof.getVarNames();
	});

	// window resizeing
	$(window).resize( function() {
		minimap.windowResizeView();
		branches.draw.call(Timeline);
		R.setSize(PLANE_CANVAS_WIDTH(), PLANE_CANVAS_HEIGHT());
	});
};
