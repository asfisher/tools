class Mysql
{
    constructor(config)
    {
        this.mysql = require("mysql");
        this.pool=this.mysql.createPool(config);
    }

    doSql(sql,callBack,value)
    {
        let self=this;
        this.pool.getConnection(function(err,conn)
        {
            if(err)console.log("Pool==>"+err);
            conn.query(sql,function(err,rows)
            {
                if(value!=null)
                {
                    for(let i=0;i<rows.length;i++)
                    {
                        self.checkValue(rows[i],value,sql);
                    }
                }
                callBack.runWith([rows]);
            });
            conn.release();
        });
    }

    checkValue(info,value,sql)
    {
        for(let i=0;i<value.length;i++)
        {
            let valueItem=value[i];
            if(valueItem.type=="array")
            {
                try
                {
                    if(info[valueItem.name]!=null && info[valueItem.name]!="")
                    {
                        info[valueItem.name] = [...JSON.parse(info[valueItem.name])];
                    }
                    else
                    {
                        info[valueItem.name]=null;
                    }
                }
                catch(e)
                {
                    console.log(e.message+"@"+sql+"---"+valueItem.name);
                    console.log(info);
                }
            }
            else
            {
                try
                {
                    if(info[valueItem.name]!=null && info[valueItem.name]!="")
                    {
                        info[valueItem.name]=JSON.parse(info[valueItem.name]);
                    }
                    else
                    {
                        info[valueItem.name]=null;
                    }
                }
                catch(e)
                {
                    console.log(e.message+"@"+sql+"---"+valueItem.name);
                    console.log(info);
                }
            }
        }
    }

    end()
    {
        this.pool.end();
        this.pool=null;
    }
}
module.exports.Mysql=Mysql;