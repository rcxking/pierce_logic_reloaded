//converts propositional logic to existential graphs

//if variable != null then this PL node is a variable, otherwise it's a compound statement
function PL_Node(parent){
	this.operation = "null";
	this.parent = parent || null;
	this.LNode = null;
	this.RNode = null;
	this.truth = true;
	this.variable = "null"; 
}

PL_Node.new_Var = function(v){
	var	new_node = new PL_Node();
	new_node.variable = v;
	return new_node;
}

PL_Node.new_And = function(n1, n2){
	var new_node = new PL_Node();
	new_node.operation = "and";
	new_node.LNode = n1;
	new_node.RNode = n2;
	return new_node;
}

PL_Node.new_Or = function(n1, n2){
	var new_node = new PL_Node();
	new_node.operation = "or";
	new_node.LNode = n1;
	new_node.RNode = n2;
	return new_node;
}

PL_Node.new_Implies = function(n1, n2){
	var new_node = new PL_Node();
	new_node.operation = "implies";
	new_node.LNode = n1;
	new_node.RNode = n2;
	return new_node;
}

PL_Node.neg = function(n1){
	n1.truth = !n1.truth;
	return n1;
}

//returns first substament in string s
//example, given "(A&B) & C", returns "(A&B)"
//given "& C)", returns "C"
PL_Node.return_substatement = function(s){
	var paren_offset = 0;
	var index = 0;
	if(s[index] == "!"){index++;}
	if(s[index] == "("){
		paren_offset++; index++;
		while(paren_offset > 0){
			if(index >= s.length){/*alert("Missing end parenthesis");*/ return null;}
			if(s[index]==")"){paren_offset--;}
			if(s[index]=="("){paren_offset++;}
			index++;
		}
	}
	else{
		while(index < s.length && s[index] !=")" && s[index] != "&" && s[index] != "-" && s[index] != "|"){
			if(index >= s.length){/*alert("issue with symbol after variable");*/ return null;}
			index++;
		}
		//index--;
	}
	var ret_string = s.substring(0, index);
	return ret_string;
}

//Takes in a string representing a PL statement, and returns a corresponding PL_Node
PL_Node.parse_PL = function(s){
	var node = new PL_Node();
	if(s.length == 0){/*alert("empty string given");*/return null;}
	var index = 0; var paren_offset = 0;
	if(s[index] == "!"){node.truth = false; index++;}
	if(s[index] == "("){
		index++;
		var s1 = PL_Node.return_substatement(s.substring(index, s.length-1));
		if(s1 == null){return null;}
		index += s1.length;
		while(s[index] == " "){index++;}
		if(s[index] == "-" && s[index+1] == ">"){node.operation = "implies"; index += 2;}
		else if(s[index] == "&"){node.operation = "and"; index++;}
		else if(s[index] == "|" && s[index+1] == "|"){node.operation = "or"; index += 2;}
		var s2 = PL_Node.return_substatement(s.substring(index, s.length-1));
		if(s2 == null){return null;}		
		node.LNode = PL_Node.parse_PL(s1);
		node.RNode = PL_Node.parse_PL(s2);
	}
	else{
		var var_name = "";
		while(index < s.length){
			var_name += s[index];
			index++;
		}
		node.variable = var_name;
	}
	return node;
}

//adjusts PL node so it only contains conjunctions and disjunctions of literals 
//ie, every negation is around a variable, not a complex statement
PL_Node.Distribute_Nots = function(n){
	var n1 = PL_Node.Copy_PL(n);
	//var n1 = new PL_Node();
	if(n1.operation == "null"){return n1;}
	if(n1.truth && n1.operation == "implies"){
		n1.operation = "or";
		n1.LNode.truth = !(n1.LNode.truth);
	}
	else if(!n1.truth){
		if(n1.operation == "and"){
			n1.operation = "or";
			n1.LNode.truth = !(n1.LNode.truth);
			n1.RNode.truth = !(n1.RNode.truth);
		}
		else if(n1.operation == "or"){
			n1.operation = "and";
			n1.LNode.truth = !(n1.LNode.truth);
			n1.RNode.truth = !(n1.RNode.truth);
		}
		else if(n1.operation == "implies"){
			n1.operation = "and";
			//PL_Node.Print_PL(n1.RNode);
			n1.RNode.truth = !(n1.RNode.truth);
			//PL_Node.Print_PL(n1.RNode.truth);
		}
		n1.truth = true;
	}
	n1.LNode = PL_Node.Distribute_Nots(n1.LNode);
	n1.RNode = PL_Node.Distribute_Nots(n1.RNode);
	return n1;
}

//n1 is any node, n2 is of form (P or Q), applies distribution as if they were conjuncted together to get: n1 = (n1 or P) and n2 = (n1 or Q)
PL_Node.Apply_Distribution = function(n1, n2){
	if(n2.operation != "or"){return;}
	n1.operation = "and";
	n2.operation = "and";
	var n1_copy1 = PL_Node.Copy_PL(n1);
	n1_copy1.parent = n1;
	var n1_copy2 = PL_Node.Copy_PL(n1);
	n1_copy2.parent = n2;
	n1.LNode = n1_copy1;
	n1.RNode = PL_Node.Copy_PL(n2.LNode);
	n1.variable = "null";
	n2.LNode = n1_copy2;
}

//Puts PL_Node output from Distribute_Nots in Disjunctive Normal Form
//Shifts Ands inwards so no "and" has an "or" as a subgraph. 
PL_Node.Shift_Ands = function(n){
	var n1 = PL_Node.Copy_PL(n);
	if(n1.operation == "null"){return n1;}
	n1.LNode = PL_Node.Shift_Ands(n.LNode);
	n1.RNode = PL_Node.Shift_Ands(n.RNode);
	if(n.operation != "and"){return n1;}
	else if(n.operation == "and"){
		if(n1.LNode.operation == "or" && n1.RNode.operation == "or"){
			n1.operation = "or";
			PL_Node.Apply_Distribution(n1.LNode, n1.RNode);
			PL_Node.Apply_Distribution(n1.RNode, n1.LNode);
		}
		else if(n1.LNode.operation == "or"){
			n1.operation = "or";
			PL_Node.Apply_Distribution(n1.RNode, n1.LNode);
		}
		else if(n1.RNode.operation == "or"){
			n1.operation = "or";
			PL_Node.Apply_Distribution(n1.LNode, n1.RNode);
		}
	}
	return n1;
}

//returns a copy of n
PL_Node.Copy_PL = function(n){
	var new_node = new PL_Node();
	new_node.truth = n.truth;
	if(n.variable == "null"){
		new_node.operation = n.operation;
		new_node.LNode = PL_Node.Copy_PL(n.LNode);
		new_node.RNode = PL_Node.Copy_PL(n.RNode);
	}
	else{new_node.variable = n.variable;}
	return new_node;
}

//prints n
PL_Node.Print_PL = function(n){
	if(!n.truth){document.write(" !");}
	if(n.variable != "null"){document.write(n.variable);}
	else{
		document.write(" ( ");
		PL_Node.Print_PL(n.LNode);
		if(n.operation == "and"){document.write(" & ");}
		else if(n.operation == "or"){document.write(" || ");}
		else if(n.operation == "implies"){document.write(" -> ");}
		PL_Node.Print_PL(n.RNode);
		document.write(" ) ");
	}
}

//takes a node of nested conjunctions and returns a node containing all the literals
PL_Node.get_Ands = function(n){
	var node = Node.NodeSkeleton();
	if(n.operation == "null"){
		if(n.truth){node.leaves.push(n.variable);}
		else{node.subtrees.push(Node.NodeSkeleton()); node.subtrees[0].leaves.push(n.variable);}
	}
	else{
		node.absorb_graph(PL_Node.get_Ands(n.LNode));
		node.absorb_graph(PL_Node.get_Ands(n.RNode));
	}
	return node;
}

//helper function to PL_to_EG
PL_Node.handle_Ors = function(n){
	var n1 = Node.NodeSkeleton();
	if(n.operation == "null"){
		var n2 = Node.NodeSkeleton();
		if(n.truth){n2.leaves.push(n.variable);}
		else{n2.subtrees.push(Node.NodeSkeleton()); n2.subtrees[0].leaves.push(n.variable);}
		n1.subtrees.push(n2);
	}
	else if(n.operation == "and"){
		n1.subtrees.push(PL_Node.get_Ands(n));
	}
	else{
		var n1 = Node.NodeSkeleton();
		n1.absorb_graph(PL_Node.handle_Ors(n.LNode));
		n1.absorb_graph(PL_Node.handle_Ors(n.RNode));
	} 
	n1.remove_DN();
	return n1;
}

remove_spaces = function(s){
	var prev_length = s.length;
	while(true){
		s = s.replace(" ", "");
		if(s.length == prev_length){break;}
		prev_length = s.length;
	} 
}

//takes a PL_string and returns a corresponding node-skeleton;
//All statements should be enclosed in parenthesis
//use "!" for negation, "&" for and, "||" for or, and "->" for implication
//Only use alpha-numberic characters and "_" for variable names
PL_Node.PL_to_EG = function(s){
 remove_spaces(s);
 var n = populate_parents(PL_to_EG.parse(s));
 n = PL_Node.Distribute_Nots(n);
 n = PL_Node.Shift_Ands(n);
 var new_node = Node.NodeSkeleton();
 new_node.subtrees.push(Node.NodeSkeleton());
 new_node.subtrees[0].absorb_graph(PL_Node.handle_Ors(n));
 new_node.remove_DN();
 return new_node;
}

