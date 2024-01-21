import QtQuick
import QtQuick.Shapes
import QtQuick.Layouts
import QtQuick.Controls
import QtQuick.Dialogs
import Qt5Compat.GraphicalEffects
import "CustomComponents"

Rectangle {
    width: 800
    height: 600
    visible: true
    color: "#FFFFFF"

    property bool addIDsChecked: false
    property bool anchorsChecked: false
    property bool uniqueIDsChecked: false
    property bool downloadFontsChecked: false
    property bool addObjectNamesChecked: false
    property string loadedFilePath: ""
    property string storeLocation: ""

    signal transformButton()

    FontLoader {
        id: cantarell
        source: "../fonts/Cantarell.ttf"
    }

    FontLoader {
        id: firacode
        source: "../fonts/FiraCode.ttf"
    }

    Text {
        y: 25
        x: parent.width - width - 25
        font.weight: 600
        text: "QtBridge to QML"
        color: "#000000"
        font.family: cantarell.name
        font.pixelSize: 20
        font.letterSpacing: 1
    }

    Text {
        x: 25
        y: 260
        font.weight: 650
        text: "Output:"
        color: "#000000"
        font.family: cantarell.name
        font.pixelSize: 16
        font.letterSpacing: 1
    }

    Shape {
        x: 698.5
        y: 58.5
        width: 78
        height: 3

        ShapePath {
            fillColor: "#000000"
            strokeColor: "#000000"

            PathSvg {
                path: "M 0 1.5 C 0 0.6715728640556335 0.6715728640556335 0 1.5 0 L 76.5 0 C 77.32842254638672 0 78 0.6715728640556335 78 1.5 C 78 2.3284271359443665 77.32842254638672 3 76.5 3 L 1.5 3 C 0.6715728640556335 3 0 2.3284271359443665 0 1.5 Z"
            }
        }
    }

    CustomCheckBox {
        x: 35
        y: 190
        onCheckboxClicked: anchorsChecked = !anchorsChecked
    }

    Text {
        x: 60
        y: 187
        text: "Anchors"
        color: "#000000"
        font.family: firacode.name
        font.pixelSize: 14
    }

    CustomCheckBox {
        x: 35
        y: 225
        onCheckboxClicked: addIDsChecked = !addIDsChecked
    }

    Text {
        x: 60
        y: 223
        text: "Add IDs"
        color: "#000000"
        font.family: firacode.name
        font.pixelSize: 14
    }

    CustomCheckBox {
        x: 181
        y: 190
        onCheckboxClicked: uniqueIDsChecked = !uniqueIDsChecked
    }

    Text {
        x: 206
        y: 187
        text: "Unique IDs"
        color: "#000000"
        font.family: firacode.name
        font.pixelSize: 14
        verticalAlignment: Text.AlignTop
        horizontalAlignment: Text.AlignLeft
    }

    CustomCheckBox {
        x: 181
        y: 225
        onCheckboxClicked: addObjectNamesChecked = !addObjectNamesChecked
    }

    Text {
        x: 206
        y: 223
        text: "Add object name"
        color: "#000000"
        font.family: firacode.name
        font.pixelSize: 14
    }

    CustomCheckBox {
        x: 377
        y: 190
        onCheckboxClicked: downloadFontsChecked = !downloadFontsChecked
    }

    Text {
        x: 402
        y: 187
        text: "Download fonts"
        color: "#000000"
        font.family: firacode.name
        font.pixelSize: 14
    }

    Item {
        x: 25
        y: 95
        width: 630
        height: 75

        Rectangle {
            width: 630
            height: 29

            layer.enabled: true
            layer.effect: DropShadow {
                radius: 0
                color: "#000000"
                verticalOffset: 1
            }

            TextInput {
                id: filePath
                topPadding: 7
                leftPadding: 5
                rightPadding: 5
                bottomPadding: 7
                readOnly: true
                font.family: firacode.name
                font.pixelSize: 14
                anchors.fill: parent
                wrapMode: TextInput.NoWrap
            }
        }

        Rectangle {
            y: 45
            width: 630
            height: 29

            layer.enabled: true
            layer.effect: DropShadow {
                radius: 0
                color: "#000000"
                verticalOffset: 1
            }

            TextInput {
                id: savePath
                topPadding: 7
                leftPadding: 5
                rightPadding: 5
                bottomPadding: 7
                readOnly: true
                font.family: firacode.name
                font.pixelSize: 14
                anchors.fill: parent
                wrapMode: TextInput.NoWrap
            }
        }
    }

    Rectangle {
        x: 25
        y: 290
        width: 750
        height: 285
        color: "#f5f5f5"
        radius: 10

        ScrollView {
            x: 20
            y: 20
            width: 710
            height: 245

            Text {
                id: logBox
                objectName: "logBox"
                anchors.fill: parent
                wrapMode: Text.Wrap
                font.weight: Font.Normal
                Layout.alignment: Qt.AlignLeft | Qt.AlignTop
                Layout.fillHeight: true
                Layout.fillWidth: true
                color: "#000000"
                font.family: firacode.name
                font.pixelSize: 14
                verticalAlignment: Text.AlignTop
                horizontalAlignment: Text.AlignLeft
            }
        }
    }

    CustomButton {
        x: 670
        y: 95
        radius: 0
        textString: "Load File"

        layer.enabled: true
        layer.effect: DropShadow {
            radius: 0
            color: "#000000"
            verticalOffset: 1
        }

        onButtonClicked: filePathFileDialog.open()
    }

    CustomButton {
        x: 670
        y: 140
        radius: 0
        textString: "Save To"

        layer.enabled: true
        layer.effect: DropShadow {
            radius: 0
            color: "#000000"
            verticalOffset: 1
        }

        onButtonClicked: savePathFolderDialog.open()
    }

    FileDialog {
        id: filePathFileDialog
        title: "Choose a file"
        nameFilters: ["Qt Bridge Files (*.qtbridge);;Metadata Files (*.metadata);;All Files (*)"]
        onAccepted: {
            filePath.text = filePathFileDialog.currentFile
            loadedFilePath = filePath.text
            logBox.text += "File loaded.\n"
        }
    }

    FolderDialog {
        id: savePathFolderDialog
        title: "Choose a path"
        onAccepted: {
            savePath.text = savePathFolderDialog.currentFolder
            storeLocation = savePath.text
            logBox.text += "Path set successfully.\n"
        }
    }

    CustomButton {
        x: 670
        y: 210
        fontWeight: Font.Medium
        textColor: "#FFFFFF"
        textString: "Transform"
        buttonColor: "#141414"
        hoverColor: "#6C6C6C"

        onButtonClicked: transformButton()
    }
}
