InferenceRule.prototype.PL_statement = function (proof, rule_name, nodes, x, y) {
	smoke.prompt('Enter Propositional Logic Statement', function(pl_statement){
		//alert("HEY-OOOHH")
		// validate pl_statment text & convert to node skeleton
		var node_skel = PL_Node.PL_to_EG(pl_statement);
		//var node_skel = null;
		if(node_skel){
		
			
			// add to proof
			proof.addnode(rule_name,this.RuleToId(rule_name),nodes);
			var base_level = nodes.begin().val;
			
			// add nodes from skeleton
			base_level.addChild(x,y);
			 var x_offset=0;
			 for(var i=0; i<node_skel.subtrees[0].subtrees.length; i++){
			 	base_level.subtrees[0].addChild(x + x_offset, y);
			 	var y_offset=0;
			 	for(var j=0; j<node_skel.subtrees[0].subtrees[i].leaves.length; j++){
			 		base_level.subtrees[0].subtrees[i].addVariable(x,y,node_skel.subtrees[0].subtrees[i].leaves[j]);
			 	}
			 	x_offset += 50;
			 }
		} else {
			smoke.alert("Invalid PL Statement");
		}
	});
};

InferenceRule.prototype.PL_statement_for = function(mode) {
	return function(inf){
	return function(proof, nodes, x, y) {
		inf.PL_statement(proof, mode, nodes, x, y);
	};
	}(this);
};