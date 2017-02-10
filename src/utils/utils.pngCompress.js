/**
 * Created by 75 on 2017/2/10.
 */
module.exports=(function(){
    const exec=require("child_process").exec;
    var PngCompress=(function()
    {
        function  PngCompress()
        {

        }

        var __prop=PngCompress.prototype;
        __prop.compress=function(files,callBack)
        {
            var index=0;
            doNext();
            function doNext()
            {
                if(index<files.length)
                {
                    exec(__dirname+"\\..\\..\\electron\\plugs\\pngquant.exe -f --nofs --ext .png "+files[index],{"encoding":"binary"},function(error,stdout,stderr)
                    {
                        console.log(stdout);
                        if(error)alert(error.message);
                        index++;
                        doNext();
                    });
                }
                else
                {
                    callBack && callBack();
                }
            }
        }
        return PngCompress;
    })();
    return new PngCompress();
})();