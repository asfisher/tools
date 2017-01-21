/**
 * Created by 75 on 2017/1/20.
 */
module.exports=function(rows,sqlInfo,saveFunc)
{
    var hash={};
    var fontHash={};
    var list=[];
    var addFont=function(lang,font,value)
    {
        if(!font)return;
        if(!fontHash[lang])
        {
            fontHash[lang]={};
        }
        if(fontHash[lang][font]==null)fontHash[lang][font]="";
        fontHash[lang][font]+=value;
    }
    var add=function(lang,key,value)
    {
        if(!hash[lang])
        {
            hash[lang]={};
        }
        hash[lang][key]=value;
    }
    var save=function(data,path,code='utf8')
    {
        list.push([data,path,code]);
    }
    var file="package\n";
    file+="{\n";
    file+="\tpublic dynamic class Lang\n";
    file+="\t{\n";
    file+="\t\tprivate var _obj:Object;\n\n";
    file+="\t\tpublic function setData(obj:Object):void\n";
    file+="\t\t{\n";
    file+="\t\t\t_obj=obj;\n";
    file+="\t\t\tfor(var key:* in _obj)\n";
    file+="\t\t\t{\n";
    file+="\t\t\t\tthis[key]=_obj[key];\n";
    file+="\t\t\t}\n";
    file+="\t\t}\n\n";
    var keyArr=[];
    var lanList=["Cn","Vn","En"];
    for(let rowNum=0;rowNum<rows.length;rowNum++)
    {
        let obj=rows[rowNum];
        var key="";
        if(obj.Class == "Game")//导出Lang类。
        {
            key = obj.Module + "_" + obj.Prop + "_" + obj.ModuleID;
            file += "\t\t/**\n";
            file += "\t\t * " + obj.Cn + "\n" ;
            file += "\t\t * */\n";
            file += "\t\tpublic var "+obj.Module + "_" + obj.Prop + "_" + obj.ModuleID + ":String = \"" + (obj.Cn?obj.Cn.replace(/\"/g,"\\\""):obj.Cn) + "\";\n\n";
        }
        else if(obj.Class == "Sql")
        {
            key = obj.Module + "_" + obj.Prop + "_" + obj.ModuleID;
        }
        else if(obj.Class=="Error")
        {
            key = obj.Module + "_"  + obj.ModuleID;
        }

        if (keyArr.indexOf(key) == -1)
        {
            keyArr.push(key);
        }
        else
        {
            _nonono=false;
            _noMsg="Language2表有重复：Class=" + obj.Class + ",key=" + key;
        }


        if(obj.Font!="")
        {
            for(var i=0;i<lanList.length;i++)
            {
                addFont(lanList[i],obj.Font,obj[lanList[i]]);
            }
        }

        //导出文字语言包。按语言导出不同的包。
        for(i=0;i<lanList.length;i++)
        {
            add(lanList[i],key,obj[lanList[i]]);
            if(obj.Prop=="Tips")
            {
                try
                {
                    if(obj.Cn.indexOf("title")!=-1)
                    {
                        JSON.parse(obj[lanList[i]]);
                    }
                }
                catch(e)
                {
                    throw new Error("sys_language的ID:"+obj.ID+"中的"+lanList[i]+"json出错");
                }
            }
        }
    }

    var langObj=null;
    var fontStr="";

    for (var k in hash)
    {
        langObj = hash[k];
        save(JSON.stringify(hash[k]), "($lang)/data/"+ k + "/" + k + ".txt");

        if(fontHash!=null && fontHash[k]!=null)
        {
            for(var fontName in fontHash[k])
            {
                fontStr=fontHash[k][fontName].replace(/(.)(?=.*\1)/g,"");
                fontStr=fontStr.replace(/\{.\}/g,"1234567890KB");
                if(fontStr!="")
                {
                    // var iconv = require('iconv-lite');
                    // iconv.skipDecodeWarning=true;
                    // var str = iconv.decode(fontStr);
                    var Buffer=require('buffer').Buffer;
                    var saveBuffer=new Buffer(fontStr.length*2+2);
                    saveBuffer[0]=0xff;
                    saveBuffer[1]=0xfe;
                    saveBuffer.write(fontStr,2,fontStr.length*2,'ucs2')
                    // str.copy(saveBuffer,2,0,fontStr.length);
                    save(saveBuffer, "($lang)/data/"+ k + "/" + fontName + ".txt");
                }
            }
        }
    }

    file+="\t}\n";
    file+="}";
    save(file, "($dataLib)/src/Lang.as");
    saveFunc(list);
}