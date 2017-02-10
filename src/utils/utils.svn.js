/**
 * Created by 75 on 2017/2/7.
 */
var execBase = require('child_process').exec
var iconv=require("iconv-lite");
class SvnClient
{
    constructor()
    {

    }

    checkOut(path,url,callback)
    {
        this.exec("svn checkout "+url+" "+path,function(error,stdout,stderr)
        {
            if(error!=null)
            {
                callback(stdout);
            }
        });
    }

    update(path,callBack)
    {
        this.exec("svn update "+path,function(error,stdout,stderr)
        {
            if(error!=null)
            {
                callback(stdout);
            }
        });
    }


    commit(path,callBack,msg=null,updateFunc=null)
    {
        var cmdArr=[];
        if(path instanceof Array)
        {
            var cmd=["svn","commit"];
            var index=0;
            for(let i=0;i<path.length;i++)
            {
                index++;
                cmd.push(path[i]);
                if(index>=15)
                {
                    index=0;
                    cmd.push(" -m ",msg);
                    cmdArr.push(cmd.join(" "));
                    cmd=["svn", "commit"];
                }
            }

            if(cmd.length>2)
            {
                cmd=cmd.concat(["-m",msg]);
                cmdArr.push(cmd.join(" "));
            }
        }
        else
        {
            cmdArr=["svn commit "+path+" -m "+msg];
        }
        this.execs(cmdArr,callBack,updateFunc);
    }

    add(path,callBack=null,updateFunc=null)
    {
        var cmdArr=[];
        if(path instanceof Array)
        {
            var cmd=["svn","add","--force"];
            var index=0;
            for(let i=0;i<path.length;i++)
            {
                index++;
                cmd.push(path[i]);
                if(index>=15)
                {
                    index=0;
                    cmd.push(" -m ",msg);
                    cmdArr.push(cmd.join(" "));
                    cmd=["svn", "add","--force"];
                }
            }

            if(cmd.length>2)
            {
                cmdArr.push(cmd.join(" "));
            }
        }
        else
        {
            cmdArr=["svn add --force "+path];
        }
        this.execs(cmdArr,callBack,updateFunc);
    }


    execs(cmds,endFunc,updateFunc=null)
    {
        var index=0;
        var self=this;
        var doNextCmd=function()
        {
            if(index<cmds.length)
            {
                self.exec(cmds[index],function(error,stdout,stderr)
                {
                    iconv.skipDecodeWarning=true;
                    updateFunc && updateFunc(iconv.decode(stdout,"gbk"));
                    if(error)alert(error.message,"系统错误");
                    index++;
                    doNextCmd();
                });
            }
           else
            {
                endFunc();
            }
        }
        doNextCmd();
    }

    exec(cmd,callBack)
    {
        execBase(cmd,{"encoding":"binary"},callBack);
    }
}

module.exports=new SvnClient();