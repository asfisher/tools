/**
 * Created by 75 on 2017/1/9.
 */
const fs=require("fs");
const crypto = require('crypto');
class VersionFactory extends Laya.EventDispatcher
{
    constructor()
    {
        super();
    }


    startVer(pathVer,preVer,info)
    {
        fairygui.GRoot.inst.showModalWait("开始检查文件");
        this.pathVer=pathVer;
        this.preVer=preVer;
        this.verData=info;
        this.loadPreVer();
    }

    loadPreVer()
    {
        let logVerPath=this.verData.to+"\\client-log\\ver";
        if(!fs.existsSync(logVerPath))
        {
            fs.mkdirSync(logVerPath);
        }
        this.preVerObj=null;
        let verPath=logVerPath+"\\"+this.preVer+".ver";
        if(fs.existsSync(verPath))
        {
            try
            {
                this.preVerObj=JSON.parse(fs.readFileSync(verPath));
            }
            catch(e)
            {
                this.preVerObj={};
            }
        }
        else
        {
            this.preVerObj={};
        }
        this.buildNewVer();
    }

    buildNewVer()
    {
        this.filePathObj={};
        this.md5Hash={};
        this.fileNum=0;
        this.startT = Date.now();
        this.checkNum=0;
        this.checkFile(this.verData.from);
    }

    checkFile(checkPath)
    {
        let ss=fs.lstatSync(checkPath);
        if(ss.isDirectory())
        {
            if(checkPath.match(/\W+\.svn/g))return;
            this.checkNum++;
            var self=this;
            let files=fs.readdir(checkPath,function(err,files)
            {
                for(let i=0;i<files.length;i++)
                {
                    self.checkFile(checkPath+"\/"+files[i]);
                }
                self.checkNum--;
                if(self.checkNum<=0)
                {
                    self.startMd5(self.filePathObj);
                }
            });
        }
        else
        {
            this.addPackFile(checkPath);
        }
    }


    addPackFile(path)
    {
        path=path.replace(/\//g,"\\");
        var fileName=path.replace(this.verData.from+"\\","");
        this.fileNum++;
        this.filePathObj[fileName]=path;
    }

    startMd5(filePathObj)
    {
        this.md5List=[];
        for(let fileName in filePathObj)
        {
            this.md5List.push(filePathObj[fileName],fileName);
        }
        let count=0
        this.md5Index=-2;
        if(this.md5List.length==0)
        {
            fairygui.GRoot.inst.closeModalWait();
            alert("没有找到文件","系统提示");
            return;
        }
        while(count<20 && count<this.md5List.length)
        {
            count++;
            this.md5Index+=2;
            this.doNextMd5();
        }
    }

    doNextMd5()
    {
        if(this.fileNum>0)
        {
            this.md5List[this.md5Index] && this.getMd5(this.md5List[this.md5Index],this.md5List[this.md5Index+1])
        }
        else
        {
            this.makeVerFile(this.md5Hash);
        }
    }

    getMd5(path,fileName) {
        fairygui.GRoot.inst.showModalWait("开始生成md5----"+fileName+"  "+parseInt((this.md5List.length/2-this.fileNum)/this.md5List.length*2*100)+"%");
        var md5sum = crypto.createHash('md5');
        var stream = fs.createReadStream(path);
        stream.on('data', function (chunk) {
            md5sum.update(chunk);
        });
        var self = this;
        stream.on('end', function () {
            let str = md5sum.digest('hex').toUpperCase();
            self.fileNum--;
            self.md5Hash[fileName] = str;
            self.md5Index+=2;
            self.doNextMd5();
        });
    }

    makeVerFile(md5Hash)
    {
        let addList=[];
        let updateList=[];
        let newVerObj={};
        let unChangeList=[];
        let timeVer=Date.now();
        for(let fileName in md5Hash)
        {
            fileName=fileName.replace(/\\/g,"\/");
            let preInfo=this.preVerObj[fileName];
            if(preInfo)
            {
                if(preInfo.md5!=md5Hash[fileName])
                {
                    updateList.push(fileName);
                    preInfo.md5=md5Hash[fileName];
                    preInfo.ver=this.pathVer;
                    preInfo.time=timeVer;
                }
                else
                {
                    unChangeList.push(fileName);
                }
                newVerObj[fileName]=preInfo;
            }
            else
            {
                addList.push(fileName);
                newVerObj[fileName]={"md5":md5Hash[fileName],"ver":this.pathVer,"time":timeVer};
            }
        }
        newVerObj.currVerTime=timeVer;
        console.log(newVerObj);
        this.event(MyEvents.VER_BUILD_OVER,[addList,updateList,unChangeList,newVerObj]);


        this.showLog(this.getVerLog(addList,updateList));
        trace("完成总时间---"+(Date.now()-this.startT));
        fairygui.GRoot.inst.closeModalWait();
    }


    publishVer(addList,updateList,unChangeList,newVerObj,verData,ver,autoCommit=false)
    {
        if(addList.length==0 && updateList.length==0)
        {
            alert("文件无变更","系统提示");
            return;
        }
        var copyFiles=function()
        {
            fairygui.GRoot.inst.showModalWait("复制文件中....");
            self.showLog("\n\r\n\r开始复制文件-------\n\r");
            fs.writeFileSync("./unCopy.txt",unChangeList.join("\r\n").replace(/\//g,"\\"),"utf8");
            exec("echo f| xcopy /S/E/Y "+verData.from+" /exclude:unCopy.txt "+verData.to+"\\client\\"+ver+"\\",{"encoding":"usc2","maxBuffer":5000*1024},function(err,stdout,stderr)
            {
                var iconv = require('iconv-lite');

                if(err)
                {
                    alert(err.message,"copy文件挂了");
                }
                else
                {
                    self.showLog(iconv.decode(stdout,"gbk"));
                    buildVerFile();
                }
            });
        }

        var buildVerFile=function()
        {
            fairygui.GRoot.inst.showModalWait("开始生成版本文件....");
            let timeVerInfo={};
            let fileVerInfo={};
            for(var fileName in newVerObj)
            {
                if(fileName=="currVerTime")continue;
                timeVerInfo[fileName]=newVerObj[fileName].time;
                fileVerInfo[fileName]=newVerObj[fileName].ver;
            }

            var verJs="";
            verJs+="var timeV="+JSON.stringify(timeVerInfo)+";\n\r";
            verJs+="var ver="+JSON.stringify(fileVerInfo)+";\n\r";
            myFs.saveFiles([[verJs,verData.to+"\\client\\ver\\Ver_"+ver+"."+timeVer+".js"],[JSON.stringify(newVerObj),verData.to+"\\client-log\\ver\\"+ver+".ver"]],function()
            {
                compressJs();
            });
        }

        var compressJs=function()
        {
            var jsCompress=require("./utils.jsCompress.js");
            for(var i=0;i<addList.length;i++)
            {
                if(addList[i].match(/\S+\.js$/g)) jsList.push(verData.to+"\\client\\"+ver+"\\"+addList[i]);
                if(addList[i].match(/\S+\.png$/g)) pngList.push(verData.to+"\\client\\"+ver+"\\"+addList[i]);
            }
            for(i=0;i<updateList.length;i++)
            {
                if(updateList[i].match(/\S+\.js$/g)) jsList.push(verData.to+"\\client\\"+ver+"\\"+updateList[i]);
                if(updateList[i].match(/\S+\.png$/g)) pngList.push(verData.to+"\\client\\"+ver+"\\"+updateList[i]);
            }
            jsCompress.compress(jsList,compressPng);
        }

        var compressPng=function()
        {
            var pngCompress=require("./utils.pngCompress.js");
            pngCompress.compress(pngList,saveLogFile);
        }

        var saveLogFile=function()
        {
            fairygui.GRoot.inst.showModalWait("保存日志文件....");
            let date=new Date(timeVer);
            myFs.save(self.getVerLog(addList,updateList),verData.to+"\\client-log\\log\\"+date.getFullYear()+"-"+date.getMonth()+"-"+date.getDay()+"\\"+timeVer+".ver","utf-8",function()
            {
                fs.writeFileSync(verData.to+"\\client-log\\ver\\new.ver",ver);
               commitToSvn();
            });
        }

        var commitToSvn=function()
        {
            fairygui.GRoot.inst.showModalWait("提交svn....");
            if(autoCommit)
            {
                var svn=require("./utils.svn");
                svn.add([verData.to+"\\client",verData.to+"\\client-log"],function()
                {
                    svn.commit([verData.to+"\\client",verData.to+"\\client-log"],function()
                    {
                        self.event(MyEvents.VER_COMPLETE);
                        fairygui.GRoot.inst.closeModalWait();
                    },"发布版本"+ver+"."+timeVer,self.showLog.bind(self));
                },self.showLog.bind(self));
            }
           else
            {
                fairygui.GRoot.inst.closeModalWait();
                alert("发布目录不是svn目录，请自行提交到发布svn目录","系统提示");
            }
        }

        var exec = require('child_process').exec;
        var myFs=require("../utils/utils.fs");
        var self=this;
        var timeVer=newVerObj["currVerTime"];
        var pngList=[];
        var jsList=[];
        copyFiles();
    }



    showLog(log)
    {
        this.event(MyEvents.VER_LOG,log);
    }

    getVerLog(addList,updateList)
    {
        var log="原版本:"+this.preVer+" 更新版本:"+this.pathVer+"\r\n";
        log+="新增文件:"+addList.length+"个";
        log+="更新文件:"+updateList.length+"个\r\n";
        if(addList.length>0)
        {
            log+="新增"+addList.join("\r\n新增");
        }
        if(updateList.length>0)
        {
            log+="更新"+updateList.join("\r\n更新");
        }
        return log;
    }
}



module.exports=new VersionFactory();
