/**
 * Created by 75 on 2016/12/22.
 */
 class VManager
{
    constructor()
    {
        this.mainWindow=null;
    }

    static get inst()
    {
        return VManager._inst || (VManager._inst=new VManager());
    }

    start()
    {
        fairygui.UIConfig.globalModalWaiting=fairygui.UIPackage.getItemURL("base","Loading");
        let main=require("../src/ui/ui.mainpanel.js");
        require("../src/ui/ui.exportpanel.js");
        require("../src/ui/ui.textpanel.js");
        require("../src/ui/ui.publish.js");
        this.mainWindow=fairygui.UIPackage.createObject("base","MainPanel",main.MainWindow);
        fairygui.GRoot.inst.addChild(this.mainWindow);
    }


    showFreePanel(panel,isFull=true)
    {
        this.mainWindow.showFreePanel(panel,isFull);
    }

    backToMainPanel()
    {
        this.mainWindow.backToMainPanel();
    }
}


class DManager
{
    constructor()
    {

    }

    static get inst()
    {
        return DManager._inst || (DManager._inst=new DManager());
    }
}

class InitManager
{
    constructor()
    {

    }

    static get inst()
    {
        return InitManager._inst || (InitManager._inst=new InitManager());
    }
}