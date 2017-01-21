/**
 * Created by 75 on 2017/1/5.
 */
module.exports=function(rows,sqlInfo,saveFunc)
{
    for(let i=0;i<rows.length;i++)
    {
        let obj=rows[i];
        if(int(screenStart[obj.ChapterID])==0)
        {
            screenStart[obj.ChapterID]=obj.ScreeningID;
        }
        else
        {
            screenStart[obj.ChapterID]=Math.min(obj.ScreeningID,screenStart[obj.ChapterID]);
        }
    }

    for each(obj in arr)
    {
        obj.Index=obj.ScreeningID-screenStart[obj.ChapterID]+1;
    }
}