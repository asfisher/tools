/**
 * Created by 75 on 2017/1/20.
 */
const fs=require("fs");
const buffer=require("buffer");
module.exports.packagetxt=function(toPath,fromPath)
{
    var fileList=[];
    var checkNum=0;
    var checkFile=function(checkPath)
    {
        let ss=fs.lstatSync(checkPath);
        if(ss.isDirectory())
        {
            if(checkPath.match(/\W+\.svn/g))return;
            checkNum++;
            var self=this;
            let files=fs.readdir(checkPath,function(err,files)
            {
                for(let i=0;i<files.length;i++)
                {
                    checkFile(checkPath+"\/"+files[i]);
                }
                checkNum--;
                if(checkNum<=0)
                {
                    console.log("总用时----"+(Date.now()-tt));
                    startLoadFile(fileList,fromPath[0],toPath);
                    //self.startMd5(self.filePathObj);
                }
            });
        }
        else
        {
            addPackFile(checkPath);
        }
    }

    var addPackFile=function(file)
    {
        fileList.push(file);
    }
    var tt=Date.now();
    fairygui.GRoot.inst.showModalWait("开始检索打包目录...");
    checkFile(fromPath[0]);
}

function startLoadFile(fileList,basePath,toPath)
{
    var fileObjHash={};
    var Buffer=buffer.Buffer;
    let loadNum=0;
    var loadNext=function()
    {
        if(loadNum<fileList.length)
        {
            fs.readFile(fileList[loadNum],function(err,data)
            {
                let buff=new Buffer(data);
                let fileName=fileList[loadNum].replace(basePath+"\/","");
                fileObjHash[fileName]=buff;
                loadNum++;
                loadNext();
            });
        }
        else
        {
            console.log("下载结束---耗时："+(Date.now()-tt));
            startPack(fileObjHash,toPath);
        }
    }
    var tt=Date.now();
    fairygui.GRoot.inst.showModalWait("开始加载打包文件...");
    loadNext();
}


function startPack(fileObj,toPath)
{

    let fileNameObj={};
    let indexP=0;
    for(let fileName in fileObj)
    {
        fileNameObj[fileName]=[indexP,fileObj[fileName].length];
        indexP+=fileObj[fileName].length;
    }
    var Buffer=buffer.Buffer;
    var nameBuffer=new Buffer(JSON.stringify(fileNameObj));
    var resultBuff=new Buffer(nameBuffer.length+indexP+4);
    resultBuff.writeUInt32BE(nameBuffer.length);
    nameBuffer.copy(resultBuff,4,0,fileNameObj.length);
    for(let fileName in fileObj)
    {
        fileObj[fileName].copy(resultBuff,4+nameBuffer.length+fileNameObj[fileName][0],0,fileNameObj[fileName][1]);
    }
    console.log("----");
    let zlib=require("zlib");
    var gzip = zlib.createDeflateRaw();
    fs.writeFileSync(toPath+".no",resultBuff);
    var inFile = fs.createReadStream(toPath+".no");
    var out = fs.createWriteStream(toPath);

    inFile.pipe(gzip).pipe(out);
    fs.unlinkSync(toPath+".no");
    fairygui.GRoot.inst.closeModalWait();
}