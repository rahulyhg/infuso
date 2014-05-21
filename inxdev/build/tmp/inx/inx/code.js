// @include inx.panel,inx.form,inx.dialog,inx.layout.absolute,inx.textfield

inx.css(".inx-code-container {position:absolute;min-width:100%;}",".inx-code-container div{white-space:nowrap;margin-left:50px;height:18px;font-size:14px;font-family:Courier New,monospace;cursor:text;}",".inx-code-string {font-weight:bold;color:brown}",".inx-code-digit {color:blue}",".inx-code-comment {color:gray;font-style:italic;}",".inx-code-variable {color:blue;font-weight:bold;}",".inx-code-keyword {font-weight:bold;}",".inx-code-container .selected, .inx-code-container .selected * {background:#0a246a;color:white;}",".inx-code-lineNumbers {background:#ededed;width:45px;position:absolute;border-right:1px dotted gray;overflow:hidden;}",".inx-code-lineNumbers div{height:16px;padding-top:2px;text-align:right;font-size:11px;color:gray;}");inx.code=inx.panel.extend({constructor:function(p){if(!p.height)p.height=200;this.base(p);if(!this.value)this.value="";this.lines=[];this.private_lineHeight=18;this.private_letterWidth=8;this.private_selectionStart={line:0,symbol:0};this.private_selectionEnd={line:0,symbol:0};this.private_renderedLineNumbers=0;this.parser=inx({type:"inx.code.parser",editor:this,lang:this.lang});this.spaceStr="";for(var i=0;i<100;i++)this.spaceStr+="          ";inx.storage.onready(this.id(),"none");},cmd_destroy:function(){this.parser.cmd("destroy");this.base();},cmd_render:function(c){this.base(c);var id=this.id();this.__body.scroll(function(e){inx(id).cmd("handleScroll",e);});this.lineNumbers=$("<div>").css({cursor:"text"}).appendTo(this.el).addClass("inx-code-lineNumbers");this.lineNumbersRoller=$("<div>").appendTo(this.lineNumbers).css({width:40,position:"absolute",left:0,top:0});this.codeContainer=$("<div>").appendTo(this.__body).addClass("inx-unselectable").addClass("inx-code-container");var ruler=$("<div style='float:left'>").html("M").appendTo(this.codeContainer);ruler.remove();inx.dd.enable(this.lineNumbers,this,"test");inx.dd.enable(this.__body,this,"test");this.cursor=$("<div>").css({height:this.private_lineHeight,width:2,position:"absolute",background:"black"}).appendTo(this.__body);this.cmd("setValue",this.value);inx.hotkey("ctrl+f",this.id(),"showSearchDlg");inx.hotkey("f3",this.id(),"search");inx.hotkey("esc",this.id(),"focus");},cmd_handleScroll:function(e){this.cmd_updateCodeDelayed();this.parser.cmd("scrollChanged");this.cmd("updateLineNumbers");},cmd_updateLineNumbers:function(){var visible=this.info("visibleLines").bottom;for(var i=this.private_renderedLineNumbers;i<visible;i++){$("<div>").html(i+1).appendTo(this.lineNumbersRoller);}
this.private_renderedLineNumbers=i;this.lineNumbersRoller.css({top:-this.__body.scrollTop()});},cmd_test:function(p){var x=p.event.pageX-this.__body.offset().left;var y=p.event.pageY-this.__body.offset().top;if(p.phase=="start"){if(x>=this.__body.attr("clientWidth"))return false;if(y>=this.__body.attr("clientHeight"))return false;}
x+=this.__body.get(0).scrollLeft;y+=this.__body.get(0).scrollTop;var carret=this.coordsToCarret(x,y);if(p.phase=="start")
this.cmd("select",!p.shiftKey?carret:null,carret);this.cmd("select",null,carret);},info_line:function(line){var line=this.lines[line];if(line)return line.code+"";return"";},cmd_insertLine:function(before,code){var el=document.createElement("div");if(before==this.lines.length)
this.codeContainer.get(0).appendChild(el);else{if(before<this.lines.length){var b=this.lines[before].el;this.codeContainer.get(0).insertBefore(el,b);}else{inx.msg("!!!",1);return;}}
var line={code:code,el:el,clean:{}}
this.lines.splice(before,0,line);this.task("updateCode");this.parser.cmd("lineChanged",before);},cmd_deleteLine:function(n){var line=this.lines[n];if(!line)return;line.el.parentNode.removeChild(line.el);this.lines.splice(n,1);this.task("updateCode");this.parser.cmd("lineChanged",n);},cmd_updateLine:function(n,p){var line=this.lines[n];if(!line)return;if(p.style!==undefined){line.style=p.style;line.clean.code=0;}
if(p.code!==undefined){line.code=p.code;line.clean.code=0;this.parser.cmd("lineChanged",n);}
this.task("updateCodeDelayed");},cmd_insert:function(r){this.cmd("cut");var sel=this.info("selection");var a=this.info("line",sel.end.line).substr(0,sel.end.symbol);var b=this.info("line",sel.end.line).substr(sel.end.symbol);var re=r.split("\n");var s=(re.length==1?a.length:0)+re[re.length-1].length;re[0]=a+re[0];re[re.length-1]+=b;this.cmd("updateLine",sel.end.line,{code:re[0]});for(var i=1;i<re.length;i++)
this.cmd("insertLine",sel.end.line+i,re[i]);this.cmd("select",null,{line:sel.end.line+re.length-1,symbol:s});this.cmd("collapseToEnd");},cmd_cut:function(){var sel=this.info("selection");var s1=sel.start;var s2=sel.end;var a=this.info("line",s1.line).substr(0,s1.symbol);var b=this.info("line",s2.line).substr(s2.symbol);var d=s2.line-s1.line;for(var i=0;i<d;i++)
this.cmd("deleteLine",s1.line+1);this.cmd("updateLine",s1.line,{code:a+b});this.cmd("select",{line:s1.line,symbol:s1.symbol},{line:s1.line,symbol:s1.symbol});},cmd_setIdent:function(line,ident){var str=this.info("line",line).replace(/^[ ]*/,"");this.cmd("updateLine",line,{code:this.spaceStr.substr(0,ident)+str});},info_ident:function(line){var m=this.info("line",line).match(/^[ ]*/);return m?m[0].length:0;},cmd_syncLayout:function(){this.base();this.cmd("updateCodeDelayed");this.private_updateLineNumbers();},private_updateLineNumbers:function(){this.lineNumbers.css({top:this.__body.offset().top-this.el.offset().top,height:this.__body.get(0).clientHeight});this.cmd("updateLineNumbers");},cmd_updateCode:function(){var lines=this.info("visibleLines");for(var i=lines.top;i<=lines.bottom;i++)
this.private_updateLine(i);this.private_finalizeLineEnds();this.updateCodeTask=0;this.private_updateLineNumbers();},cmd_updateCodeDelayed:function(){if(!this.updateCodeTask){this.updateCodeTask=1;var id=this.id();setTimeout(function(){inx(id).cmd("updateCode")},50);}},private_updateLine:function(n){var line=this.lines[n];if(!line)return;if(!line.clean.code){var code=line.code;var klass="";var split=[];for(var i in line.style)split.push(i);split.push(code.length);split.sort(function(a,b){return a-b});var str=[];for(var s=0;s<split.length;s++){var from=split[s-1]||0;var length=split[s]-from;var substr=code.substr(from,length);klass=(line.style&&line.style[from])||klass;str.push("<span class='inx-code-"+klass+" inx-code-piece'>");str.push(this.private_escape(substr));str.push("</span>");}
line.el.innerHTML=str.join("");line.clean.code=1;}
var sel=this.info("selection");if(n>sel.start.line&&n<sel.end.line)
line.el.className="selected";else
line.el.className="";if(n==sel.start.line&&n==sel.end.line){if(!this.info("selectionCollapsed"))
this.private_renderLineEnd(n,sel.start.symbol,sel.end.symbol);}
else{if(n==sel.start.line)
this.private_renderLineEnd(n,sel.start.symbol,"auto");if(n==sel.end.line)
this.private_renderLineEnd(n,0,sel.end.symbol);}
if(!this.info("selectionCollapsed")){this.cursor.css({display:"none"});}else{var cursor=this.carretToCoords(sel.end.line,sel.end.symbol);this.cursor.css({display:"block",top:cursor.y,left:cursor.x});}},private_renderLineEnd:function(line,from,to){if(!this.private_lineEnd){this.private_lineEnd=[];for(var i=0;i<2;i++){this.private_lineEnd[i]=document.createElement("div");this.private_lineEnd[i].style.position="absolute";this.private_lineEnd[i].className="selected zz";this.codeContainer.get(0).appendChild(this.private_lineEnd[i]);}}
var n=this.private_currentLineEnd||0;this.private_lineEnd[n].style.top=line*this.private_lineHeight+"px";this.private_lineEnd[n].innerHTML=this.lines[line].el.innerHTML;from=from*this.private_letterWidth+"px";to=(to=="auto")?"auto":to*this.private_letterWidth+"px";this.private_lineEnd[n].style.clip="rect(auto "+to+" auto "+from+")";this.private_lineEnd[n].style.display="block";this.private_currentLineEnd=n+1;},private_finalizeLineEnds:function(){if(!this.private_lineEnd)return;for(var i=this.private_currentLineEnd;i<2;i++)
this.private_lineEnd[i].style.display="none";this.private_currentLineEnd=0;},cmd_select:function(start,end){if(start)this.private_selectionStart={line:start.line,symbol:start.symbol};if(end)this.private_selectionEnd={line:end.line,symbol:end.symbol};this.task("updateCode");this.task("scrollToCarret");},info_selection:function(noflip){var start=this.private_selectionStart;start={line:start.line,symbol:start.symbol};var end=this.private_selectionEnd;end={line:end.line,symbol:end.symbol};if(!noflip){var flip=false;if(start.line>end.line)flip=true;if(start.line==end.line&start.symbol>end.symbol)flip=true;if(flip){var tmp=start;start=end;end=tmp;}}
this.private_updateSelectionEdge(start);this.private_updateSelectionEdge(end);return{start:start,end:end};},private_updateSelectionEdge:function(edge){if(edge.line<0)edge.line=0;if(edge.symbol<0)edge.symbol=0;if(edge.line>this.lines.length-1)edge.line=this.lines.length-1;var len=this.info("line",edge.line).length;if(edge.symbol>len)edge.symbol=len;},info_selectionCollapsed:function(){var sel=this.info("selection");if(sel.start.line!=sel.end.line)return false;if(sel.start.symbol!=sel.end.symbol)return false;return true;},cmd_moveSelectionFront:function(hold){var sel=this.info("selection",1).end;sel.symbol++;if(sel.symbol>this.info("line",sel.line).length&&sel.line<this.lines.length-1){sel.symbol=0;sel.line++;}
this.cmd("select",(hold?0:sel),sel)},cmd_moveSelectionBack:function(hold){var sel=this.info("selection",1).end;sel.symbol--;this.cmd("select",(hold?0:sel),sel)},cmd_moveSelectionTop:function(hold){var sel=this.info("selection",1).end;sel.line--;this.cmd("select",(hold?0:sel),sel)},cmd_moveSelectionBottom:function(hold){var sel=this.info("selection",1).end;sel.line++;this.cmd("select",(hold?0:sel),sel)},cmd_moveSelectionHome:function(hold){var sel=this.info("selection",1).end;var ident=this.info("ident",sel.line);sel.symbol=sel.symbol==ident?0:ident;this.cmd("select",(hold?0:sel),sel)},cmd_moveSelectionEnd:function(hold){var sel=this.info("selection",1).end;sel.symbol=this.info("line",sel.line).length;this.cmd("select",(hold?0:sel),sel)},cmd_collapseToEnd:function(){var sel=this.info("selection",1);this.cmd("select",sel.end,sel.end);},info_selectedText:function(){var sel=this.info("selection");if(sel.start.line==sel.end.line){return this.info("line",sel.start.line).substr(sel.start.symbol,sel.end.symbol-sel.start.symbol);}else{var s1=sel.start;var s2=sel.end;var ret=[this.info("line",s1.line).substr(s1.symbol)];for(var i=s1.line+1;i<s2.line;i++)
ret.push(this.info("line",i));ret.push(this.info("line",s2.line).substr(0,s2.symbol));return ret.join("\n");}},cmd_selectAll:function(){if(!this.lines)return;if(!this.lines.length)return;this.cmd("select",{line:0,symbol:0},{line:this.lines.length-1,symbol:this.lines[this.lines.length-1].code.length});},info_visibleLines:function(){var l1=this.__body.get(0).scrollTop;var l2=l1+this.el.height();l1=Math.floor(l1/this.private_lineHeight);l2=Math.ceil(l2/this.private_lineHeight);return{top:l1,bottom:l2};},coordsToCarret:function(x,y){x-=50;var line=Math.floor(y/this.private_lineHeight);var symbol=Math.floor(x/this.private_letterWidth+0.5);return{line:line,symbol:symbol};},carretToCoords:function(line,symbol){var x=symbol*this.private_letterWidth+50;var y=line*this.private_lineHeight;return{x:x,y:y};},private_cleanText:function(str){str=str.replace(/\t/g,"    ").replace(/\r\n/g,"\n").replace(/\r/g,"\n");return str;},private_escape:function(str){str=str.replace(/&/gm,'&amp;').replace(/</gm,'&lt;').replace(/>/gm,'&gt;').replace(/ /gm,'&nbsp;');return str;},cmd_scrollToCarret:function(){var sel=this.info("selection",1).end;var coords=this.carretToCoords(sel.line,sel.symbol);var x=coords.x-this.__body.attr("scrollLeft")-60;if(x<0)this.__body.attr("scrollLeft",this.__body.attr("scrollLeft")+x);var width=this.__body.attr("clientWidth")-this.private_letterWidth-60;if(x>width)this.__body.attr("scrollLeft",this.__body.attr("scrollLeft")+x-width);var y=coords.y-this.__body.attr("scrollTop");if(y<0)this.__body.attr("scrollTop",this.__body.attr("scrollTop")+y);var height=this.__body.attr("clientHeight")-this.private_lineHeight;if(y>height)this.__body.attr("scrollTop",this.__body.attr("scrollTop")+y-height);},cmd_mousewheel:function(delta){if(this.cmd("scroll",delta<0?2:-2))
return false;},cmd_scroll:function(line){var s1=this.__body.attr("scrollTop");s2=Math.floor(s1/this.private_lineHeight)+line;s2*=this.private_lineHeight;this.__body.attr("scrollTop",s2);return s1!=this.__body.attr("scrollTop");},info_value:function(){var ret=[];for(var i in this.lines)
ret.push(this.lines[i].code);return ret.join("\n");},cmd_setValue:function(value){if(value===0)value="0";if(!value)value="";this.cmd("selectAll");this.cmd("cut");var code=this.private_cleanText(value+"").split("\n");for(var i=0;i<code.length;i++)
this.cmd_insertLine(i,code[i]);},info_debug:function(){var ret="";ret+="lines: "+this.lines.length+"<br/>";var sel=this.info("selection");ret+="selection: "+sel.start.line+":"+sel.end.line+" &mdash;";ret+=sel.end.line+":"+sel.end.symbol;return ret;}});window.copy=function(txt){var t=$("<textarea />").css({width:1,height:1,border:0,position:"absolute",left:0,top:0,color:"white"}).text(txt).appendTo("body").select().focus();setTimeout(function(){t.remove()},0);}
inx.code=inx.code.extend({private_cheatCopy:function(txt){txt+="";var t=$("<textarea>").css({width:1,height:1,position:"fixed",left:0,top:0,color:"white",border:"none"}).text(txt).appendTo("body").focus().select();setTimeout(function(){t.remove()},0);},cmd_keydown:function(e){switch(e.keyCode){case 88:if(!e.ctrlKey)return;this.private_cheatCopy(this.info("selectedText"));this.cmd("cut");return true;case 67:if(!e.ctrlKey)return;this.private_cheatCopy(this.info("selectedText"));return true;case 90:if(!e.ctrlKey)break;this.cmd("stepBack");return false;case 86:if(!e.ctrlKey)break;var textarea=$("<textarea />").css({position:"absolute",top:this.__body.get(0).scrollTop,opacity:0}).appendTo(this.__body);textarea.focus();var cmpid=this.id();setTimeout(function(){textarea.remove();var insert=textarea.attr("value");inx(cmpid).cmd("insert",insert);},0);break;case 65:if(!e.ctrlKey)break;this.cmd("select",{line:0,symbol:0},{line:this.lines.length-1,symbol:this.lines[this.lines.length-1].code.length});return false;case 8:if(this.info("selectionCollapsed"))
this.cmd("moveSelectionBack",true);this.cmd("cut");return false;case 46:if(this.info("selectionCollapsed"))
this.cmd("moveSelectionFront",true);this.cmd("cut");return false;case 9:if(e.ctrlKey)break;var sel=this.info("selection");var l1=sel.start.line;var l2=sel.end.line;if(l1==l2)
this.cmd("insert","    ");else{var offset=e.shiftKey?-4:4;for(var i=l1;i<=l2;i++){var ident=this.info("ident",i)+offset;ident=Math.floor((ident)/4)*4;this.cmd("setIdent",i,ident);}}
return false;case 37:this.cmd("moveSelectionBack",!!e.shiftKey);return false;break;case 39:this.cmd("moveSelectionFront",!!e.shiftKey);return false;break;case 38:this.cmd("moveSelectionTop",!!e.shiftKey);return false;break;case 40:this.cmd("moveSelectionBottom",!!e.shiftKey);return false;break;case 35:this.cmd("moveSelectionEnd",!!e.shiftKey);return false;case 36:this.cmd("moveSelectionHome",!!e.shiftKey);return false;case 13:var ident=this.info("ident",this.info("selection").end.line);this.cmd("insert","\n"+("                                                                                         ".substr(0,ident)));return false;}},cmd_keypress:function(e){this.cmd("insert",e);return false;},cmd_showSearchDlg:function(){inx({type:"inx.code.search"}).cmd("render").cmd("show").on("search",[this.id(),"newSearch"]);return false;},cmd_newSearch:function(str){var found=false;var sel=this.info("selection");for(var ii=0;ii<this.lines.length;ii++){var i=(ii+sel.end.line)%this.lines.length;var line=this.info("line",i);var symbol=line.indexOf(str,i==sel.end.line?sel.end.symbol:0);if(symbol!=-1){this.cmd("select",{line:i,symbol:symbol},{line:i,symbol:symbol+str.length});found=1;break;}}
if(found)
this.cmd("focus");else
inx.msg("Фраза не найдена",1);return false;},cmd_search:function(){var str=inx.storage.get("viomerdyg2oklbjcus3m")+"";this.cmd("newSearch",str);return false;}});inx.ns("inx.code.lang").ini={normal:{triggers:[{re:/\[/,name:"section"},{re:/\$\w+/,name:"variable"},{re:/\d+/,name:"digit"},{re:/"/,name:"string"},{re:/\;.*/,name:"comment"}],style:"normal"},variable:{style:"variable"},digit:{style:"digit"},string:{triggers:[{re:/"/,name:"back"},{re:/\\"/,name:"quote_escape"}],style:"string"},section:{triggers:[{re:/\]/,name:"back"}],style:"keyword"},quote_escape:{},comment:{style:"comment"}}
inx.ns("inx.code.lang").js={normal:{triggers:[{re:/\d+/,name:"digit"},{re:/\/\*/,name:"comment_block"},{re:/"/,name:"string"},{re:/\/\/.*/,name:"comment"},{re:/\/([^\/]|(\\_\/))+\//,name:"regex"},{re:/\bfunction\b|\breturn\b|\bfor\b|\bvar\b|\bin\b|\bthis\b|\bif\b|\bwhile\b/,name:"keyword"}],style:"normal"},regex:{style:"variable"},regex_escape_slash:{style:"string"},comment_block:{triggers:[{re:/\*\//,name:"back"}],style:"comment"},digit:{style:"digit"},string:{triggers:[{re:/"/,name:"back"},{re:/\\"/,name:"quote_escape"}],style:"string"},quote_escape:{},keyword:{style:"keyword"},comment:{style:"comment"}}
inx.ns("inx.code.lang").php={normal:{triggers:[{re:/\$\w+/,name:"variable"},{re:/\d+/,name:"digit"},{re:/\/\*/,name:"comment_block"},{re:/"/,name:"string"},{re:/\/\/.*/,name:"comment"},{re:/foreach|public|static|function|array|return|echo|class|extends|if|else/,name:"keyword"}],style:"normal"},comment_block:{triggers:[{re:/\*\//,name:"back"}],style:"comment"},variable:{style:"variable"},digit:{style:"digit"},string:{triggers:[{re:/"/,name:"back"},{re:/\\"/,name:"quote_escape"}],style:"string"},quote_escape:{},keyword:{style:"keyword"},comment:{style:"comment"}}
inx.ns("inx.code.lang").text={normal:{triggers:[]}}
inx.code.lineParser=inx.observable.extend({constructor:function(p){if(!p.lang)p.lang="text";this.descr=inx.code.lang[p.lang];this.base(p);},info_parse:function(code,stack){this.stack=[];for(var i in stack)this.stack.push(stack[i]);this.src=code;this.log=[];this.index=0;if(this.state()!="normal")
this.log[0]=this.descr[this.state()].style;while(this.step()){}
return{style:this.log,stack:this.stack};},state:function(){return this.stack[this.stack.length-1]||"normal";},setState:function(s){s=="back"?this.stack.pop():this.stack.push(s);this.log[this.pos()]=this.descr[this.state()].style;},pos:function(){return this.index;},eat:function(length){this.index+=length;this.src=this.src.substr(length);},step:function(){var triggers=this.descr[this.state()].triggers;var index=null;if(!triggers){this.setState("back");return true;}
for(var i in triggers){var trigger=triggers[i];var result=this.src.match(trigger.re);if(result)
if(index===null||result.index<index){index=result.index;where=trigger.name;var found=result[0];}}
if(found){this.eat(index+(where=="back"?found.length:0));this.setState(where);this.eat(where!="back"?found.length:0);return true;}else{return false;}}})
inx.code.parser=inx.observable.extend({constructor:function(p){this.line=0;this.base(p);this.lineParser=inx({type:"inx.code.lineParser",lang:this.lang});this.stack=[];this.energy=0;this.start();},cmd_destroy:function(){this.lineParser.cmd("destroy");this.base();},cmd_process:function(){for(var k=0;k<25;k++){this.energy++;if(this.energy<0&&this.energy!=-9)return;var code=this.editor.info("line",this.line);if(code===undefined){return;}
var visible=this.editor.info("visibleLines");if(this.line>visible.bottom)this.stop();var ret=this.lineParser.info("parse",code,this.stack[this.line-1]);this.editor.cmd("updateLine",this.line,{style:ret.style});this.stack[this.line]=ret.stack;this.line++;}},cmd_lineChanged:function(line){if(line<this.line)this.line=line;this.start();this.energy=-20;},cmd_scrollChanged:function(){this.start();this.energy=-10;},start:function(){if(!this.interval)
this.interval=setInterval(inx.cmd(this,"process"),10);},stop:function(){if(this.interval)
clearInterval(this.interval);this.interval=0;}});inx.code.search=inx.dialog.extend({constructor:function(p){p.width=300;p.height=45;p.layout="inx.layout.absolute";this.input=inx({type:"inx.textfield",x:10,y:10,width:"272",listeners:{blur:[this.id(),"destroy"]}});p.items=[this.input];p.title="Поиск";this.base(p);var i=this.input;setTimeout(function(){i.cmd("focus").cmd("select");},100);this.on("submit","handleSubmit");inx.storage.onready(this.id(),"onStorageReady");},cmd_onStorageReady:function(){var val=inx.storage.get("viomerdyg2oklbjcus3m")+"";this.input.cmd("setValue",val);},cmd_handleSubmit:function(e){var str=this.input.info("value");this.fire("search",str);inx.storage.set("viomerdyg2oklbjcus3m",str+"");this.cmd("destroy");}})