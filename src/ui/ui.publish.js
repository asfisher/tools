/**
 * Created by 75 on 2017/1/20.
 */
class PublishPanel extends fairygui.GComponent
{
    constructor()
    {
        super();
    }

    constructFromResource()
    {
        super.constructFromResource();
        this.tabList=this.getChild("tabList");
        this.fromPath=this.getChild("fromPath").initPath("来源目录","",0);
        this.toPath=this.getChild("toPath").initPath("目标目录","",0);
        this.verTxt=this.getChild("verTxt").asTextInput;
        this.historyCombox=this.getChild("historyCombox").asComboBox;
        this.logTxt=this.getChild("logMc").asCom.getChild("title").asTextField;
        this.getChild("verBtn").onClick(this,this.clickVerBtn);
        this.getChild("publishBtn").onClick(this,this.clickPublishBtn);
        this.getChild("clearBtn").onClick(this,this.clickClearBtn)
    }

    updatePanel()
    {

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

    clickVerBtn()
    {

    }


    clickPublishBtn()
    {

    }

    clickClearBtn()
    {

    }
}

class PublishTabBtn extends fairygui.GButton
{
    constructor()
    {
        super();
    }


}

fairygui.UIObjectFactory.setPackageItemExtension(fairygui.UIPackage.getItemURL("base","PublishPanel"),PublishPanel);