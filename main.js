var electron=require('electron');
// 应用控制模块
var app = electron.app;
var ipcMain=electron.ipcMain;

// 创建窗口模块
var BrowserWindow = electron.BrowserWindow;

// 主窗口
var mainWindow = null;

// 初始化并准备创建主窗口
app.on('ready', function () {
    // 创建一个宽800px 高700px的窗口
    mainWindow = new BrowserWindow({
        width: 1440,
        height: 800,
        minWidth:600,
        minHeight:400,
        frame:false,
        movable:true
    });
    // 载入应用的inde.html
    mainWindow.loadURL('file://' + __dirname + '/bin/index.html');
    
    // 打开开发工具界面
    mainWindow.openDevTools();
    // 窗口关闭时触发
    mainWindow.on('closed', function(){
        // 想要取消窗口对象的引用， 如果你的应用支持多窗口，你需要将所有的窗口对象存储到一个数组中，然后在这里删除想对应的元素
        app.quit();
        mainWindow = null            
    });
    // ipcMain.on("window-moveing",function(event,arg){
    //     console.log(mainWindow);
    //     if(mainWindow)
    //     {
    //         mainWindow.setBounds(arg[0]);
    //     }
    //    // mainWindow.x=arg[0].x;
    //     //mainWindow.y=arg[0].y;
    //     // mainWindow.setBounds(arg[0]);
    // })
});