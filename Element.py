import sys
import subprocess
import psutil
import json
from PyQt5.QtCore import *
from PyQt5.QtWidgets import *
from PyQt5.QtWebEngineWidgets import *

class MainWindow (QMainWindow):
    def __init__(self, *args, **kwargs):
        super(MainWindow, self).__init__(*args, **kwargs)
        profile = QWebEngineProfile.defaultProfile()
        profile.defaultProfile().setHttpUserAgent('ElementClient')

        self.WebView = QWebEngineView()
        self.WebView.setUrl(QUrl('http://localhost:8000/home.html'))
        self.setCentralWidget(self.WebView)
        self.setWindowTitle('Element Desktop')
        self.showMaximized()

if __name__ == '__main__':
    App = QApplication(sys.argv)
    Window = MainWindow()
    Window.show()
    sys.exit(App.exec_())