const fs=require("fs");
/**
 * Created by 75 on 2016/12/23.
 */
var yaml=require("js-yaml");
class ConfigData extends Laya.EventDispatcher
{
    constructor()
    {
        super();
        this.updateConfig();
        ConfigData.exportCache=this.exportCache;
        ConfigData.publishCache=this.publishCache;
    }

    static get inst()
    {
        return ConfigData._inst || (ConfigData._inst=new ConfigData());
    }

    updateConfig()
    {
        fs.openSync("./config.yml","a+");
        try
        {
            this.data=yaml.load(fs.readFileSync('./config.yml', 'utf8'));
            // fs.closeSync("./config.yml");
        }
        catch(e)
        {
            console.log(e);
        }
        this.data || (this.data={});
        this.exportCache!=null?this.exportCache.updateData(this.data):(this.exportCache=new ExportCache(this.data));
        this.publishCache!=null?this.publishCache.updateData(this.data):(this.publishCache=new PublishCahche(this.data));
    }

    saveConfig()
    {
        fs.openSync("./config.yml","w+");
        try {
            fs.writeFileSync(
                './config.yml',
                yaml.dump(this.data),
                'utf8'
            );
        } catch (e) {
            console.log(e);
        }
    }
}

class ExportCache
{
    constructor(d)
    {
        d.export || (d.export={});
        this.data=d.export;
    }

    updateData(d)
    {
        d.export || (d.export={});
        this.data=d.export;
    }

    get toInfo()
    {
        let info=this.selectInfo;
        if(!info)return {};
        return this.selectInfo.to || (this.selectInfo.to={});
    }

    get fromInfo()
    {
        return this.data;
    }

    getExportInfo(key)
    {
        return this.toInfo[key];
    }

    setExportInfo(key,val)
    {
        this.toInfo[key]=val;
    }

    deleteExport(key)
    {
        delete this.toInfo[key];
    }

    setFrom(key,val)
    {
        this.fromInfo[key]=val;
    }

    getFrom(key)
    {
     return this.fromInfo[key];
    }

    deleteFrom(key)
    {
        delete this.fromInfo[key];
    }

    get fromList()
    {
        let arr=[];
        let info=this.fromInfo;
        for(let key in info)
        {
            arr.push([key,info]);
        }
        return arr;
    }

    get toList()
    {
        let arr=[];
        let info=this.toInfo;
        for(let key in info)
        {
            arr.push([key,info]);
        }
        return arr;
    }

    setToSelect(val)
    {
        this.toSelect=val;
    }

    setFromSelect(val)
    {
        this.fromSelect=val;
    }

    get selectInfo()
    {
        return this.getFrom(this.fromSelect);
    }

    get selectToInfo()
    {
        return this.getExportInfo(this.toSelect);
    }
}


class PublishCahche
{
    constructor(d)
    {
        d.publish || (d.publish={});
        this.data=d.publish;
    }

    updateData(d)
    {
        d.publish || (d.publish={});
        this.data=d.publish;
    }

    getList()
    {
        let arr=[];
        let info=this.data;
        for(let key in info)
        {
            arr.push([key,info]);
        }
        return arr;
    }

    getInfo(key)
    {
        return this.data[key];
    }

    setInfo(key,value)
    {
        this.data[key]=value;
    }

    deleteInfo(key)
    {
        delete this.data[key];
    }
}

