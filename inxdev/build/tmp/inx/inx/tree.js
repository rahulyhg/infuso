// @include inx.panel,inx.textfield

inx.css(".inx-tree-node {cursor:pointer;}",".inx-tree-node .selected{background:#eaeaea}",".inx-tree-node .selected{background:#eaeaea}",".inx-tree-arrow {width:20px,height:16px;position:absolute;margin-top:3px;}",".inx-focused .inx-tree-node .selected{background:#d9e8fb}");inx.tree=inx.panel.extend({constructor:function(p){if(!p.data)p.data=[];if(typeof(p.root)=="string")p.root={text:p.root};if(!p.root)p.root={};p.root.parent="xca0opez7fl2np56qm1b";p.root.depth=0;p.root.id=0;p.root.text=p.root.text||"/";p.root.expanded=true;p.data.unshift(p.root);if(p.showRoot===undefined)p.showRoot=true;if(!p.listeners)p.listeners={};if(p.onselect)p.listeners.select=p.onselect;if(p.onclick)p.listeners.click=p.onclick;this.base(p);this.heap={};this.selection={};this.private_expandedNodes={};},cmd_render:function(c){this.base(c);if(this.data)
for(var i=0;i<this.data.length;i++)
this.cmd("addNode",this.data[i]);if(this.loader)this.cmd("load",0);this.__body.addClass("inx-unselectable");inx.storage.onready(this,"restoreExpanded");},cmd_updateNode:function(id,obj){var node=this.info("node",id);if(!node)return;for(var i in obj)
node[i]=obj[i];this.private_updateNode(id);},info_node:function(id){return this.heap[id];},info_children:function(id){var node=this.heap[id];if(!node)return[];var ret=[];for(var i=0;i<node.children.length;i++)
ret.push(node.children[i].id);return ret;},info_siblings:function(id){var node=this.info("node",id);if(!node)return[];var parent=node.parent;return this.info("children",parent);},cmd_load:function(id){if(!this.loader){inx.msg("inx.tree loader is null",1);return;}
this.loader.id=id;this.fire("beforeload",this.loader);this.loadingNodes++;this.call(this.loader,[this.id(),"handleNodeLoad"],null,{nodeID:id});this.cmd("updateNode",id,{loading:true});},cmd_handleNodeLoad:function(data,meta){this.loadingNodes--;var parent=meta.nodeID;if(!parent)parent=0;this.cmd("updateNode",parent,{loading:false,loaded:true});var children=this.info("children",parent);this.remove_node(children);for(var i=0;i<data.length;i++){data[i].parent=parent;this.cmd("addNode",data[i]);if(this.private_expandedFromStorage)
if(this.private_expandedFromStorage[data[i].id])this.cmd("expand",data[i].id);}
this.cmd("expand",parent,false,true);this.cmd("updateNode",parent,{folder:false})
this.fire("load",parent,data,meta);},private_updateNode:function(id){if(!this.nodes_to_update)
this.nodes_to_update=[];this.nodes_to_update.push(id);this.task("updateNodes");},cmd_updateNodes:function(){this.task("resizeToContents");var nodes=this.nodes_to_update;this.nodes_to_update=null;for(var n=0;n<nodes.length;n++){var node=this.heap[nodes[n]];if(!node)continue;if(!node.el)this.private_createNodeElement(node);if(!node.__childrenRendered&&node.expanded){for(var i=0;i<node.children.length;i++)
this.private_updateNode(node.children[i].id);node.__childrenRendered=true;}
this.private_renderNode(node);}},private_createNodeElement:function(node){node.el=$("<div>").addClass("inx-tree-node");node.el.data("id",node.id);node.collapser=$("<img>").addClass("inx-tree-arrow").appendTo(node.el);node.body=$("<div>").css("padding","2px 0px 2px 0px").appendTo(node.el);var depth=(1+node.depth+(this.showRoot?0:-1))*20;if(depth<0)depth=0;node.body.css({paddingLeft:depth});node.collapser.css({left:depth-22});if(node.id==0&&!this.showRoot)
node.body.hide();if(node.parent==="xca0opez7fl2np56qm1b")
node.el.appendTo(this.__body);else{var parent=this.info("node",node.parent);var c=parent.childrenContainer;if(!c){c=$("<div>").appendTo(parent.el);parent.childrenContainer=c;this.private_updateNode(node.parent);}
node.el.appendTo(c);}},private_renderNode:function(node){if(node.selected)node.body.addClass("selected")
else node.body.removeClass("selected");if(node.childrenContainer)
node.childrenContainer.css({display:node.expanded?"block":"none"});node.body.html(node.text+"");var icon=inx.img(node.icon);if(icon){$("<img>").prependTo(node.body).attr({align:"absmiddle"}).css({marginRight:4}).attr("src",icon);}
var arrow="noarrow";if((node.children&&node.children.length)||node.folder)
arrow=node.expanded?"minus":"plus";var img=inx.conf.url+"/inx/tree/"+arrow+".gif";node.collapser.attr("src",img);},cmd_expand:function(nodes,no){if(typeof(nodes)!="array")nodes=[nodes];for(var i=0;i<nodes.length;i++){var node=this.heap[nodes[i]];if(node){if(!node.expanded){this.fire("expand",node.id);}
node.expanded=!no;if(node.expanded)this.private_expandedNodes[node.id]=true;else delete this.private_expandedNodes[node.id];this.task("storeExpanded");if(node.folder&&!node.loaded&&!node.loading)
this.cmd("load",node.id);this.private_updateNode(node.id);}}},cmd_collapse:function(nodes){this.cmd("expand",nodes,true);},cmd_toggleCollapse:function(id){var node=this.heap[id];if(!node)return;node.expanded?this.cmd("collapse",id):this.cmd("expand",id);},private_addToHeap:function(node){if(!node)return null;if(node.id===undefined)node.id=inx.id();if(this.info("node",node.id)){inx.msg("Такая нода уже есть "+node.id);return null;}
var parent=this.info("node",node.parent);node.depth=parent?parent.depth+1:0;this.heap[node.id]=node;if(!node.children)node.children=[];else for(var i=0;i<node.children.length;i++){node.children[i].parent=node.id;this.private_addToHeap(node.children[i]);}
return node.id;},remove_from_heap:function(id){for(var i=0;i<id.length;i++){var node=this.heap[id[i]];if(node)
for(var j=0;j<node.children.length;j++)
this.remove_from_heap([node.children[j].id]);delete this.heap[id[i]];delete this.selection[id[i]];delete this.private_expandedNodes[id[i]];}},cmd_select:function(selection){if(typeof(selection)!="array")selection=[selection];var tmp={};for(var i=0;i<selection.length;i++)
tmp[selection[i]]=1;for(var i in this.selection)
tmp[i]--;changed=false;for(var i in tmp)
if(tmp[i])
changed=true;if(!changed)return;for(var i in this.selection){var node=this.heap[i];node.selected=false;this.private_updateNode(node.id);delete this.selection[i];}
for(var i=0;i<selection.length;i++){var node=this.heap[selection[i]];if(node){node.selected=true;this.private_updateNode(node.id);this.selection[selection[i]]=true;this.cmd("expand",node.parent);}}
this.cmd("scrollToSelection");this.fire("selectionchange",this.info("selection"));},info_selection:function(){var ret=[];for(var i in this.selection)ret.push(i);return ret;},cmd_selectUp:function(){var sel=this.info("selection")[0];var siblings=this.info("siblings",sel);var last;for(var i=0;i<siblings.length;i++){if(siblings[i]==sel)break;last=siblings[i];}
if(last){sel=last;while(1){var node=this.info("node",sel);if(!node)break;if(!node.expanded)break;var siblings=this.info("children",sel);if(!siblings.length)break;var last=siblings[siblings.length-1];sel=last;}
this.cmd("select",sel);}else{var node=this.info("node",sel);if(node){var parent=node.parent;if(parent!="xca0opez7fl2np56qm1b")
this.cmd("select",parent);}}},cmd_selectDown:function(){var sel=this.info("selection")[0];var node=this.info("node",sel);if(!node)return;if(node.expanded){var children=this.info("children",sel);if(children.length){var last=children[0];this.cmd("select",last);}
return;}
var siblings=this.info("siblings",sel);var last;for(var i=siblings.length-1;i>0;i--){if(siblings[i]==sel)break;last=siblings[i];}
if(last){this.cmd("select",last);}else{inx.msg("Косяка! я недоделал :)",1);}},cmd_scrollToSelection:function(){var sel=this.info("selection")[0];if(!sel)return;var node=this.info("node",sel);if(!node)return;if(!node.body)return;inx.core.scrollTo(node.body);},cmd_addNode:function(node,recursive){if(!node.parent)node.parent=0;var id=this.private_addToHeap(node);if(id===null)return;var parent=this.info("node",node.parent);if(node.parent!="xca0opez7fl2np56qm1b"){parent.children.push(node);node.depth=parent.depth+1;}else{node.depth=0;}
this.private_updateNode(id);},remove_node:function(nodes){if(typeof(nodes)!="object")
nodes=[nodes];var node;for(var i=0;i<nodes.length;i++){if(node=this.heap[nodes[i]]){node.el.remove();var parent=this.heap[node.parent];if(parent)
for(var j=0;j<parent.children.length;j++)
if(parent.children[j].id==node.id){parent.children.splice(j,1);this.private_updateNode(parent.id);}}}
this.remove_from_heap(nodes);},cmd_dblclick:function(e){clearTimeout(this.private_editTimeout);this.private_lastClickNode=null;var node=this.private_domToNodeObject(e.target);if(!node)return;if(this.fire("dblclick",node.id)!==false)
this.cmd("toggleCollapse",node.id);return false;},cmd_mousedown:function(e){var node=this.private_domToNodeObject(e.target);var arrow=$(e.target).filter(".inx-tree-arrow").length;if(arrow){this.cmd("toggleCollapse",node.id);return;}
if(!node)return;var time=new Date().getTime();var d=time-this.private_lastClickTime;if(d<1500&node.id==this.private_lastClickNode){var id=this.id();clearTimeout(this.private_editTimeout);this.private_editTimeout=setTimeout(function(){inx(id).cmd("editNode",node.id);},600);}
this.private_lastClickTime=time;this.private_lastClickNode=node.id;this.cmd("select",node.id);this.fire("click",node.id);},private_domToNodeObject:function(el){var id=$(el).parents(".inx-tree-node").eq(0).data("id");return this.info("node",id);},cmd_keydown:function(e){switch(e.keyCode){case 113:var sel=this.info("selection")[0];if(sel!==undefined)
this.cmd("editNode",sel);return false;case 38:this.cmd("selectUp");return false;case 40:this.cmd("selectDown");return false;case 39:var sel=this.info("selection")[0];this.cmd("expand",sel);break;case 37:var sel=this.info("selection")[0];this.cmd("collapse",sel);break;case 13:var sel=this.info("selection")[0];if(sel){this.fire("click",sel);this.fire("dblclick",sel);}
break;}},info_path:function(id,separator){if(!separator)separator="/";var node=this.info("node",id);var path=[];while(node){if(node.id!=0)
path.unshift(node.text);node=this.info("node",node.parent);}
return path.join(separator);},info_debug:function(){var ret="";var n=0;for(var i in this.heap)n++;ret+="heap:"+n+"<br/>";n=0;for(var i in this.private_expandedNodes)n++;ret+="expanded:"+n;return ret;},cmd_editNode:function(id){var node=this.info("node",id);if(!node)return;if(!node.editable)return;var el=node.body;if(!el)return;var pos=el.offset();this.cmd("showNodeEditor",id,node,pos.left+20,pos.top);},cmd_showNodeEditor:function(id,node,x,y){this.cmd("closeEditor");var e=$("<div>").appendTo("body");e.css({position:"absolute",left:x,top:y,zIndex:1000});var editor=inx({type:"inx.textfield"});var editorID=editor.id();editor.cmd("render",e).cmd("setValue",node.text).on("blur",function(){inx(editorID).cmd("destroy");e.remove()}).on("submit",[this.id(),"handleEditorData"]);editor.task("focus").task("select");this.editor=editor;this.private_editorContainer=e;this.private_editNode=node;},cmd_closeEditor:function(){if(!this.editor)return;this.editor.cmd("destroy");this.private_editorContainer.remove();},cmd_handleEditorData:function(){if(!this.editor)return;var val=this.editor.info("value");var old=this.private_editNode.text;this.cmd("closeEditor");this.cmd("focus");if(val==old)return;this.cmd("updateNode",this.private_editNode.id,{text:val});this.fire("editComplete",this.private_editNode.id,val,old);},info_expandedNodes:function(parent,ret){if(!parent)parent=0;if(!ret)ret=[0];var c=this.info("children",parent);for(var i in c){var node=this.info("node",c[i]);if(node.expanded){ret.push(node.id);this.info("expandedNodes",node.id,ret);}}
return ret;},cmd_storeExpanded:function(){if(!this.keepExpanded)return;if(inx(this).data("currentRequests"))return;inx.storage.set(this.keepExpanded,this.private_expandedNodes);},cmd_restoreExpanded:function(){if(!this.keepExpanded)return;var exp=inx.storage.get(this.keepExpanded)||{};this.private_expandedFromStorage=exp;for(var i in exp)
this.cmd("expand",i);}});