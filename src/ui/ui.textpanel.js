/**
 * Created by 75 on 2017/2/7.
 */
var execBase = require('child_process').exec
class TestPanel extends fairygui.GComponent
{
    constructor()
    {
        super();
    }

    constructFromResource()
    {
        super.constructFromResource();
        this.inputTxt=this.getChild("inputTxt");
        this.outTxt=this.getChild("outTxt");
        this.getChild("doBtn").onClick(this,this.clickDoHandler);
        this.getChild("clearBtn").onClick(this,this.clickClear)
    }

    clickDoHandler()
    {
        // exec(this.inputTxt.text,function(error,stdout,stderr)
        // {
        //     console.log("stdout:"+stdout);
        //     console.log("error:"+error);
        // })

//         var svn=require("../utils/utils.svn");
//         var Buffer=require("buffer").Buffer;
// ;        var iconv=require("iconv-lite");
//         svn.execs(["ll","dir"],
//             function(stdout)
//             {
//                 console.log(stdout);
//             },
//             function(stdout)
//             {
//                 console.log(stdout);
//             });

        var str=this.inputTxt.text;
        var rec=RegExp(/`(\w*)` ([\w()',]*) .*(?:COMMENT\s'(.*)')/g);
        var result;
        while((result=rec.exec(str))!=null)
        {
            console.log(result);
        }
        // console.log(str.match(/`(\w*)` .*COMMENT\s'(.*)'/g));
    }

    clickClear()
    {

    }
}

fairygui.UIObjectFactory.setPackageItemExtension(fairygui.UIPackage.getItemURL("base","TestPanel"),TestPanel);