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
        this.cache=null;
        this.pathVer=pathVer;
        this.preVer=preVer;
        this.verData=info;
        this.loadPreVer();
    }

    loadPreVer()
    {
        if(!fs.existsSync(this.verData.to+"\/ver"))
        {
            fs.mkdirSync(this.verData.to+"\/ver");
        }
        this.preVerObj=null;
        let verPath=this.verData.to+"\/ver\/"+this.preVer+".ver";
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
        while(count<20)
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
        let newVerObj=[];
        let unChangeList=[];
        let timeVer=Date.now();
        for(let fileName in md5Hash)
        {
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
        console.log(newVerObj);
        this.cache=[addList,updateList,unChangeList,newVerObj];
        this.event(MyEvents.VER_BUILD_OVER,[addList,updateList,newVerObj]);
        trace("完成总时间---"+(Date.now()-this.startT));
        fairygui.GRoot.inst.closeModalWait();
    }


    publishVer()
    {
        fairygui.GRoot.inst.showModalWait("复制文件中....");
        fs.writeFileSync("./unCopy.txt",this.cache[2].join("\r\n"),"utf8");
        var exec = require('child_process').exec;
        exec("echo f| xcopy /S/E/Y "+this.verData.from+" /exclude:unCopy.txt "+this.verData.to+"\\"+this.pathVer+"\\",{"encoding":"usc2"},function(err,stdout,stderr)
        {
            var iconv = require('iconv-lite');

            if(err)
            {

            }
            else
            {
                fairygui.GRoot.inst.closeModalWait();
            }
            // stderr &&(stderr=iconv.decode(stderr.message,"gbk"))&& (self.outTxt.text+=stderr);
        });
    }
}



module.exports=new VersionFactory();
