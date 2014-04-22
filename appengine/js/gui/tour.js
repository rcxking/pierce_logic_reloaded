$(document).ready(function(){
    var tour = new Tour({
        debug:true,
	onStart: function(){
	    return $start.addClass("disabled",true);
	},
	onEnd: function(){
	    return $start.removeClass("disabled",true);
	}
    });
    var $start = $("#tourbutton");
    tour.addSteps([
	{
	    title: "Welcome!",
	    content: "Welcome to Peirce Logic.  Let's walk you through the basics of the program. ",
	    placement: "bottom",
	    orphan:true
	} , {
	    element: "#ModeLinkContainer",
	    title: "Modes",
	    content: "This is the mode button, it is used to end the current mode and transition into the next stage of the proof. In Peirce Logic, you start out in Goal Mode. In this mode, you specify the goal of your proof, or what you want to prove.",
	    placement: "top",
	    backdrop:true
	} , {
	    title: "Peirce basics",
	    content: "This is the Plane of Truth. Every statement you put on the plane is true. All separate statements you put on the plane are conjuncted. For our example proof, we want to prove the Peirce equivalent of (A &#8743; B).",
	    orphan:true
	} , {
	    element: "#timeline",
	    title: "The Timeline",
	    content: "This timeline shows the different steps of the proof. Clicking on any of the nodes in the timeline allows to continue a different proof branch from that step.",
	    placement: "top",
	    backdrop:true
	} , {
	    element: "#newButton",
	    title: "New Proofs And Temporary Proofs",
	    content: "This new proof button resets the proof to a clear slate. Also, whenever a step is taken in the proof it is saved as a temporary state in a cookie. So don't worry if you accidentally leave the page.",
	    placement: "bottom",
	    backdrop:true
	} , {
	    element: "#paper",
	    title: "Add a statement",
	    placement: "left",
	    content: "Since everything on the page is conjuncted, we just have to put the statements A and B on the page. Right click or double click anywhere on the page and select the 'Construction: Variable' option.  Type in 'A' and click 'OK' or press enter.  Right click or double click anywhere else on the page and do the same for 'B'.  We've now completed setting up our goal state.",
	    orphan:true
	} , {
	    element: "#ModeLinkContainer",
	    title: "Going to Premise Mode",
	    content: "Now let's go to the next mode: Premise Mode. To do this, click on the mode button once.",
	    reflex: true,
	    placement: "top",
	    backdrop: true
	} , {
	    element: "#paper",
	    title: "Premise Mode",
	    placement: "left",
	    content: "Now we're in Premise Mode. Here we specify our assumptions. For this proof, let's assume the Peirce equivalent of (A &#8743; &#172;&#172 B). Place 'A' on the page in the same way as last time."
	} , {
	    element: "#paper",
	    title: "Cuts",
	    placement: "left",
	    content: "Now for the &#172;&#172 B. In Peirce logic, negations are represented visually as circles, which are called 'cuts.' Everything within a cut is negated, so everything within a cut that is itself within a cut is double negated. In this step, we place the cuts on a page first.  Right click or double click on the page again and select 'Construction: Empty Double Cut.'  Then right click or double click within the cut to place the 'B.'. The darker colored cut means anything inside it has an odd number of cuts around it."
	} , {
	    element: "#ModeLinkContainer",
	    title: "Going to Proof Mode",
	    content: "Now we're done setting up our assumptions. Let's go to Proof Mode. Click the button again.",
	    backdrop: true,
	    placement: "top",
	    reflex: true
	} , {
	    element: "#paper",
	    title: "Proof Mode",
	    content: "Proof Mode is where we operate on the premises to get to the goal.  We need to eliminate the double negation by getting rid of the two cuts. To do this, right click or double click on the 'B' and select 'Proof: Reverse Double Cut.' Now our proof state is equivalent to our goal state. You're done!",
	    placement: "left"
	    }
    ]);
    $start.click( function(){
	if($start.hasClass("disabled")){
	    return false;
	}
	tour.restart();
    });
});
