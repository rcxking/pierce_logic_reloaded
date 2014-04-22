////////////////////////////////////////////////////////////////////////////////
// Inference rule for adding variables

function ValidateVariable(tree, nodes) {
	if(nodes.length == 1) {
		var node = nodes.first();
		if(node.isLeaf())
			return false;
		return true;
	}
	return false;
}

function AddVariable(tree, nodes, params) {
	var diff = NewDiff();

	var variable_name = "UNKNOWN";
	if(params && params.variable_name && params.variable_name.length) {
		variable_name = params.variable_name;
	} else {
		var input_name = UIGetVariableName();
		if(input_name && input_name.length)
			variable_name = input_name;
	}
	if(!params)
		params = {};
	params.variable_name = variable_name;
	
	var parent = nodes.first();
	var child = parent.addLeaf();
	child.addAttribute("label",variable_name);
	diff.additions.push(child);

	return {tree: tree, diff: NodeDiffToIdDiff(diff), params: params};
}

function ApplyVisualAttrs(tree, nodes, diff, attrs, params) {
	var point = PullPointFromParams(params);
	if(!point) return null;

	var variableID = diff.additions[0];
	AddPointToID(point, variableID, attrs);

	var variable = tree.getChildByIdentifier(variableID);
	var label = variable.getAttribute("label");
	var attr = attrs[variableID];
	attr.text = label;
	return {attrs: attrs};
}

function UIGetVariableName() {
	var variable_name = "";
	//setup text initialization
	// smoke.prompt('Enter Variable Name',function(e){
	// 	if(e){
	// 		variable_name = e.replace(/^\s+|\s+$/g,"");
	// 	}
	// 	if(!variable_name.length) { //if not valid string, just white space
	// 		variable_name = "EMPTY VARIABLE";
	// 	}
	// });
	variable_name = window.prompt("Enter Variable Name");
	variable_name = variable_name.replace(/^\s+|\s+$/g,"");
	if(!variable_name.length)
		variable_name = "UNKNOWN VARIABLE";

	return ReplaceWhitespace(variable_name);
}
