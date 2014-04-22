# Peirce Logic Code Guide

#### Updates: 
* Feb 5th 2014, Bharath Santosh: Initial code guide after the major refactor of the Peirce Logic application

## Front-End Application

Most of the files associated with the front end can be found in appengine/{
[js](https://github.com/CurryBoy/Peirce-Logic/tree/master/appengine/js),
[templates](https://github.com/CurryBoy/Peirce-Logic/tree/master/appengine/templates),
[css](https://github.com/CurryBoy/Peirce-Logic/tree/master/appengine/css)}, the bulk of it being in the javascript files.

### [Peirce.js](https://github.com/CurryBoy/Peirce-Logic/blob/master/appengine/js/Peirce.js)

The starting point of the application is in [Peirce.js](https://github.com/CurryBoy/Peirce-Logic/blob/master/appengine/js/Peirce.js).
Here global constants are setup along with central gui elements and the proof engine. 
One important structure is the Rapahel paper structure that allows for UI; it is seeded into many places.
Another important event is loading saved temporary proofs from sessionStorage and also setting up saving future temporary proofs.

### [js/node](https://github.com/CurryBoy/Peirce-Logic/tree/master/appengine/js/node)

The visual graph is represented a tree found in [node.js](https://github.com/CurryBoy/Peirce-Logic/blob/master/appengine/js/node/node.js). 
It is a simple struct which has separate lists for holding subtrees(cuts) and leaves(variables). 
Leaves have the property of not having any subtrees or leaves.

Each node is also assigned an id by its parent such that each node in the tree has a unique id when reducing ids from the node to the root. 
Nodes also have an attribute system that is meant to hold meta-data. 

###### Notable Node Functions
* getLevel() -> int : Recursivley calculate depth of node as path length from root
* equals(Node) -> bool : Check if two nodes are equal through simple checks or through labeled tree isomorphism(found in node_equivalence.js)
* isLeaf() -> bool: Check if node is a leaf by property checks and verifing leaf is in parent's leaves
* getIdentifier() -> string: Recursivley compose ids up to root to generate a unique tree identifier
* addSubtree([Node])/addLeaf([Node]) -> Node : Adding a new or existing node into the current node. See also 'take' variations which steal children from other nodes
* preOrderFMap(func) : Apply function in a pre-order traversal through the tree
* getChildByIdentifier(string) -> Node : Search for node matching id in decendants in tree. Note should be used on root due to ids being generated from root

### [js/proof](https://github.com/CurryBoy/Peirce-Logic/tree/master/appengine/js/proof), [js/inference_rules](https://github.com/CurryBoy/Peirce-Logic/tree/master/appengine/js/inference_rules)

The proof is a container over a tree of proof nodes. 
A proof node acts as a step in the proof. 
Many different steps can be taken from one step and that is why its a tree structure. 
The proof node contains core information about the step used in the proof engine. 
It also constructs the visual ui for the existenal graph based on its step's node tree.

###### Modes
The proof has major modes in which certain inference rules are allowed:

* Goal Mode : Initial mode when the the proof starts. Used to construct end goal that needs to be reached
    * All of the construction inference rules are allowed
* Premise Mode : After goal mode, premise mode is used to construct the graph used as the premises' for the proof
    * All of the construction inference rules are allowed
    * __TODO__ Add allowing for automated proof checking to see if premises can lead to goal
* Proof Mode : After premise mode, used to actually execute inference rules that would generate a valid existential graphs proof
    * The four core inference rules(double cut, erasure, insertion, iteration/deiteration) and their varitions are allowed
* Insertion Mode : Used interlaced in Proof Mode when an insertion rule needs to take place. The cut in which new sub-graphs are constructed is clamped and frozen. Then construction rules can be used when in accordance to frozen insertion subtree.
    * All of the construction inference rules decorated with an insertion validator are allowed
    * Some rules require customized insertion validators

##### [Inference Rules](https://github.com/CurryBoy/Peirce-Logic/blob/master/appengine/js/inference_rules/inference_rules.js)
An inference rule is just a structure made of three core functions:

* valid(Node, List{Node}) -> bool
    * A validator that takes in an input tree and selected nodes and verifies the rule can be used on the nodes in the given context of the tree
* applyRule(Node, List{Node}, [{string:any}]) -> {tree: Node, diff: Diff, [params: {string:any}]}
    * A rule applicator that takes in an input tree and selected nodes along with optional params and executes all changes of the rule on the nodes and tree on the precondition that it is valid to do so according to the validator.
    * A Diff is constructed on all changes done in the application. A diff is just a structure of three arrays: additions{string}, deletions{string}, changes{Array{string,string}}. All respective changes' ids are placed into the appropriate arrays. 
    * Note diff.changes are stored as an array of 2-tuples of previousID and newID. This is used in cases when nodes are moved within the tree
    * An modified set of params can be returned if any new settings need to be stored for the rule application, see inference_rules/Variable.js for an example
* applyVisual(Node, List{Node}, Diff, attrs) -> {attrs: attrs,  [params: {string:any}]}
    * A visual applicator that takes the information found in the diff and manipulates the attrs for some visual design purpose
    * Attrs are just dicts of ids to an a filtered attrs object from a Raphael element
	* The input attrs have already be adjusted from initializing attr additions, deleting attr deletions, and shifting attr change from the Diff
	* A modified set of params can be returned if any new settings need to be stored for the visual application

The main inference rules used in Peirce Logic can be found in the following files under inference\_rules:
[cuts.js](https://github.com/CurryBoy/Peirce-Logic/blob/master/appengine/js/inference_rules/cuts.js),
[variable.js](https://github.com/CurryBoy/Peirce-Logic/blob/master/appengine/js/inference_rules/variable.js),
[erasure.js](https://github.com/CurryBoy/Peirce-Logic/blob/master/appengine/js/inference_rules/erasure.js),
[insertion.js](https://github.com/CurryBoy/Peirce-Logic/blob/master/appengine/js/inference_rules/insertion.js),
[iteration.js](https://github.com/CurryBoy/Peirce-Logic/blob/master/appengine/js/inference_rules/iteration.js). 
Helper utilies are found under [inference\_rules/rule\_helpers.js](https://github.com/CurryBoy/Peirce-Logic/blob/master/appengine/js/inference_rules/rules_helper.js) and 
[inference\_rules/ui_helpers.js](https://github.com/CurryBoy/Peirce-Logic/blob/master/appengine/js/inference_rules/ui_helpers.js).

__TODO__ Move the PL to EG rule into new inference rule format.

__TODO__ Add descriptors to inference rule struct, and visualize them.

###### Mode Bookends
Each mode is required to have two inference rules; a start mode rule and a end mode rule. 
See [proof/proof.js](https://github.com/CurryBoy/Peirce-Logic/blob/master/appengine/js/proof/proof.js) Proof.MODE\_BOOKENDS for examples. 
Helper rules for these bookends can be found in [inference\_rules.js](https://github.com/CurryBoy/Peirce-Logic/blob/master/appengine/js/inference_rules/inference_rules.js).

###### Notable Proof Functions
* Reset() : Set proof into a new clear state
* Begin() : Set a first node in proof
* SaveProof() -> string : Serialize the proof into a json blob; found in [proof/save_load_proof.js](https://github.com/CurryBoy/Peirce-Logic/blob/master/appengine/js/proof/save\_load\_proof.js)
* LoadProof(string) : Deserialize a proof from a json blob, automatically moves to last selected state; found in [proof/save\_load\_proof.js](https://github.com/CurryBoy/Peirce-Logic/blob/master/appengine/js/proof/save_load_proof.js)
* inferenceRules(string) -> {string: InferenceRule} : Get all inference rules avaible for input mode, a helper getCurrentInferenceRules exists to give all rules for current mode
* useRuleOnStep(string, List{Node}, {string: any}, {string: any}, ProofNode) -> Given rule name, selected nodes, rule params, visual params, and a proof node apply the rule in accordance to the rule name off of the input rule node
    * This also automatically handles ending and starting bookends when needed
    * The returned proof node is the last node after all relavent reactionary rules to input rule
    * See also useRuleOnCurrentStep which automaically updates the current rule node
	* See also endCurrentProofMode which ends the current proof mode and starts the next
* select(ProofNode) : Swap curent node with input node, automatically taking down visuals and bringing up input node's visuals

###### Proof Reactors
Functions can be added as reactors to events in the proof through the function Proof.addReactor(event name:string, reactor: func(Proof)). This allows for adding listeners for various changes in the proof. Main reactors used are in [proof/proof\_ui\_reactors.js](https://github.com/CurryBoy/Peirce-Logic/blob/master/appengine/js/proof/proof_ui_reactors.js).

Proof Events:
* CHANGE_MODE : The proof's current mode changes
* ADD_NODE : A node is added to the proof
* SELECT_NODE : The proof's current node has changed
* NEXT_NODE : The next node has been selected
* PREVIOUS_NODE : The previous node has been selected

### [js/ui](https://github.com/CurryBoy/Peirce-Logic/tree/master/appengine/js/ui)

The visuals for the existental graph are created in the class UINodeTree in [uinode.js](https://github.com/CurryBoy/Peirce-Logic/blob/master/appengine/js/ui/uinode.js). 
It generates the ui for subtrees and leaves based on input classes that derive from a UINode. 
A UINode is an abstract class that handles all core interactions with Raphael of an input node. 
The UINodeTree itself stores an internal node id to UINode map which is avaiable for all UINodes for tree lookup. 
The UINode is cseen as lifting the Node class into a visual space. It also handles the interface with the context menu.

###### UINode abstract functions:
* createShape() : Construct the Raphael element for uinode
* updateShape() : Fix shape due to changes to inner node
* defaultAttr() -> attrs : The default Raphael attrs for uinode's shape, can change based on properties of input node
* setSelected(bool) : Change shape to portray being chosen
* getMousePoint(event) -> {x: float, y: float} : Get the x,y point on the raphael paper of where the mouse hit the uinode's shape
* dragStart() : Initialize dragging state
* dragMove(float, float) : Move uinode by a delta x and y
* dragEnd() : Clear dragging state

###### [Level](https://github.com/CurryBoy/Peirce-Logic/blob/master/appengine/js/ui/level.js)
The UINode subclass that represents subtrees in a Node tree with rounded rectangles representing cuts. 
The root node or sheet of assertion is handled as a distinct Level with separated visual attributes. 
Levels that have a node at an even depth(or level) are filled darker to dignify all nodes inside the level are at an odd depth. 
A Level's shape is updated using the the envelopChildren function which fits the level's children's shape's bounding boxes.

###### [Variable](https://github.com/CurryBoy/Peirce-Logic/blob/master/appengine/js/ui/variable.js)
The UINode subclass that represents leaves in a Node tree with Raphael text representing variables in existential graphs. 

###### Collision
The Level and Variable classes use collision detection on dragging. 
Collision detection is done through the internal function collisionDelta(originalX: float, originalY: float, deltaX: float, deltaY: float) -> {x: float, y: float} that outputs a thresholded deltaX and deltaY that stops collisions. 
These include collisions with the global boundary, other adjacent child nodes, and recursivily stopping collisions in the parent.

__TODO__ Evaluate performance and profile collision detection

__TODO__ Try collision detection that shifts other nodes around instead of freezing other nodes

### [js/gui](https://github.com/CurryBoy/Peirce-Logic/tree/master/appengine/js/gui)
The gui javascript files contain core classes that represent various GUI elements.

###### [Context Menu](https://github.com/CurryBoy/Peirce-Logic/blob/master/appengine/js/gui/context_menu.js)
The ContextHandler is responsible for creating context menus for actions based on using inference rules on selected rules. See UINode.click() for use with context menu.

###### [Minimap](https://github.com/CurryBoy/Peirce-Logic/blob/master/appengine/js/gui/minimap.js)
The Minimap allows for panning across the main plane. It controllers the main Raphael paper's viewbox. It also re-renders the view window on window resizing.

###### [Timeline](https://github.com/CurryBoy/Peirce-Logic/blob/master/appengine/js/gui/branches.js)
The Timeline for rendering the proof tree is done through a branches plugin.

###### [Tour](https://github.com/CurryBoy/Peirce-Logic/blob/master/appengine/js/gui/tour.js)
The tour for the app is defined in [gui/tour.js](https://github.com/CurryBoy/Peirce-Logic/blob/master/appengine/js/gui/tour.js).

__TODO__ Allow for trimming off branches off of timeline.

### [js/utils](https://github.com/CurryBoy/Peirce-Logic/tree/master/appengine/js/utils)

###### [list.js](https://github.com/CurryBoy/Peirce-Logic/blob/master/appengine/js/utils/list.js)
Custom list data structure used throughout system. See file for methods.

## Google App Engine
#### __TODO__

