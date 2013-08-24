// @include inx.list
// @link_with_parent

// Стикер задачи

inx.css(".qm5btw9-task{font-size:11px;}");
inx.css(".qm5btw9{overflow:hidden;position:relative;cursor:pointer;height:100%;background:white;border:1px solid #cccccc;box-shadow:0px 0px 5px rgba(0, 0, 0, 0.1);}");
inx.css(".qm5btw9:hover{border:1px solid gray;}");
inx.css(".qm5btw9-status{position:absolute;bottom:0;left:0;width:100%;background:rgba(0,0,0,.2);color:white;padding:2px 1px 1px 2px;fontWeight:bold}");
inx.css(".qm5btw9-hover-group .qm5btw9-background{background:rgba(255,255,0,.2);}");
inx.css(".qm5btw9-my {border:1px solid blue;}")

// Помеха
inx.css(".qm5btw9-drawback{width:100px;height:100px;cursor:pointer;background:url(/board/res/img/icons64/drawback.png) center center no-repeat;opacity:.7;}");
inx.css(".qm5btw9-drawback:hover{opacity:1;}");
inx.css(".qm5btw9-date-mark{color:gray;font-size:18px;font-style:italic;}");

// Папка
inx.css(".qm5btw9-folder{width:100px;height:100px;cursor:pointer;background:url(/board/res/img/icons64/folder.png) center center no-repeat;}");

inx.mod.board.board.taskList.task = inx.panel.extend({

    constructor:function(p) {    
        p.style = {
            border:0,
            width:100,
            height:135
        }
        this.base(p);
    },
    
    cmd_render:function() {
    
        this.base();
        this.el.css({overflow:"visible"})

        var task = this.data.data;
        
        if (this.data.folder) {
        
            $("<div class='qm5btw9-folder' >")
                .appendTo(this.el);
            
        } else if (this.data.id=="drawback") {
        
            $("<div class='qm5btw9-drawback' >")
                .attr("title","Помеха")
                .appendTo(this.el);
        
        }
        
        // Отметка даты
        else if (this.data.dateMark) {
            $("<div class='qm5btw9-date-mark' >")
                .appendTo(this.el)
                .html(this.data.dateMark);
            this.style("break",true).style("width","parent").style("height",10);
                
        } else {
    
            // При наведении на задачу, подсвечиваем все задачи из того же проекта
            var taskContainer = $("<div>")
                .addClass("qm5btw9-task")
                .data("taskID",task.id);
                
            if(task.epic) {
                
                $("<div>")
                    .css({
                        width:98,
                        height:100,
                        border:"1px solid rgba(0,0,0,.2)",
                        background:"white",
                        position:"absolute",
                        left:6,
                        top:6
                    })
                    .appendTo(taskContainer);
                    
                $("<div>")
                    .css({
                        width:98,
                        height:100,
                        border:"1px solid rgba(0,0,0,.2)",
                        background:"white",
                        position:"absolute",
                        left:3,
                        top:3
                    })
                    .appendTo(taskContainer);
            }   
        
            var e = $("<div>")
                .addClass("qm5btw9")
                .appendTo(taskContainer)
                .addClass("qm5btw9-"+task.projectID);
                
            if(task.my) {
                e.addClass("qm5btw9-my");
            }    
            
            // Цвет листика
            if(task.color) {
                e.css({background:task.color});
            }
            
            // Фоновое изображение 
            if(task.backgroundImage) {
                e.css({
                    "background-image":"url("+task.backgroundImage+")",
                    backgroundRepeat:"no-repeat",
                    backgroundPosition:"center center"
                });
            }            
            
            // Помехи
            if(task.hindrance) {
                e.css({
                    "background-image":"url(/board/res/img/hindrance.png)",
                    backgroundRepeat:"no-repeat",
                    backgroundPosition:"center center"
                });
            }
                
            var e = $("<div>").css({height:100}).addClass("qm5btw9-background").appendTo(e);
                
            e.click(inx.cmd(this,"editTask",{taskID:task.id}));
            $("<div>").css({height:77,padding:4,overflow:"hidden"}).html(task.text+"").appendTo(e);
    
            // Статус листика
            var status = $("<div>").html(task.info+"").appendTo(e).addClass("qm5btw9-status");  
            
            if(task.attachment) {
                $("<img src='/board/res/img/icons16/attachment.png' />")
                    .css({
                        position:"absolute",
                        right:4,
                        top:0
                    }).appendTo(status);
            }
            
            // Процент выполнения
            if(task.percentCompleted) {
                $("<div>")
                    .html("&nbsp;")
                    .appendTo(e)
                    .css({
                        width:task.percentCompleted+"%"
                    }).addClass("qm5btw9-status"); 
            }
            
            // Подпись под листиком
            if(task.bottom) {
                var bottom = $("<div>").html(task.bottom+"")
                    .css({
                        marginTop:4,
                        opacity:.5,
                        position:"relative",
                        overflow:"hidden"
                    })
                    .appendTo(taskContainer);
                    
                //this.style("height",120);
            }
            
            var cmp = this;
            var controls = $("<div>")
                .addClass("controls")
                .css({
                    height:24
                })                
                .appendTo(taskContainer);
                
            taskContainer.mouseenter(function() {
                cmp.cmd("showControls");
            });
             taskContainer.mouseleave(function() {
                cmp.cmd("hideControls");
            });
                
            this.cmd("html",taskContainer)
        
        }
        
        var cmp = this;
        
        // Влючаем перетаскивание файлов в задачу
        inx({
            type:"inx.file",
            dropArea:this.el,
            loader:{
                cmd:"board/controller/attachment/uploadFile",
                taskID:this.data.id,
            },oncomplete:function() {
                cmp.owner().cmd("load");
            }
        }).cmd("render");
            
    },
    
    cmd_showControls:function() {
        
        if(!this.controls) {
    
        var controls = this.el.find(".controls");
            var cmp = inx({
                width:this.info("width"),
                tools:this.data.data.tools,
                type:"inx.mod.board.taskControls",
                taskID:this.data.id
            });
            
            cmp.cmd("render").cmd("appendTo",controls);
            this.controls = cmp;
        }
        
        this.controls.cmd("show");
        
    },
    
    cmd_hideControls:function() {
        if(!this.controls) {
            return;
        }
        this.controls.cmd("hide");
    }
    

         
});