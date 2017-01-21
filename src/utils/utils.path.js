/**
 * Created by 75 on 2016/12/30.
 */
module.exports.formatPath=function(path,globalPath)
{
    for(let key in globalPath)
    {
        let reg=new RegExp("\\(\\$"+key+"\\)","g")
        path=path.replace(reg,globalPath[key]);
    }
    return path;
}