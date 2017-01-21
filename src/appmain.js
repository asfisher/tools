/**
 * Created by 75 on 2016/12/22.
 */
class AppMain
{
    constructor()
    {
        Laya.init(Browser.width, Browser.height,Laya.WebGL);
        Laya.loader.load([{"url":"res/base.fui","type":Laya.Loader.BUFFER},{"url":"res/base@atlas0.png","type":Laya.Loader.Images}],Laya.Handler.create(this,this.onLoadComplete));
    }

    onLoadComplete()
    {
        fairygui.UIPackage.addPackage("res/base");
        Laya.stage.addChild(fairygui.GRoot.inst.displayObject);
        VManager.inst.start();
    }
}
new AppMain();