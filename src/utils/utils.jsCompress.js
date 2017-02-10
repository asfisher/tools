/**
 * Created by 75 on 2017/2/9.
 */
module.exports=(function()
{
    var uglifyjs=require("uglify-js");
    var fs=require("fs");
    var JsCompress=(function()
    {
        function JsCompress()
        {

        }

        var __prop=JsCompress.prototype;
        __prop.compress=function(files,callBack)
        {
            var index=0;
            doNext();
            function doNext()
            {
                if(index<files.length)
                {
                    fs.readFile(files[index],function(err,buffer)
                    {
                        var result = uglifyjs.minify(buffer.toString(),{
                            mangle:true,
                            fromString: true
                        });
                        fs.writeFile(files[index],result.code,function(err,fd)
                        {
                            index++;
                            doNext();
                        });
                    });
                }
                else
                {
                    callBack && callBack();
                }
            }
        }
        return JsCompress;
    })();
    return new JsCompress();
})();