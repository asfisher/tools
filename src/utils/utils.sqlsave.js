/**
 * Created by 75 on 2017/1/19.
 */
var Classes = Object.create(null);
module.exports.saveFile=function(rows,sqlInfo,paths,caller,callBack,tableInfo=null)
{
    let pathTool=loadClass("path");
    var saveList=[];
    var dataClass;
    tableInfo && (dataClass=getDataClass(tableInfo[0],sqlInfo,sqlInfo.outPackage,rows));
    if(dataClass)
    {
        dataClass[1]=pathTool.formatPath(dataClass[1],paths);
        saveList.push(dataClass);
    }
    if(sqlInfo.class)
    {
        let saveClass=loadClass(sqlInfo.class);
        saveClass(rows,sqlInfo,function(list)
        {
            let fs=loadClass("fs");
            for(let i=0;i<list.length;i++)
            {
                list[i][1]=pathTool.formatPath(list[i][1],paths);
                saveList.push(list[i]);
            }
            fs.saveFiles(list,callBack,caller);
        });
    }
    else if(sqlInfo.path)
    {
        let fs=loadClass("fs");
        saveList.push([JSON.stringify(rows),pathTool.formatPath(sqlInfo.path,paths)]);
        fs.saveFiles(saveList,callBack,caller);
    }
    else
    {
        callBack.apply(caller);
    }
}

function getDataClass(tableInfo,sqlInfo,package,rows)
{
    var tableNameList=tableInfo.Table.split("_");
    var clasName="";
    for(let i=0;i<tableNameList.length;i++)
    {
        clasName+=toUpHead(tableNameList[i]);
    }
    clasName+="Vo";
    var file="package "+package+"\n";
    file+="{\n";
    file+="\timport framework.data.BaseDataItem;\n";
    file+="\tpublic class "+clasName+" extends BaseDataItem\n";
    file+="\t{\n";
    file+="\t\tpublic function "+clasName+"(d:Object)\n";
    file+="\t\t{\n";
    file+="\t\t\tsuper(d);\n";
    file+="\t\t}\n";
    var valueHash={};
    if( sqlInfo.value)
    {
        for(let i=0;i<sqlInfo.value.length;i++)
        {
            valueHash[sqlInfo.value[i].name]=sqlInfo.value[i];
        }
    }

    var rec=RegExp(/`(\w+)`\s\b(\w+)\b(?:.*\sCOMMENT\s'(.*)')?/g);
    var result;
    while((result=rec.exec(tableInfo["Create Table"]))!=null)
    {
        let varName=result[1];
        if(rows[0] && !(varName in rows[0]))continue;
        var type=getVarType(result[2]);
        if(type=="String" && valueHash[varName])
        {
            if(valueHash[varName].type=="array")
            {
                type="Array";
            }
            else
            {
                type="Object";
            }
        }
        if(result[3])
        {
            file+="\t\t\/**"+result[3]+"*\/\n";
        }
        file+="\t\tpublic function get "+varName+"():"+type+"{return this['_"+toLowHead(varName)+"'];}\n\n";
    }

    file+="\t}\n\n}";
    var path="($dataLib)\/"+package.replace(/\./g,"\/")+"\/"+clasName+".as";
    return [file,path];
}


function getVarType(str)
{
    var type=str;
    switch (type[0])
    {
        case "int":
        case "tinyint":
            return "int";
        default:
            return "String";
    }
    return "String";
}

/**
 * 返回首字母大写
 * @param str
 * @return
 */
function toUpHead(str)
{
    var rst;
    if(str.length<=1) return str.toUpperCase();
    rst=str.charAt(0).toUpperCase()+str.substr(1);
    return rst;
}

/**
 * 返回首字母小写
 * @param str
 * @return
 */
function toLowHead(str)
{
    var rst="";
    if(str.length<=1) return str.toLowerCase();
    rst=str.charAt(0).toLowerCase()+str.substr(1);
    return rst;
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