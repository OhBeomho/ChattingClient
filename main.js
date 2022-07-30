const {
    app,
    BrowserWindow,
    Menu,
    shell
} = require("electron");
const path = require("path");

function createWindow() {
    const win = new BrowserWindow({
        width: 1400,
        height: 1000,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: true,
            contextIsolation: false
        },
        icon: path.join(__dirname, "assets/icon.ico")
    });
    win.loadFile("./src/index.html");
    win.webContents.addListener("new-window", function (e, url) {
        e.preventDefault();
        shell.openExternal(url);
    });

    // Menu.setApplicationMenu(null);
}

app.whenReady().then(() => {
    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
