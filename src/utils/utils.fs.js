/**
 * Created by 75 on 2017/1/3.
 */
const fs=require("fs");
var add=0;
var saveFiles=function(list,callBack=null,caller=null)
{
    let index=-1;
    saveNext();
    function saveNext()
    {
        index++;
        if(index<list.length)
        {
            let fileInfo=list[index];
            let data=fileInfo[0];
            let path=fileInfo[1];
            let code=fileInfo[2]?fileInfo[2]:'utf8';
            saveSync(data,path,code,saveNext);
        }
        else if(callBack!=null)
        {
            callBack.apply(caller);
        }
    }
}

var saveSync=function(data,path,code='utf8',callBack=null)
{
    path=path.replace(/\\/g,"\/")
    fs.open(path,"w+",function(err,fd)
    {
        if(err)
        {
            let dicPath=path.substring(0,path.lastIndexOf("\/"));
            fullPath(dicPath);
        }
        let tt=Date.now();
        fs.writeFile(
            path,
            data,
            code,
            function(e)
            {
                fd && fs.close(fd,callBack);
                !fd && callBack();
            }
        );
    });
}
var fullPath=function(path)
{
    if(!fs.existsSync(path))
    {
        let dicPath=path.substring(0,path.lastIndexOf("\/"));
        fullPath(dicPath)
        fs.mkdirSync(path);
    }
}

var save=function(data,path,code='utf8',callBack=null)
{
    fs.open(path,"w+",function(err,fd)
    {
        if(err)
        {
            let dicPath=err.path.substring(0,err.path.lastIndexOf("\\"));
            if(!fs.existsSync(dicPath))
            {
                fs.mkdirSync(dicPath);
            }
        }
        fs.writeFile(path,data,code,function(err)
            {
                if(err)console.log(err);
                else
                {
                    if(callBack!=null)
                    {
                        callBack.run();
                    }
                }
            });
    });
}
module.exports.save=saveSync;
module.exports.saveFiles=saveFiles;
