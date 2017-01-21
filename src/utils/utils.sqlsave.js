/**
 * Created by 75 on 2017/1/19.
 */
var Classes = Object.create(null);
module.exports.saveFile=function(rows,sqlInfo,paths,caller,callBack)
{
    let pathTool=loadClass("path");
    if(sqlInfo.class)
    {
        let saveClass=loadClass(sqlInfo.class);
        saveClass(rows,sqlInfo,function(list)
        {
            let fs=loadClass("fs");
            for(let i=0;i<list.length;i++)
            {
                list[i][1]=pathTool.formatPath(list[i][1],paths);
            }
            fs.saveFiles(list,callBack,caller);
        });
    }
    else if(sqlInfo.path)
    {
        let fs=loadClass("fs");
        fs.saveFiles([[JSON.stringify(rows),pathTool.formatPath(sqlInfo.path,paths)]],callBack,caller);
    }
    else
    {
        callBack.apply(caller);
    }
}


function loadClass(className) {
    var Class = Classes[className];

    if (Class !== undefined) {
        return Class;
    }

    // This uses a switch for static require analysis
    switch (className) {
        case 'fs':
            Class = require('./utils.fs.js');
          break;
        case "path":
            Class=require("./utils.path.js");
            break;
        default:
            Class = require('../../electron/sqlLib/sql.'+className+".js");
            break;
    }

    // Store to prevent invoking require()
    Classes[className] = Class;
    return Class;
}