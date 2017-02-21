/**
 * Created by 75 on 2016/12/29.
 */
const sqlSave=require("../utils/utils.sqlsave.js");
class ExportDataPanel extends fairygui.GComponent
{
    constructor()
    {
        super();
        this.fromSelect=0;
        this.toSelect=0;
        this.sqlInfoCahche={};
    }

    constructFromResource()
    {
        super.constructFromResource();
        this.getChild("exportBtn").onClick(this,this.clickExportBtn);
        this.getChild("unpackBtn").onClick(this,this.clickUnpackBtn);
        this.getChild("packBtn").onClick(this,this.clickPackBtn)
        this.sqlList=this.getChild("sqlList").asList;
        this.fromList=this.getChild("fromList").asList;
        this.toList=this.getChild("toList").asList;
        this.fromList.on(fairygui.Events.CLICK_ITEM,this,this.clickFromList);
        this.toList.on(fairygui.Events.CLICK_ITEM,this,this.clickToList);
    }

    updatePanel()
    {
        this.updateOutList(this.fromList,ConfigData.inst.exportCache.fromList,0);
        this.fromList.selectedIndex=this.fromSelect;

        this.updateSqlList();
        this.updateToList();
    }

    updateOutList(list,dataList,type)
    {
        let len=Math.max(list.numItems,dataList.length+1);
        for(let i=0;i<len;i++ )
        {
            let item=i<list.numItems?list.getChildAt(i):null;
            if(i<dataList.length)
            {
                if(!item || item.constructor!=ExportTabBtn)
                {
                    item=list.addItem();
                    list.addChildAt(item,i);
                }
                item.text=dataList[i][0];
                item.type=type;
            }
            else if(i>=dataList.length)
            {
                while(list.numItems>i)
                {
                    item=list.getChildAt(i);
                    item.constructor==ExportTabBtn?list.removeChildAt(i):i++;
                }
                break;
            }
        }
    }

    showExportFromSet(d=null,key="")
    {
        if(!this.exportFromSet)this.exportFromSet=fairygui.UIPackage.createObject("base","ExportFromSet",ExportFromSet);
        this.exportFromSet.showPanel(d,key);
        this.exportFromSet.show();
    }

    showExportToSet(d=null,key="")
    {
        if(!this.exportToSet)this.exportToSet=fairygui.UIPackage.createObject("base","ExportFromSet",ExportToSet);
        this.exportToSet.setData(this.sqlInfoCahche[ConfigData.inst.exportCache.selectInfo.sql]);
        this.exportToSet.showPanel(d,key);
        this.exportToSet.show();
    }

    updateSqlList()
    {
        this.fromList.getChildAt(this.fromSelect) && ConfigData.inst.exportCache.setFromSelect(this.fromList.getChildAt(this.fromSelect).text);
        let selectInfo=ConfigData.inst.exportCache.selectInfo;
        if(selectInfo && selectInfo.sql!="")
        {
            if(this.sqlInfoCahche[selectInfo.sql]==null)
            {
                fairygui.GRoot.inst.showModalWait("加载sql配置");
                Laya.loader.load(selectInfo.sql,Laya.Handler.create(this,this.SqlLoadComplete));
            }
            else
            {
                let dataList=this.sqlInfoCahche[selectInfo.sql].sqlList;
                let list=this.sqlList;
                let len=Math.max(list.numItems,dataList.length);
                for(let i=0;i<len;i++)
                {
                    let item=i<list.numItems?list.getChildAt(i):null;
                    if(i<dataList.length)
                    {
                        if(!item)
                        {
                            item=list.addItem();
                            item.onSqlListener(this,this.doSqlBack);
                            list.addChildAt(item,i);
                        }
                        item.text=dataList[i].name;
                        item.selected=true;
                        item.sqlInfo=dataList[i];
                    }
                    else if(i>=dataList.length)
                    {
                        list.removeChild(item,true);
                        while(list.numItems>i)
                        {
                            list.removeChildAt(i);
                        }
                        break;
                    }
                }
            }
        }
    }

    updateToList()
    {
        this.updateOutList(this.toList,ConfigData.inst.exportCache.toList,1);
        this.toList.selectedIndex=this.toSelect;
        this.toList.getChildAt(this.toSelect) && ConfigData.inst.exportCache.setToSelect(this.toList.getChildAt(this.toSelect).text);
    }

    SqlLoadComplete(txt)
    {
        fairygui.GRoot.inst.closeModalWait();
        let yml=require("js-yaml");
        this.sqlInfoCahche[ConfigData.inst.exportCache.selectInfo.sql]=yml.load(txt);
        this.updateSqlList();
    }


    clickExportBtn()
    {
        let selectInfo=ConfigData.inst.exportCache.selectInfo;
        if(!selectInfo)return;
        let toInfo=ConfigData.inst.exportCache.selectToInfo;
        if(!toInfo)return;
        var Mysql=require("../utils/utils.sql.js").Mysql;
        this.sql=new Mysql(selectInfo);
        this.index=-1;
        Laya.timer.loop(1000,this,this.doFrame);
        this.wait=true;
        this.doFrame();
    }

    doFrame()
    {
        this.startTime=Date.now();
        this.wait && !(this.wait=false) && this.doNextSql();
    }

    doNextSql()
    {
        this.index++;
        if(this.index<this.sqlList.numItems)
        {
            if(Date.now()-this.startTime>400)
            {
                this.index--;
                this.wait=true;
                return;
            }
            let item=this.sqlList.getChildAt(this.index);
            if(item.selected)
            {
                this.tt=Date.now();
                fairygui.GRoot.inst.showModalWait("开始导出:"+item.sqlInfo.name);
                item.startSql(this.sql);
            }
            else
            {
                this.doNextSql();
            }
        }
        else
        {
            this.sql.end();
            fairygui.GRoot.inst.closeModalWait();
            this.sql=null;
        }
    }

    doSqlBack(rows,tableInfo)
    {
        if(this.index>=0)
        {
            let item=this.sqlList.getChildAt(this.index);
            sqlSave.saveFile(rows,item.sqlInfo,ConfigData.inst.exportCache.selectToInfo,this,this.doNextSql,tableInfo);
        }
    }

    clickUnpackBtn()
    {

    }

    clickPackBtn()
    {
        let pathTool=require("../utils/utils.path.js");
        let pack=require("../utils/utils.package.js").packagetxt;
        let selectInfo=ConfigData.exportCache.selectInfo;
        let selectToInfo=ConfigData.exportCache.selectToInfo;
        let toPath=pathTool.formatPath(this.sqlInfoCahche[selectInfo.sql].export.toPath,selectToInfo);
        let fromPath=this.sqlInfoCahche[selectInfo.sql].export.path.concat();
        for(let i=0;i<fromPath.length;i++)
        {
            fromPath[i]=pathTool.formatPath(fromPath[i],selectToInfo);
        }
        pack(toPath,fromPath);
    }

    clickFromList(target,evt)
    {
        if(target.constructor!=ExportTabBtn)
        {
            this.fromList.selectedIndex=this.fromSelect;
            this.showExportFromSet();
        }
        else if(evt.target.$owner.name=="setBtn")
        {
            this.showExportFromSet(ConfigData.inst.exportCache.getFrom(target.text),target.text);
        }
        else
        {
            this.fromSelect=this.fromList.selectedIndex;
           this.updateSqlList();
           this.updateToList();
        }
    }

    clickToList(target,evt)
    {
        if(target.constructor!=ExportTabBtn)
        {
            this.toList.selectedIndex=this.toSelect;
            this.showExportToSet();
        }
        else if(evt.target.$owner.name=="setBtn")
        {
            this.showExportToSet(ConfigData.inst.exportCache.getExportInfo(target.text),target.text);
        }
        else
        {
            this.toSelect=this.toList.selectedIndex;
            this.toList.getChildAt(this.toSelect) && ConfigData.inst.exportCache.setToSelect(this.toList.getChildAt(this.toSelect).text);
        }
    }
}


class ExportTabBtn extends fairygui.GButton
{
    constructor()
    {
        super();
    }

    constructFromResource()
    {
        super.constructFromResource();
        this.getChild("deleteBtn").onClick(this,this.clickDeleteBtn);
        this.getChild("setBtn").onClick(this,this.clickSetBtn)
    }



    clickDeleteBtn(e)
    {
        if(this.type==0)
        {
            ConfigData.inst.exportCache.deleteFrom(this.text);
        }
        else
        {
            ConfigData.inst.exportCache.deleteExport(this.text);
        }
        ConfigData.inst.saveConfig();
        this.removeFromParent();
        e.stopPropagation();
    }
}


class ExportFromSet extends fairygui.Window
{
    constructor()
    {
        super();
    }


    constructFromResource()
    {
        super.constructFromResource();
        let sqlPathList=this.getChild("pathList");
        this.nameTxt=sqlPathList.getChildAt(0).initPath("配置名称:","",1)
        this.sqlPath=sqlPathList.getChildAt(1).initPath("sql","",0);
        this.dbHost=sqlPathList.getChildAt(2).initPath("host","",1);
        this.user=sqlPathList.getChildAt(3).initPath("user","",1);
        this.pwd=sqlPathList.getChildAt(4).initPath("pwd","",1);
        this.dbName=sqlPathList.getChildAt(5).initPath("db","",1);
        this.port=sqlPathList.getChildAt(6).initPath("port","3306",1);
        this.getChild("saveBtn").onClick(this,this.clickSaveBtn);
        this.getChild("cancelBtn").onClick(this,this.clickCancelBtn);
    }

    showPanel(d,key)
    {
        if(d)
        {
            this.nameTxt.path=key;
            this.sqlPath.path=d.sql;
            this.dbHost.path=d.host;
            this.user.path=d.user;
            this.pwd.path=d.password;
            this.dbName.path=d.database;
            this.port.path=d.port;
        }
        else
        {
            this.nameTxt.path="";
            this.sqlPath.path="";
            this.dbHost.path="";
            this.user.path="";
            this.pwd.path="";
            this.dbName.path="";
            this.port.path="";
        }
    }

    show()
    {
        this.showMask();
        super.show();
        this.x=(Laya.stage.width-this.width)/2;
        this.y=(Laya.stage.height-this.height)/2;
    }

    showMask()
    {
        !this.bgMask && (this.bgMask=new fairygui.GGraph());
        this.bgMask.drawRect(0,'#000000','rgba(0,0,0,0.1)');
        this.bgMask.width=Laya.stage.width;
        this.bgMask.height=Laya.stage.height;
        fairygui.GRoot.inst.addChild(this.bgMask);
    }

    hide()
    {
        this.bgMask.removeFromParent();
        super.hide();
    }

    clickSaveBtn()
    {
        let key=this.nameTxt.path;
        if(key!="")
        {
            let fromInfo={};
            fromInfo.sql=this.sqlPath.path;
            fromInfo.host=this.dbHost.path;
            fromInfo.user=this.user.path;
            fromInfo.password=this.pwd.path;
            fromInfo.database=this.dbName.path;
            fromInfo.port=this.port.path;
            ConfigData.inst.exportCache.setFrom(key,fromInfo);
            ConfigData.inst.saveConfig();
            this.hide();
        }
    }


    clickCancelBtn()
    {
        this.hide();
    }
}


class ExportToSet extends fairygui.Window
{
    constructor()
    {
        super();
    }

    constructFromResource()
    {
        super.constructFromResource();
        this.pathList=this.getChild("pathList").asList;
        this.nameTxt=this.pathList.getChildAt(0);
        this.nameTxt.initPath("配置名称:","",1)
        for(let i=1;i<this.pathList.numItems;i++)
        {
            let item=this.pathList.getChildAt(i);
            item.initPath("","",2);
        }
        this.getChild("saveBtn").onClick(this,this.clickSaveBtn);
        this.getChild("cancelBtn").onClick(this,this.clickCancelBtn);
    }

    showPanel(d,key)
    {
        if(d)
        {
            this.nameTxt.path=key;
            for(let i=1;i<this.pathList.numItems;i++)
            {
                let item=this.pathList.getChildAt(i);
                let title=d[item.title]
                item.path=title;
            }
        }
        else
        {
            this.nameTxt.path="";
            for(let i=1;i<this.pathList.numItems;i++)
            {
                let item=this.pathList.getChildAt(i);
                item.path="";
            }
        }
    }

    show()
    {
        this.showMask();
        super.show();
        this.x=(Laya.stage.width-this.width)/2;
        this.y=(Laya.stage.height-this.height)/2;
    }


    setData(d)
    {
        if(d && d.paths)
        {
            let i=0;
            for(i=1;i<=d.paths.length;i++)
            {
                let item=this.pathList.getChildAt(i);
                item.title=d.paths[i-1];
            }
            for(;i<this.pathList.numItems;i++)
            {
                let item=this.pathList.getChildAt(i);
                item.title="";
            }
        }
        else
        {
            for(let i=1;i<this.pathList.numItems;i++)
            {
                let item=this.pathList.getChildAt(i);
                item.title="";
            }
        }
    }

    showMask()
    {
        !this.bgMask && (this.bgMask=new fairygui.GGraph());
        this.bgMask.drawRect(0,'#000000','rgba(0,0,0,0.1)');
        this.bgMask.width=Laya.stage.width;
        this.bgMask.height=Laya.stage.height;
        fairygui.GRoot.inst.addChild(this.bgMask);
    }

    hide()
    {
        this.bgMask.removeFromParent();
        super.hide();
    }

    clickSaveBtn()
    {
        let key=this.nameTxt.path;
        if(key!="")
        {
            let toInfo={};
            for(let i=1;i<this.pathList.numItems;i++)
            {
                let item=this.pathList.getChildAt(i);
                if(item.title!="")
                {
                    toInfo[item.title]=item.path;
                }
            }
            ConfigData.inst.exportCache.setExportInfo(key,toInfo);
            ConfigData.inst.saveConfig();
            this.hide();
        }
    }


    clickCancelBtn()
    {
        this.hide();
    }
}





class SqlSelectItem extends fairygui.GButton
{
    constructor()
    {
        super();
    }

    constructFromResource() {
        super.constructFromResource();
        (this.getChild("title").displayObject).wordWrap=false;
    }

    startSql(mysql)
    {
        let self=this;
        mysql.doSql(this.sqlInfo.sql,Laya.Handler.create(this,this.sqlBack),this.sqlInfo.value,this.sqlInfo.outPackage);
    }

    sqlBack(rows,tableInfo)
    {
        this.displayObject.event("sql_back",[rows,tableInfo]);
    }



    onSqlListener(caller,listener)
    {
        this.on("sql_back",caller,listener);
    }
}

fairygui.UIObjectFactory.setPackageItemExtension(fairygui.UIPackage.getItemURL("base","ExportPanel"),ExportDataPanel);
fairygui.UIObjectFactory.setPackageItemExtension(fairygui.UIPackage.getItemURL("base","ExportTabBtn"),ExportTabBtn);
fairygui.UIObjectFactory.setPackageItemExtension(fairygui.UIPackage.getItemURL("base","SqlSelectBtn"),SqlSelectItem);