// @include inx.dd
/*-- /mod/bundles/inx/src/inx/panel.js --*/


inx.css(
    ".inx-panel-vs{background:url(%res%/img/components/panel/vs.gif);position:absolute;cursor:e-resize;overflow:hidden;}",
    ".inx-panel-hs{background:url(%res%/img/components/panel/hs.gif);position:absolute;cursor:n-resize;overflow:hidden;}",
    ".yvzdf52t {position:relative;width:100%;}",
    ".yvzdf52t-bodyContainer {position:absolute;left:0px;top:0px;width:100%;}",    
    ".wu2qcu0xke-scrollbar {opacity:0;display:none;width:10px;background:gray;background:rgba(0,0,0,.5);position:absolute;box-shadow:inset 0 0 10px rgba(0,0,0,.3);}",
    ".wu2qcu0xke-hscrollbar {opacity:0;display:none;height:10px;background:gray;background:rgba(0,0,0,.5);position:absolute;box-shadow:inset 0 0 10px rgba(0,0,0,.3);}"
);

inx.panel = inx.box.extend({

    constructor:function(p) {
    
        if(!p.title) {
            p.title = "";
        }
            
        this.layout = p.layout || "inx.layout['default']";
            
        this.private_html = p.html;
        
        // Тулбар
        if(!p.side) {
            p.side = [];
        }
            
        if(p.tbar && p.tbar.length) {
            this.tbar = inx.cmp.create({
                type:"inx.toolbar",
                items:p.tbar,
                region:"top"
            });
            p.side.unshift(this.tbar);
        }
        
        // Нижний тулбар
        if(p.bbar) {
            this.bbar = inx.cmp.create({
                type:"inx.toolbar",
                items:p.bbar,
                region:"bottom"
            });
            p.side.unshift(this.bbar);
        }
        
        this.private_scrollTop = 0;
        this.private_scrollLeft = 0;
        
        this.side = p.side;
        
        this.base(p);
        
        // Добавляем дочерние компонеты
        this.private_items = [];
        if(p.items)
            for(var i in p.items)
                this.cmd("add",p.items[i]);
    },

    axis_tbar:function() {
        return this.tbar;
    },

    axis_bbar:function() {
        return this.bbar;
    },
    
    axis_allItems:function() {
        var ids = [];
        this.items().each(function(){
            ids.push(this.id());
            this.axis("allItems").each(function() {
                ids.push(this.id());
            })            
        })
        return inx(ids);
    },

    __defaultChildType:"inx.panel",
    
    private_layoutManager:function() {
        var layout = this.layout; 
        if(layout == "inx.layout.default") {
            layout = "inx.layout['default']";
        }
        var ret = eval(layout);
        if(!ret) {
            throw new Error("Bad layout"+this.layout);
        }
        return ret;
    },
    
    cmd_render:function() {    
        
        this.base();
        
        this.private_bodyContainer = $("<div>").addClass("yvzdf52t-bodyContainer").appendTo(this.el);
        this.__body = $("<div>").addClass("yvzdf52t").appendTo(this.private_bodyContainer);
        var id = this.id();

        this.private_layoutManager().create.apply(this);

        // Добавляем боковые панели
        var side = this.side || [];
        this.side = [];
        for(var i=0;i<side.length;i++)
            this.cmd("addSidePanel",side[i]);

        var that = this;
        this.items().each(function() {
            this.cmd("render");
            that.private_layoutManager().add.apply(that,[this]);
        });

        if(this.keepLayout) {
            inx.storage.onready(this.id(),"restoreLayout");
        }

        if(this.private_html!==undefined) {
            this.cmd("html",this.private_html);
        }

    },

    cmd_html:function(html,params) {
    
        if(!params) {
            params = {};
        }
        
        if(params.syncLayout===undefined) {
            params.syncLayout = true;
        }

        if(!html && html!==0 && html!=="0") {
            html = "";
        }

        if(this.__body) {
        
            if(!this.private_htmlContainer) {
                this.private_htmlContainer = $("<div>").css({
                    position:"relative"
                }).appendTo(this.__body);
            }
        
            if(typeof(html)=="object") {
                this.private_htmlContainer.html("");
                $(html).appendTo(this.private_htmlContainer)
            } else {
                this.private_htmlContainer.html(html);
            }
            
            this.private_html = html;
            
            this.cmd("updateSizeWatch");
            
            if(params.syncLayout) {
                this.task("syncLayout");
            }
            
        }
        
        this.private_html = html;
        
    },
    
    cmd_updateSizeWatch:function() {
        if((this.style("height")=="content" || this.style("vscroll")) && this.private_html) {
            inx.sizeObserver.add(this.private_htmlContainer,this.id(),"fff");
        }
    },
    
    cmd_fff:function(h) {
        this.cmd("setContentHeight",h);
    },
    
   
    cmd_syncLayout:function() {
    
        if(!this.info("rendered")) {
            return;
        }
        
        this.cmd("updateSidePanels");
        
        this.cmd("updateItemsLayout");
        
        this.cmd("updateBox");
        
        // Обновляем скролл
        if(this.style("vscroll")) {
            this.cmd("updateVScroll");
        }
        
        if(this.style("hscroll")) {
            this.cmd("updateHScroll");
        }
            
        this.base();        
    }, 
    
    cmd_updateItemsLayout:function() {
    
        var t1 = new Date().getTime();
        var hname = "sync layout: "+this.layout;
    
        this.private_layoutManager().sync.apply(this);   
            
        var t2 = new Date().getTime();
        var time = t2-t1;
        inx.observable.debug.cmdCountByName[hname] = (inx.observable.debug.cmdCountByName[hname] || 0) + 1;
        inx.observable.debug.totalTime[hname] = (inx.observable.debug.totalTime[hname] || 0) + time;

    },

    // Загружает сохраненный лайаут
    cmd_restoreLayout:function() {

        if(!this.keepLayout) return;

        if(!this.private_layoutLoaded) {
            this.private_loadedLayout = inx.storage.get(this.private_getLayoutKey()) || {};
            this.private_layoutLoaded = 1;
        }

        // Проходим по всем боковым панелям и выставляем им ширину
        var that = this;
        inx(this).side().each(function(i){
            if(!this.info("resizable"))
                return;
            var key = this.info("name") || i;
            var size = that.private_loadedLayout[key];

            if(size) {
                (this.info("region")=="left" || this.info("region")=="right") ? this.cmd("width",size) : this.cmd("height",size);
            }

        })

    },

    // сохраняет лайаут
    cmd_saveLayout:function() {

        if(!this.keepLayout) return;
        if(!this.private_layoutLoaded) return;
        var layout = {};
        var flag = 0;
        for(var i=0;i<this.private_side.length;i++) {
            var r = inx(this.private_side[i]);
            if(!r.info("resizable")) continue;
            layout[r.info("name") || i] = (r.info("region")=="left" || r.info("region")=="right") ? r.info("width") : r.info("height");
            flag = 1;
        }
        if(flag) inx.storage.set(this.private_getLayoutKey(),layout);
    },

    private_getLayoutKey:function() {
        if(this.keepLayout!==true && this.keepLayout!==1) return this.keepLayout+":layout";
        return this.type+":layout";
    },

/******************************************************************************/
// Боковые панели

    // Добавляет боковую панель
    cmd_addSidePanel:function(panel) {
    
        panel = inx(panel,"inx.panel");
        
        var region = panel.info("region");
        
        panel.cmd("width",panel.info("width"));
        panel.cmd("height",panel.info("height"));
        panel.style("border",0);
        
        if(region=="left" || region=="right") {
            if(panel.info("resizable"))
                panel.style("width","parent");
            panel.style("height","parent");    
        }        
            
        if(region=="top" || region=="bottom")   
            if(panel.info("resizable")) 
                panel.style("height","parent");        
        
        if(!this.private_side) {
            this.private_side = [];
        }
        this.private_side.push(panel.id());
        panel.setOwner(this.id());

        // Контейнер панели
        var e = $("<div />").css({
            position:"absolute",
            overflow:"hidden"
        }).appendTo(this.el);
        panel.data("sidebarContainer",e);
        panel.cmd("render");              
        panel.cmd("appendTo",e);

        // Разделитель
        var e = $("<div />").addClass((panel.info("region")=="left" || panel.info("region")=="right") ? "inx-panel-vs" : "inx-panel-hs").appendTo(this.el);
        panel.data("sidebarSeparator",e);
        if(panel.info("resizable")) {
            inx.dd.enable(e,this,"dragSeparator",panel);
        }

        inx.storage.onready(this.id(),"restoreLayout");
        this.task("syncLayout");
        
    },

    // Удаляет боковую панель (но не разрушает ее)
    cmd_removeSidePanel:function(cmp) {
        var id = inx(cmp).id();
        for(var i in this.private_side)
            if(this.private_side[i]==id) {
                var side = inx(id);
                $(side.data("sidebarSeparator")).remove();
                $(side.data("sidebarContainer")).remove();
                this.private_side.splice(i,1);
                this.task("syncLayout");
                side.setOwner(0);
                break;
            }
    },

    // Callback для перемещения разделителя
    cmd_dragSeparator:function(p,panel) {
        switch(panel.info("region")) {
            case "left": panel.cmd("width",panel.info("width")+p.dx);break;
            case "right": panel.cmd("width",panel.info("width")-p.dx);break;
            case "top": panel.cmd("height",panel.info("height")+p.dy);break;
            case "bottom": panel.cmd("height",panel.info("height")-p.dy);break;
        }
        this.task("saveLayout");
    },

    axis_side:function() {
        return this.private_side;
    },
    
    cmd_calculateContentHeight:function() {
        
    },

    cmd_updateSidePanels:function() {
    
        // Коллекция видимых панелей
        var panels = inx(this).axis("side").eq("hidden",false);
        
        // Прячем контейнеры скрытых панелей
        inx(this).axis("side").eq("hidden",true).each(function() {
            var e = this.data("sidebarContainer");
            if(e) { 
                e.css({display:"none"});
            }
            var e = this.data("sidebarSeparator");
            if(e) {
                e.css({display:"none"});
            }
        });
        
        if(!panels.length()) {
            this.private_bodyContainerLeft = 0;
            this.private_bodyContainerTop = 0;
            this.__bodyWidth = this.info("innerWidth");
            this.__bodyHeight = this.info("innerHeight");
            this.task("updateBodyBox");
            return;
        }
        
        // Расчитываем суммарные размеры горизонтальных и вертикальных панелей
        var offset = {
            left:0,
            top:0,
            right:0,
            bottom:0
        };
        
        panels.each(function() {
            var r = this.info("region");     
            
            var th = this.info("resizable") ? 6 : 0;
            
            this.data("separatorThickness",th)
            switch(r) {
                case "left":
                case "right":
                offset[r]+= this.info("width") + th;
                    break;
                case "top":
                case "bottom":
                offset[r]+= this.info("height") + th;
                    break;
            }
        });
        
        // Положение и размер body
        this.__bodyWidth = this.info("innerWidth") - offset.left - offset.right;
        this.__bodyHeight = this.info("innerHeight") - offset.top - offset.bottom;
        
        this.private_bodyContainerLeft = offset.left;
        this.private_bodyContainerTop = offset.top;
        
        this.task("updateBodyBox");
        
        // Параметры для горизонтальных и вертикальных панелей
        if(this.style("sidePriority")=="h") {
            var hparams = {
                left:0,
                width:Math.max(this.info("innerWidth"),1)
            }
            var vparams = {
                top:offset.top,
                height:Math.max(this.info("innerHeight") - offset.top - offset.bottom,1)
            };
        } else {
            var hparams = {
                left:offset.left,
                width:Math.max(this.info("innerWidth") - offset.left - offset.right,1)
            }
            var vparams = {
                top:0,
                height:Math.max(this.info("innerHeight"),1)
            };
        }
        
        var offset = {
            left:0,
            top:0,
            right:0,
            bottom:0
        };
        
        // Устанавливаем размеры панелям и разделителям
        panels.each(function() {
            var r = this.info("region");
            
            var container = this.data("sidebarContainer");
            var separator = this.data("sidebarSeparator");
            
            if(container && separator) {
            
                container
                    .css(r,offset[r])
                    .css("display","block");
            
                separator
                .css("display","block");            
                
                switch(r) {
                    case "left":
                    case "right":                    
                        this.cmd("height",vparams.height);
                        container.css("top",vparams.top);
                        separator
                            .css(r,offset[r]+this.info("width"))
                            .css("top",vparams.top)
                            .css("height",vparams.height)
                            .css("width",this.data("separatorThickness"));
                        offset[r] += this.info("width") + this.data("separatorThickness");
                        break;
                    case "top":
                    case "bottom":                    
                        this.cmd("width",hparams.width);
                        container.css("left",hparams.left);
                        separator
                            .css(r,offset[r]+this.info("height"))
                            .css("left",hparams.left)
                            .css("width",hparams.width)
                            .css("height",this.data("separatorThickness"));
                        offset[r] += this.info("height") + this.data("separatorThickness");
                        break;
                }            
            }
        }); 

    },
    
    info_regionSize:function(region) {
        var h = 0;
        inx(this).axis("side").eq("visible",true).each(function(){
            var region2 = this.info("region");
            if(region2==region) {
                h+= this.info("resizable") ? 6 : 2;
                h+= this.info("width");
            }
        });
        return h;
    },

    info_sideHeight:function() {
    
        var h = 0;
        
        inx(this).axis("side").eq("visible",true).each(function(){
            var c = this;
            var region = c.info("region");
            if(region=="top" || region=="bottom") {
                h+= c.info("resizable") ? 6 : 2;
                h+= c.info("height");
            }
        });
        
        return h;
        
    },
    
    // Ревизия!
    cmd_add:function(c,position) {    
    
        var cmp;
        
        // Добавление ленивого компонента
        // Используется, когда нужно добавить свернутую тяжелую панель и нет необходимости рендерить ее сразу
        if(c && c.lazy) {
            var parent = this;
            var lazyData = c;
            cmp = inx({
                type:"inx.panel",
                title:c.title,
                name:c.name,
                hidden:c.hidden,
                html:"Ленивый компонент",
                listeners:{
                    show:function() {
                        var proxy = this;
                        lazyData.hidden = false;    
                        var c = inx(lazyData,"inx.panel");                            
                        var position = 0;
                        parent.items().each(function(n) {
                            if(this.id()==proxy.id())
                                position = n;
                        })
                        this.cmd("destroy");
                        parent.cmd("add",c,position);
                        c.fire("lazyGoesActive")
                            
                        }
                    }
                })
        } else {
            // Создаем дочерний компонент
            cmp = inx(c,this.__defaultChildType);
        }
        
                
        // Если в потомках уже имеется элемент с таким же именем
        // Новый элемент не доьбавляем
        var name = cmp.info("name");
        if(name) {
            var same = this.items().eq("name",name);
            if(same.length()) {
                cmp.cmd("destroy");
                this.cmd("addNameExists",same);
                return same;
            }                
        }

        // При добалении несуществующего компонента, пропускаем его
        if(!cmp.exists()) {
            return inx(0);
        }
            
        cmp.owner().cmd("remove",cmp);

        // Настраиваем связи
        cmp.setOwner(this.id());
        
        // Вставляем дочерний элемент на нужное место
        if(position===undefined) {
            this.private_items.push(cmp.id());
        } else {
            this.private_items.splice(position,0,cmp.id());
        }

        // Вызываем метод add лайоут-менеджера
        if(this.__body) {
            cmp.cmd("render");
            this.private_layoutManager().add.apply(this,[cmp]);
        }
            
        this.task("syncLayout");

        return cmp;
    },

    cmd_destroy:function() {
        this.base();
        // Разрушаем все боковые панели. Все
        for(var i in this.private_side) {
            inx(this.private_side[i]).cmd("destroy");
        }
    },

    /**
     * Параметр функции - id компонента или сам компонент
     **/
    cmd_remove:function(cmp) {
    
        if(!this.private_items)
            return;
    
        id = inx(cmp).id();

        for(var i=0;i<this.private_items.length;i++) {
            if(this.private_items[i]==id) {
                this.private_layoutManager().remove.apply(this,[inx(id)]);
                this.private_items.splice(i,1);
                inx(id).setOwner(0);
                this.task("syncLayout");
                break;
            }
        }
            
        // Пытаемся удалить панель из списка боковых панелей
        this.cmd("removeSidePanel",id);
    },
    

    /**
     * Параметр функции - id компонента или сам компонент
     **/
    cmd_replace:function(cmp,replacer) {
    
        if(!this.private_items) {
            return;
        }
    
        var replacer = inx(replacer);
        replacer.cmd("render");
    
        id = inx(cmp).id();

        for(var i=0;i<this.private_items.length;i++) {
            if(this.private_items[i]==id) {
            
                this.private_layoutManager().remove.apply(this,[inx(this.private_items[i])]);
                inx(this.private_items[i]).setOwner(0);
                this.private_items[i] = replacer.id();
                replacer.setOwner(this);
                this.private_layoutManager().add.apply(this,[replacer]);                
                this.task("syncLayout");
                break;
            }
        }
            
    },

    /**
     * Удалить всех потомков
     **/
    cmd_destroyChildren:function() {
        this.items().cmd("destroy");
    }, 
    
    info_formDataProvider:function() {
        return true;
    },

    // Возвращает данные формы
    info_data:function() {
        var heap = {};
        this.items().each(function(){
            var name = this.info("name");
            if(name) {
                heap[name] = this.info("value");
            } else {
                if(this.info("formDataProvider")) {
                    var data = this.info("data");
                    if(data)
                        for(var j in data)
                            heap[j] = data[j];
                }
            }
        });
        inx(this).axis("side").each(function(){
            var name = this.info("name");
            if(name) {
                heap[name] = this.info("value");
            } else {
                var data = this.info("data");
                if(data)
                    for(var j in data)
                        heap[j] = data[j];
            }
        });
        return heap;
    }

});


/*-- /mod/bundles/inx/src/inx/panel/metrics.js --*/


inx.panel = inx.panel.extend({

    /**
     * Обновляет положение и размеры элемента __body панели
     **/
    cmd_updateBodyBox:function() {
    
        if(!this.__body) {
            return;
        }            
            
        if(this.info("hidden")) {
            return;
        }
    
        var padding = this.style("padding");
        
        var width = inx.geq(this.__bodyWidth - padding*2,1);
        
        this.__body.css({
            width:width,
            left:padding,
            top:padding
        });
            
        this.private_bodyContainer.css({
            left:this.private_bodyContainerLeft,
            top:this.private_bodyContainerTop,
            width:inx.geq(this.__bodyWidth,1),
            height:inx.geq(this.__bodyHeight,1)
        }); 
        
    },
    
    info_bodyHeight:function() {
        return this.__bodyHeight || 0;
    },

    info_bodyWidth:function() {
        return this.__bodyWidth || 0;
    },
    
    /**
     * Возвращает ширину доступной области
     * Доступная область - та в которой можно вывести информацию
     * Это внутренний размер, без паддинга, скроллбара и т.п.
     **/
    info_clientWidth:function() {
        return Math.max(0,(this.__bodyWidth || 0) - this.style("padding")*2 - (this.private_style.vscroll ? 10 : 0));
    },
    
    info_clientHeight:function() {
        return Math.max(0,(this.__bodyHeight || 0) - this.style("padding")*2 - (this.private_style.hscroll ? 10 : 0));
    },
    
});


/*-- /mod/bundles/inx/src/inx/panel/scroll.js --*/


inx.panel = inx.panel.extend({

    info_VScrollRate:function() {
    
        var content = this.info("contentHeight") + this.style("padding")*2;
        var body = this.info("bodyHeight");
        if(content==body) {
            return 1;
        }
    
        return 1 / content * body;
    },
    
    info_HScrollRate:function() {
        return 1 / (this.info("contentWidth") + this.style("padding")*2) * this.info("bodyWidth");
    },

    // Перетаскивание вертикального скроллбара
    cmd_handleDragScroll:function(e) {
        if(e.phase=="start") {
            this.pezxw9i3p = this.info("scrollTop");
        }        
        var k = this.info("VScrollRate");
        var vscroll = this.pezxw9i3p + e.ay / k;
        this.cmd("scrollTop",vscroll);
        this.task("updateVScroll")
    },
    
    cmd_handleDragHScroll:function(e) {
        var k = this.info("HScrollRate");
        this.cmd("scrollLeft",e.dx/k,true);
        this.task("updateHScroll")
    },

    cmd_mousewheel:function(deltha,e) {
    
        if(!this.style("vscroll")) {
            this.owner().cmd("mousewheel",deltha,e);
            return;
        }
            
        this.cmd("scrollTop",-deltha,{add:true,bubble:true});
        return false;
    },
    
    cmd_updateScroll:function() {
        this.cmd("updateVScroll");
        this.cmd("updateHScroll");
    },
    
    /**
     * Устанавливает вертикальный скролл
     **/
    cmd_scrollTop:function(vscroll,params) {
    
        if(!this.style("vscroll")) {
            return;
        }

        if(!params)
            params = {};

        if(params.add) {
            this.private_scrollTop = this.info("scrollTop") + vscroll;
            if(params.bubble) {
                if(vscroll<0 && this.private_scrollTop<=0) {
                    this.owner().cmd("scrollTop",vscroll,params);
                    if(!this.owner().exists())
                        params.xxx = true;
                }
                if(vscroll>0 && this.private_scrollTop >= this.info("maxVScroll")) {
                    this.owner().cmd("scrollTop",vscroll,params);
                    if(!this.owner().exists())
                        params.xxx = true;
                }
            }
        } else {
            this.private_scrollTop = vscroll;
        }

        this.fire("scroll");
        this.task("updateVScroll");

    },

    info_maxVScroll:function() {
        return this.info("contentHeight") + this.style("padding")*2 - this.info("bodyHeight");
    },
    
    info_scrollTop:function() {
        var vscroll = this.private_scrollTop;
        var maxscroll = this.info("maxVScroll");
        if(vscroll>maxscroll)
            vscroll = maxscroll;
        if(vscroll<0)
            vscroll = 0;
        return vscroll;
    },
    
    info_scrollLeft:function() {
        var scroll = this.private_scrollLeft;
        var maxscroll = this.info("contentWidth") + this.style("padding")*2 - this.info("bodyWidth");
        if(scroll>maxscroll)
            scroll = maxscroll;
        if(scroll<0)
            scroll = 0;
        return scroll;
    },
    
    cmd_scrollLeft:function(scroll,add) {    
    
        if(add) {
            this.private_scrollLeft = this.info("scrollLeft") + scroll;
        } else {
            this.private_scrollLeft = scroll;
        }
    
        this.cmd("clearInfoBuffer");
        this.fire("scroll");
        this.task("updateHScroll");        
    },

    cmd_updateVScroll:function() {    
        
        if(!this.__body)
            return;
        
        if(!this.info("contentHeight"))
             return;
    
        var vscroll = this.info("scrollTop");
        
        if(!this.private_scrollbar) {
            this.private_scrollbar = $("<div>")
                .addClass("wu2qcu0xke-scrollbar")
                .attr("olo:lo",this.id())
                .appendTo(this.private_bodyContainer);
            inx.dd.enable(this.private_scrollbar,this,"handleDragScroll",{offset:0})
        }
            
        var k = this.info("VScrollRate");
        
        if(k>=1 && this.private_scrollbarShown) {
            this.private_scrollbar.stop(true).animate({opacity:0},"fast",function() { $(this).css("display","none") });
            this.private_scrollbarShown = false;
        }
        
        if(k<1 && !this.private_scrollbarShown) {
            this.private_scrollbar.css("display","block").stop(true).animate({opacity:1},"fast");
            this.private_scrollbarShown = true;
        }
        
        var h = this.info("bodyHeight") * k;
        var top = vscroll*k;
            
        this.private_scrollbar.css({
            right:0,
            top:top,
            height:h
        })
        
        this.cmd("vscrollUpdateContent",vscroll);
                
    },
    
    cmd_vscrollUpdateContent:function(scroll) {
        this.__body.css({
            marginTop:-scroll
        })
    },    
    
    cmd_updateHScroll:function() {   
    
        if(!this.__body)
            return;
        
        if(!this.info("contentWidth"))
             return;
             
        var scroll = this.info("scrollLeft");

        if(!this.private_hscrollbar) {
            this.private_hscrollbar = $("<div>")
                .addClass("wu2qcu0xke-hscrollbar")
                .appendTo(this.private_bodyContainer);
            inx.dd.enable(this.private_hscrollbar,this,"handleDragHScroll")
        }
            
        var k = this.info("HScrollRate");
                
        if(k>=1 && this.private_hscrollbarShown) {
            this.private_hscrollbar.stop(true,true).animate({opacity:0},"fast",function() { $(this).css("display","none") });
            this.private_hscrollbarShown = false;
        }
        
        if(k<1 && !this.private_hscrollbarShown) {
            this.private_hscrollbar.css("display","block").stop(true,true).animate({opacity:1},"fast");
            this.private_hscrollbarShown = true;
        }
        
        var size = this.info("bodyWidth") * k;
        var offset = scroll*k;
            
        this.private_hscrollbar.css({
            bottom:0,
            left:offset,
            width:size
        })
        
        this.__body.css({
            marginLeft:-scroll
        })
                
    },

    cmd_scrollTo:function(cmp) {
        cmp = inx(cmp);
        var e = cmp.info("param","el");
        if(!e)
            return;
        var t1 = $(e).offset().top;
        var t2 = this.__body.offset().top;
        var min = t1 - t2;
        var max = min - this.info("clientHeight") - this.style("padding") + cmp.info("height");
        var s = this.info("scrollTop");

        if(max>s)
            s = max;
        
        if(min<s)
            s = min;
        
        this.cmd("scrollTop",s);
    }
    
});


/*-- /mod/bundles/inx/src/inx/panel/separator.js --*/


inx.panel.separator = inx.box.extend({

    constructor:function(p) {
        p.width = 9;
        p.height = 22;
        p.style = {
            border:0,
            background:"none"
        }
        this.base(p);
    },
    
    cmd_render:function(c) {
        this.base(c);
        $("<div/>").css({
            borderLeft:"1px solid gray",
            height:"100%",
            margin:"0px 4px 0px 4px"
        }).appendTo(this.el);
    }

});

/*-- /mod/bundles/inx/src/inx/panel/toolbar.js --*/


inx.panel.toolbar = inx.panel.extend({

    constructor:function(p) {
        p.style = {
            background:"#ededed",
            padding:5,
            spacing:2,
            height:"content",
        }
        p.layout = "inx.layout.column";
        this.base(p);
    },

    __defaultChildType:"inx.button",
      
    cmd_add:function(c) {
        if(c=="|")
            c={ type:"inx.panel.separator" };
        this.base(c);
    }
    
});

inx.toolbar = inx.panel.toolbar;


