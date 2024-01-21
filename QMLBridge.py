import json
import shutil
import zipfile
import src.DownloadFont as DownloadFont

from platform import system
from os import makedirs, listdir, remove
from os.path import exists, abspath, join, splitext, basename
from src.TransformMD import TransformMD
from PySide6.QtQuick import QQuickView
from PySide6.QtCore import QUrl, QObject
from PySide6.QtWidgets import QApplication

class QMLBridge(QObject):
    def __init__(self):
        self.app = QApplication([])
        self.view = QQuickView()
        self.view.setSource(QUrl.fromLocalFile("assets/qml/main.qml"))
        self.root_object = self.view.rootObject()
        self.root_object.transformButton.connect(self.start_transformation)
        self.view.show()
        self.app.exec()
    
    def get_data(self):
        self.savePath = self.root_object.property("storeLocation")
        self.filePath = self.root_object.property("loadedFilePath")
        self.addIDsChecked = self.root_object.property("addIDsChecked")
        self.anchorsChecked = self.root_object.property("anchorsChecked")
        self.uniqueIDsChecked = self.root_object.property("uniqueIDsChecked")
        self.downloadFontsChecked = self.root_object.property("downloadFontsChecked")
        self.addObjectNamesChecked = self.root_object.property("addObjectNamesChecked")

    def update_log_box(self, message):
        logBox = self.root_object.findChild(QObject, "logBox")
        logBox_text = logBox.property("text")
        logBox.setProperty("text", logBox_text + message + "\n")
    
    def parse_path(self, url_path):
        os_name = system()
        if os_name == "Windows":
            return url_path[8:]
        else:
            return url_path[7:]

    def unzip_file(self, zip_file_path, extract_to_path):
        try:
            with zipfile.ZipFile(zip_file_path, 'r') as zip_ref:
                zip_ref.extractall(extract_to_path)
            self.update_log_box("Extraction Successfull.")
        except:
            self.update_log_box("Extraction Failed!")

    def read_metadata(self, source_file):
        try:
            with open(source_file, "r") as data:
                return json.load(data)
        except:
            self.update_log_box("Something went wrong, check qtbride filename and metadata filename is same or not.")
        
    def move_images(self, directory_path, destination_path):
        if not exists(destination_path):
            makedirs(destination_path,exist_ok=True)

        files = listdir(directory_path)
        for file in files:
            file_path = join(directory_path, file)

            if file.lower().endswith(('.jpg', '.png', '.svg')):
                destination_file_path = join(destination_path, file)
                shutil.move(file_path, destination_file_path)

    def start_transformation(self):
        self.get_data()
        
        if self.filePath != "" and self.savePath != "":
            self.filePath = self.parse_path(self.filePath)
            self.savePath = self.parse_path(self.savePath)

            savePath = ""
            self.filename, extension = splitext(basename(self.filePath))
            if extension in [".qtbridge", ".metadata"]:
                if extension == ".qtbridge":
                    self.update_log_box("File type: QtBridge. Processing...")
                    self.update_log_box("Extracting QtBridge File...")
                    self.unzip_file(self.filePath, join(self.savePath, self.filename))
                    json_data = self.read_metadata(join(self.savePath, self.filename, f"{self.filename}.metadata"))
                else:
                    json_data = self.read_metadata(self.filePath)
                    self.update_log_box("File type: Metadata. Processing...")
                
                if json_data:
                    self.update_log_box("Loading metadata successed.")
                    savePath = join(self.savePath, self.filename)
                    makedirs(join(savePath, "Images"), exist_ok=True)
                    self.move_images(savePath, join(savePath, "Images"))
                    transformMD = TransformMD(self.addIDsChecked, self.anchorsChecked, self.uniqueIDsChecked, self.addObjectNamesChecked, self.update_log_box, self.savePath, self.filename)
                    transformMD.transform_qml(json_data)

                    if extension == ".qtbridge":
                        remove(join(self.savePath, self.filename, f"{self.filename}.metadata"))
                else:
                    self.update_log_box("Loading metadata failed!")
            else:
                self.update_log_box("Invalid file type. Please select a .qtbridge or .metadata file.")
            
            if self.downloadFontsChecked:
                self.update_log_box("Downloading font.")
                save_path = join(savePath, "Fonts")
                makedirs(save_path, exist_ok=True)
                for font in transformMD.fontBucket:
                    self.update_log_box(f"Downloading {font}.")
                    try:
                        DownloadFont.download_google_font(font, save_path)
                        self.update_log_box("Downloading completed.")
                    except:
                        self.update_log_box("Downloading failed.")
            
            self.update_log_box("Completed.")
        else:
            if self.filePath == "" and self.savePath == "":
                self.update_log_box("Error: Both file and save paths are not selected. Please choose both paths.")
            elif self.filePath == "":
                self.update_log_box("Error: No file selected. Please choose a file.")
            else:
                self.update_log_box("Error: No save path selected. Please choose a save path.")

if __name__ == "__main__":
    QMLBridge()
