const { app, BrowserWindow } = require('electron');

let mainWindow;

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 660,          // Ширина окна
    height: 934,         // Высота окна
    resizable: false,    // Отключение изменения размера окна (по желанию)
    webPreferences: {
      contextIsolation: true, // Изоляция контекста для безопасности
      nodeIntegration: false  // Отключение Node.js в рендерере
    }
  });

  
  mainWindow.setMenu(null);
  mainWindow.setMenuBarVisibility(false);

  mainWindow.loadURL('http://localhost:8000/electron.html');
 // Загружаем HTML-файл в окно

  mainWindow.on('closed', () => {
    mainWindow = null; // Очищаем объект окна после закрытия
  });
});

app.on('window-all-closed', () => {
  // Закрытие приложения, если это не macOS
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  // Повторное открытие окна на macOS, если оно закрыто
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindow = new BrowserWindow({
      width: 660,
      height: 934,
      resizable: false,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false
      }
    });

    mainWindow.loadURL('http://localhost:8000/index.html');

  }
});
