const { app, BrowserWindow } = require('electron');
const path = require('path');

// Функція для створення вікна
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Для безпечної взаємодії
      nodeIntegration: true, // Дозволяє використовувати Node.js
      contextIsolation: false
    }
  });

  mainWindow.loadFile('static/web/electron.html'); // Завантажує HTML-файл
}

// Запуск додатка
app.whenReady().then(createWindow);

// Закриття програми на macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
