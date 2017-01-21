/**
 * Created by 75 on 2017/1/19.
 */
const remote=require("electron").remote;
class MainWindow extends fairygui.GComponent
{
    constructor()
    {
        super();
    }

    constructFromResource()
    {
        super.constructFromResource();
        this.getChild("closeBtn").onClick(this,this.clickClose);
        this.dragLine=this.getChild("dragLine");
        this.dragLine.on(Laya.Event.MOUSE_DOWN,this,this.startDrag);
        this.tabBtnList=this.getChild("tabBtnList").asList;
        this.tabBtnList.on(fairygui.Events.CLICK_ITEM,this,this.clickTabBtn);
        this.updateTab(0);
    }

    updateTab(tab)
    {
        this.tabBtnList.selectedIndex=tab;
        this.getController("tab").selectedIndex=tab;
        let panel=this.getChild("tabMc"+tab);
        if(panel && panel.updatePanel)panel.updatePanel();
    }

    clickClose()
    {
        let app=remote.app;
        app.quit();
    }

    startDrag(e)
    {
        let currWindow=remote.getCurrentWindow();
        let currRec=currWindow.getPosition();
        this.startMouseX=Laya.stage.mouseX;
        this.startMouseY=Laya.stage.mouseY;
        this.startPos=currRec;
        this.dragLine.on(Laya.Event.MOUSE_UP,this,this.stopDrag);
        this.dragLine.on(Laya.Event.MOUSE_OUT,this,this.stopDrag);
        Laya.timer.frameLoop(1,this,this.moving)
    }

    moving()
    {
        let currWindow=remote.getCurrentWindow();
        this.startPos[0]=this.startPos[0]-(this.startMouseX-Laya.stage.mouseX);
        this.startPos[1]=this.startPos[1]-(this.startMouseY-Laya.stage.mouseY);
        currWindow.setPosition(this.startPos[0],this.startPos[1],false);
    }

    stopDrag(e)
    {
        this.dragLine.off(Laya.Event.MOUSE_UP,this,this.stopDrag);
        this.dragLine.off(Laya.Event.MOUSE_OUT,this,this.stopDrag);
        Laya.timer.clear(this,this.moving)
    }


    clickTabBtn(target,evt)
    {
       this.updateTab(this.tabBtnList.selectedIndex);
    }
}

class PathItem extends fairygui.GComponent
{
    constructor()
    {
        super();
    }

    constructFromResource()
    {
        super.constructFromResource();
        this.titleTxt=this.getChild("titleTxt");
        this.pathTxt=this.getChild("pathTxt");
        this.getChild("selectBtn").onClick(this,this.clickSelectBtn);
        this.titleTxt.text="";
        this.pathTxt.text="";
    }

    initPath(title,path,type)
    {
        this.type=type;
        this.path=path;
        this.title=title;
        return this;
    }

    set type(value)
    {
        this._type=value;
        this.getController("page").selectedIndex=value;
        this.titleTxt=(this._type==2?this.getChild("titleInputTxt"):this.getChild("titleTxt"));
    }

    get type()
    {
        return this._type;
    }

    set path(value)
    {
        this.pathTxt.text=value?value:"";
    }

    get path()
    {
        return this.pathTxt.text;
    }


    set title(value)
    {
        this.titleTxt.text=value;
    }

    get title()
    {
        return this.titleTxt.text;
    }

    clickSelectBtn()
    {
        let dialog=remote.dialog;
        let self=this;
        if(this.type==0)
        {
            dialog.showOpenDialog({properties: ['openFile']},function(files)
            {
               if(files && files.length>0)self.path=files[0];
            });
        }
        else
        {
            dialog.showOpenDialog({properties: ['openDirectory']},function(files)
            {
                if(files && files.length>0)self.path=files[0];
            });
        }
    }
}

class Loading extends fairygui.GComponent
{
    constructor()
    {
        super();
    }


    constructFromResource()
    {
        super.constructFromResource();
        this.txt=this.getChild("txt");
    }

    set text(val)
    {
        this.txt.text=val;
    }
}

module.exports.MainWindow=MainWindow;
fairygui.UIObjectFactory.setPackageItemExtension(fairygui.UIPackage.getItemURL("base","PathItem"),PathItem);
fairygui.UIObjectFactory.setPackageItemExtension(fairygui.UIPackage.getItemURL("base","Loading"),Loading);