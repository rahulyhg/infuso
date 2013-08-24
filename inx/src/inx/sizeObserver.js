// @link_with_parent

inx.sizeObserver = new function() {

    var buffer = [];

    this.add = function(e,id,fn) {
    
        e = $(e);
        if(e.data("x4lsncvi7")) {
            return;
        }
        
        e.data("x4lsncvi7",true);
        e.data("height-id",id);
        e.data("height-fn",fn);
        e.addClass("x4lsncvi7");
        buffer.push(e);
    
    }
    
    var checkBuffer = function() {
    
        var n = 0;
    
        $(".x4lsncvi7:visible").each(function() {
        
            var e = $(this);
            var height = inx.height(e);
            if(height != e.data("lastHeight")) {                
                e.data("lastHeight",height);
                var id = e.data("height-id");
                var fn = e.data("height-fn");
                inx(id).cmd(fn,height);
            }
            n++;
            
        });
        
    }
    
    setInterval(checkBuffer,200);

}