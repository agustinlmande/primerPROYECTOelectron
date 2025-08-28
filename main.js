// Importa los módulos necesarios de Electron
const { app, BrowserWindow } = require('electron')

// Variable global para la ventana principal
let mainWindow

// Función para crear la ventana principal
function createWindow () {
    // Requiere 'screen' después de que la app está lista
  const { screen } = require('electron')
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  // Crea una nueva ventana de navegador con tamaño específico
  mainWindow = new BrowserWindow({
    width: width, // Ancho de la ventana
    height: height, // Alto de la ventana
    icon: 'build/icon.ico', // Icono de la aplicación
    
    webPreferences: {
      nodeIntegration: true // Permite usar Node.js en el frontend
    }
  })

  // Carga el archivo HTML principal en la ventana
  mainWindow.loadFile('index.html')

  // Evento cuando la ventana se cierra
  mainWindow.on('closed', function () {
    mainWindow = null // Libera la referencia de la ventana
  })
}

// Evento cuando Electron ha terminado de inicializarse
app.on('ready', createWindow)

// Evento para salir cuando todas las ventanas están cerradas
app.on('window-all-closed', function () {
  // En macOS, las aplicaciones suelen quedarse abiertas hasta que el usuario sale explícitamente
  if (process.platform !== 'darwin') app.quit()
})

// Evento para crear una ventana si no hay ninguna (macOS)
app.on('activate', function () {
  if (mainWindow === null) createWindow()
})