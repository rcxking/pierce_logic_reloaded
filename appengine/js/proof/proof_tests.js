var N1 = new Node();
var A = new Node(N1);
N1.subtrees.push_back(A);
A.leaves.push_back({text:"a"});
N1.leaves.push_back({text:"b"});


//C (A (B) (C))
var N1 = new Node();
N1.leaves.push_back({text:"C"});
var N2 = new Node(N1);
N1.subtrees.push_back(N2);
N2.leaves.push_back({text:"A"});
N2.subtrees.push_back(new Node(N2));
N2.subtrees.begin().val.leaves.push_back({text:"B"});
N2.subtrees.push_front(new Node(N2));
N2.subtrees.begin().val.leaves.push_back({text:"C"});
var N3 = Node.node_to_node_skeleton(N1);


//( (A (B) C) (B) )
var N1 = Node.NodeSkeleton();
N1.subtrees.push(Node.NodeSkeleton());
N1.subtrees[0].add_lit("B",false);
N1.subtrees[0].add_lit("A",false);
N1.subtrees[0].subtrees[1].add_lit("C",true);
N1.subtrees[0].subtrees[1].add_lit("B",false);

// A (B) (C)
var N1 = Node.NodeSkeleton();
N1.add_lit("A", true);
N1.add_lit("B", false);
N1.add_lit("C", false);

//(U V (W))
var N1 = Node.NodeSkeleton();
N1.add_lit("U",true);
N1.subtrees[0].add_lit("V",true);
N1.subtrees[0].add_lit("W", false);

// ((A B (C))) ((D ((E)))), tests double-cut remover
var N1 = Node.NodeSkeleton();
N1.subtrees.push(Node.NodeSkeleton());
N1.subtrees[0].subtrees.push(Node.NodeSkeleton());
N1.subtrees[0].subtrees[0].add_lit("A",true);
N1.subtrees[0].subtrees[0].add_lit("B",true);
N1.subtrees[0].subtrees[0].add_lit("C",false);
N1.subtrees.push(Node.NodeSkeleton());
N1.subtrees[1].add_lit("D",false);
N1.subtrees[1].subtrees[0].subtrees.push(Node.NodeSkeleton());
N1.subtrees[1].subtrees[0].subtrees[0].add_lit("E",false);




//(Q or R, not R) implies Q
var N1 = Node.NodeSkeleton();
N1.subtrees.push(Node.NodeSkeleton());
N1.subtrees[0].add_lit("Q",false);
N1.subtrees[0].add_lit("R",false);
N1.add_lit("R", false);
var N2 = Node.NodeSkeleton();
N2.add_lit("Q",true);
Node.ProofExists(N1,N2);

//(U (V))((U) V)(U)(V)
var N1 = Node.NodeSkeleton();
N1.add_lit("U",false);
N1.subtrees[0].add_lit("V",false);
N1.add_lit("V",false);
N1.subtrees[1].add_lit("U",false);
N1.add_lit("U",false);
N1.add_lit("V",false);

//Modus Ponens
//(P (Q)) P
var N1 = Node.NodeSkeleton();
N1.add_lit("P", false);
N1.subtrees[0].add_lit("Q",false);
N1.add_lit("P",true);
//Q
var N2 = Node.NodeSkeleton();
N2.add_lit("Q", true);

//Modus Tollens
var N1 = Node.NodeSkeleton();
N1.add_lit("P", false);
N1.subtrees[0].add_lit("Q",false);
N1.add_lit("Q",false);
var N2 = Node.NodeSkeleton();
N2.add_lit("P", false);

//[(P->Q)->R] then [(P^Q)->R]EMPTY VARIABLE


var N1 = Node.NodeSkeleton();
N1.add_lit("P", false);
N1.subtrees[0].add_lit("Q",false);
var N2 = Node.NodeSkeleton();
N2.subtrees.push(Node.NodeSkeleton());
N2.subtrees[0].add_lit("R",false);
var N3 = N2.duplicate();
N2.subtrees[0].absorb_graph(N1);
N3.subtrees[0].add_lit("P",true);
N3.subtrees[0].add_lit("Q",true);

//P->Q and Q, then P (INCORRECT)
var N1 = Node.NodeSkeleton();
N1.add_lit("P", false);
N1.subtrees[0].add_lit("Q",false);
N1.add_lit("Q",true);
var N2 = Node.NodeSkeleton();
N2.add_lit("P", true);

//(U V (W)) (U (W)) (W (U)) V
var N1 = Node.NodeSkeleton();
N1.add_lit("U", false);
N1.add_lit("U",false);
N1.add_lit("W", false);
N1.add_lit("V", true);
N1.subtrees[0].add_lit("V",true);
N1.subtrees[0].add_lit("W",false);
N1.subtrees[1].add_lit("W",false);
N1.subtrees[2].add_lit("U",false);

//P (P) therefore Q
var N1 = Node.NodeSkeleton();
N1.add_lit("P",false);
N1.add_lit("P",true);
var N2 = Node.NodeSkeleton();
N2.add_lit("Q",true);

// NOTHING  therefore P or (P)
var N1 = Node.NodeSkeleton();
var N2 = Node.NodeSkeleton();
N2.add_lit("P",false);
N2.subtrees[0].add_lit("P",false);
ProofExists(N1,N2);

//() -> ()
var N1 = Node.NodeSkeleton();
N1.subtrees.push(Node.NodeSkeleton());
var N2 = Node.NodeSkeleton();
N2.subtrees.push(Node.NodeSkeleton());


//
var N2 = Node.NodeSkeleton();
N2.add_lit("P",false);
N2.subtrees[0].add_lit("Q",false);
N2.add_lit("Q",false);
N2.subtrees[1].add_lit("P",false);
