/**
 * Created by 75 on 2017/1/20.
 */
var verBuilder=require("../utils/utils.buildVersion");
class PublishPanel extends fairygui.GComponent
{
    constructor()
    {
        super();
        this.verCache={};
    }

    constructFromResource()
    {
        super.constructFromResource();
        this.tabList=this.getChild("tabList").asList;
        this.fromPath=this.getChild("fromPath").initPath("来源目录","",0);
        this.toPath=this.getChild("toPath").initPath("目标目录","",0);
        this.verTxt=this.getChild("verTxt").asTextInput;
        this.historyCombox=this.getChild("historyCombox").asComboBox;
        this.logTxt=this.getChild("logMc").asCom.getChild("title").asTextField;
        this.getChild("verBtn").onClick(this,this.clickVerBtn);
        this.getChild("publishBtn").onClick(this,this.clickPublishBtn);
        this.getChild("clearBtn").onClick(this,this.clickClearBtn);
        this.tabList.on(fairygui.Events.CLICK_ITEM,this,this.clickTabList);
        this.fromPath.on("pathChange",this,this.fromPathChange);
        this.toPath.on("pathChange",this,this.toPathChange);
        verBuilder.on(MyEvents.VER_BUILD_OVER,this,this.buildVerOver);
        verBuilder.on(MyEvents.VER_LOG,this,this.verLog);
        verBuilder.on(MyEvents.VER_COMPLETE,this,this.VerComplete)
    }

    get verName()
    {
        if(this.tabList.selectedIndex==-1)return "";
        return this.tabList.getChildAt(this.tabList.selectedIndex).text;
    }

    updatePanel()
    {
        this.updateOutList(this.tabList,ConfigData.publishCache.getList());
        this.updateContentPanel();
        this.updateVerHistory();
    }

    updateContentPanel()
    {
        this.currInfo= ConfigData.publishCache.getInfo(this.verName);
       if(this.currInfo)
       {
            this.fromPath.path=this.currInfo.from;
            this.toPath.path=this.currInfo.to;
       }
       else
       {
           this.fromPath.path="";
           this.toPath.path="";
       }
    }

    updateVerHistory()
    {
        let logVerPath=this.currInfo.to+"\\client-log\\ver";
        if(!fs.existsSync(logVerPath))
        {
            fs.mkdirSync(logVerPath);
        }
        let files=fs.readdirSync(logVerPath);
        let history=[];
        for(let i=0;i<files.length;i++)
        {
            if(files[i]=="new.ver")
            {
               var  preVer=fs.readFileSync(logVerPath+"//"+files[i]).toString();
            }
            else if(files[i].indexOf(".ver")!=-1)
            {
                history.push(files[i].replace(/\.ver/g,""));
            }
        }
        this.historyCombox.items=history;
        let index=history.indexOf(preVer);
        this.historyCombox.selectedIndex=index==-1?0:index;
    }


    updateOutList(list,dataList)
    {
        let len=Math.max(list.numItems,dataList.length+1);
        for(let i=0;i<len;i++ )
        {
            let item=i<list.numItems?list.getChildAt(i):null;
            if(i<dataList.length)
            {
                if(!item || item.constructor!=PublishTabBtn)
                {
                    item=list.addItem();
                    list.addChildAt(item,i);
                }
                item.text=dataList[i][0];
            }
            else if(i>=dataList.length)
            {
                while(list.numItems>i)
                {
                    item=list.getChildAt(i);
                    item.constructor==PublishTabBtn?list.removeChildAt(i):i++;
                }
                break;
            }
        }
        this.tabList.selectedIndex==-1 && this.tabList.numItems>0 && (this.tabList.selectedIndex=0);
    }

    clickVerBtn()
    {
        if(this.verTxt.text!="")
        {
            verBuilder.startVer(this.verTxt.text,this.historyCombox.text,this.currInfo);
        }
        else
        {
            alert("请填写版本号","系统提示");
        }
    }


    clickPublishBtn()
    {
        var verInfo=this.verCache[this.verName];
        if(verInfo)
        {
            verBuilder.publishVer(verInfo.add,verInfo.update,verInfo.unChange,verInfo.verInfo,this.currInfo,this.verTxt.text,this.toPath.isSvn);
        }
        else
        {
            alert("请先生成版本","系统提示");
            return;
        }
    }

    clickClearBtn()
    {
        this.logTxt.text="";
    }

    clickTabList(target,evt)
    {
        if(target.constructor!=PublishTabBtn)
        {
            ConfigData.publishCache.setInfo("New"+this.tabList.numItems,{});
            ConfigData.inst.saveConfig();
            this.updateOutList(this.tabList,ConfigData.publishCache.getList());
            this.tabList.selectedIndex=this.tabList.numItems-2;
        }
        else
        {
            this.updateContentPanel();
        }
    }

    fromPathChange()
    {
        let info=this.currInfo || {};
        info.from=this.fromPath.path;
        ConfigData.publishCache.setInfo(this.verName,info);
        this.currInfo=info;
        ConfigData.inst.saveConfig();
    }

    toPathChange()
    {
        let info=this.currInfo || {};
        info.to=this.toPath.path;
        ConfigData.publishCache.setInfo(this.verName,info);
        this.currInfo=info;
        ConfigData.inst.saveConfig();
    }


    buildVerOver(addList,updateList,unChangeList,newVerObj)
    {

        this.verCache[this.verName]={add:addList,update:updateList,unChange:unChangeList,verInfo:newVerObj};
        console.log(arguments);
    }

    verLog(log)
    {
        this.logTxt.text+=log;
    }

    VerComplete()
    {
        this.updateVerHistory();
        alert("版本提交结束","系统提示");
    }
}

class PublishTabBtn extends fairygui.GButton
{
    constructor()
    {
        super();
    }


    constructFromResource()
    {
        super.constructFromResource();
        this.titleTxt=this.getChild("title").asTextInput;
        this.titleTxt.on(Laya.Event.FOCUS,this,this.textFocus);
        this.titleTxt.on(Laya.Event.BLUR,this,this.focusOut);
        this.getChild("deleteBtn").onClick(this,this.clickDeleteBtn);
        this.titleTxt.touchable=false;
    }

    set selected(val)
    {
        super.selected=val;
        this.titleTxt.touchable=val;
    }

    get selected()
    {
        return super.selected;
    }

    textFocus()
    {
        this.currName=this.titleTxt.text;
    }

    focusOut()
    {
        if(this.currName!=this.titleTxt.text)
        {
            let info=ConfigData.publishCache.getInfo(this.currName);
            ConfigData.publishCache.deleteInfo(this.currName);
            ConfigData.publishCache.setInfo(this.titleTxt.text,info);
            ConfigData.inst.saveConfig();
        }
    }

    clickDeleteBtn()
    {

    }
}

fairygui.UIObjectFactory.setPackageItemExtension(fairygui.UIPackage.getItemURL("base","PublishPanel"),PublishPanel);
fairygui.UIObjectFactory.setPackageItemExtension(fairygui.UIPackage.getItemURL("base","PublishTabBtn"),PublishTabBtn);