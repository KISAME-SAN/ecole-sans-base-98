const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  // Créer la fenêtre principale
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    },
    icon: path.join(__dirname, 'public', 'favicon.ico'),
    title: 'École Sans Base - Gestion d\'établissement scolaire',
    show: false // Ne pas afficher immédiatement
  });

  // Charger l'application
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:8080');
    // Ouvrir les DevTools en développement
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  // Afficher la fenêtre quand elle est prête
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Mettre la fenêtre au premier plan
    if (isDev) {
      mainWindow.focus();
    }
  });

  // Gérer la fermeture de la fenêtre
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Créer le menu de l'application
  createMenu();
}

function createMenu() {
  const template = [
    {
      label: 'École Sans Base',
      submenu: [
        {
          label: 'À propos',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'À propos',
              message: 'École Sans Base',
              detail: 'Système de gestion d\'établissement scolaire\nVersion 1.0.0'
            });
          }
        },
        { type: 'separator' },
        {
          label: 'Quitter',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Fichier',
      submenu: [
        {
          label: 'Nouveau',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            // Recharger l'application pour "reset" les données
            mainWindow.reload();
          }
        },
        { type: 'separator' },
        {
          label: 'Actualiser',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.reload();
          }
        }
      ]
    },
    {
      label: 'Affichage',
      submenu: [
        {
          label: 'Recharger',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.reload();
          }
        },
        {
          label: 'Forcer le rechargement',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => {
            mainWindow.webContents.reloadIgnoringCache();
          }
        },
        {
          label: 'Outils de développement',
          accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
          click: () => {
            mainWindow.webContents.toggleDevTools();
          }
        },
        { type: 'separator' },
        {
          label: 'Zoom avant',
          accelerator: 'CmdOrCtrl+Plus',
          click: () => {
            const currentZoom = mainWindow.webContents.getZoomLevel();
            mainWindow.webContents.setZoomLevel(currentZoom + 0.5);
          }
        },
        {
          label: 'Zoom arrière',
          accelerator: 'CmdOrCtrl+-',
          click: () => {
            const currentZoom = mainWindow.webContents.getZoomLevel();
            mainWindow.webContents.setZoomLevel(currentZoom - 0.5);
          }
        },
        {
          label: 'Zoom par défaut',
          accelerator: 'CmdOrCtrl+0',
          click: () => {
            mainWindow.webContents.setZoomLevel(0);
          }
        },
        { type: 'separator' },
        {
          label: 'Plein écran',
          accelerator: process.platform === 'darwin' ? 'Ctrl+Cmd+F' : 'F11',
          click: () => {
            mainWindow.setFullScreen(!mainWindow.isFullScreen());
          }
        }
      ]
    },
    {
      label: 'Fenêtre',
      submenu: [
        {
          label: 'Réduire',
          accelerator: 'CmdOrCtrl+M',
          click: () => {
            mainWindow.minimize();
          }
        },
        {
          label: 'Fermer',
          accelerator: 'CmdOrCtrl+W',
          click: () => {
            mainWindow.close();
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Cette méthode sera appelée quand Electron aura fini de s'initialiser
app.whenReady().then(createWindow);

// Quitter quand toutes les fenêtres sont fermées
app.on('window-all-closed', () => {
  // Sur macOS, il est commun pour les applications et leur barre de menu
  // de rester actives jusqu'à ce que l'utilisateur quitte explicitement avec Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // Sur macOS, il est commun de recréer une fenêtre dans l'app quand
  // l'icône du dock est cliquée et qu'il n'y a pas d'autres fenêtres ouvertes
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Dans ce fichier, vous pouvez inclure le reste du code de votre processus principal
// Vous pouvez également le mettre dans des fichiers séparés et les require ici.