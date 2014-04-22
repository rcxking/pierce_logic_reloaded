function populate_parents(node){
  if(node.LNode != undefined){
    node.LNode.parent = node;
    populate_parents(node.LNode);
  }
  if(node.RNode != undefined){
    node.RNode.parent = node;
    populate_parents(node.RNode);
  }

  return node;
}