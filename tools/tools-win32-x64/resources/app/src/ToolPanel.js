(function(){
    var __un=Laya.un,__uns=Laya.uns,__static=Laya.static,__class=Laya.class,__getset=Laya.getset,__newvec=Laya.__newvec;
    var ToolPanel=(function(){
        function ToolPanel()
        {
            Laya.init(Browser.width, Browser.height,Laya.WebGL);  
            Laya.loader.load([{"url":"res/base.fui","type":Laya.Loader.BUFFER}],Laya.Handler.create(this,this.onLoadComplete));
        }

       __class(ToolPanel,'ToolPanel');
		var __proto=ToolPanel.prototype;
        __proto.onLoadComplete=function()
        {
            fairygui.UIPackage.addPackage("res/base");
            var view=fairygui.UIPackage.createObject("base","MainPanel");
            Laya.stage.addChild(fairygui.GRoot.inst.displayObject);
            fairygui.GRoot.inst.addChild(view);
            view.width=Laya.stage.width;
            view.height=Laya.stage.height;
        }
    })();
})(window,document,Laya);
new ToolPanel();