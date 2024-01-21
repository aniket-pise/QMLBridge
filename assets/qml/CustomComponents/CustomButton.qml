import QtQuick
import QtQuick.Controls

Rectangle {
    property int fontWeight: Font.Normal
    property string textString: "Button"
    property color buttonColor: "#EFEFEF"
    property color textColor: "#3C3C3C"
    property color hoverColor: "#F5F5F5"

    signal buttonClicked()

    FontLoader {
        id: firacode
        source: "../../fonts/FiraCode.ttf"
    }

    width: 105
    height: 30
    radius: 05
    color: buttonColor

    Text {
        text: textString
        color: textColor
        font.pixelSize: 12
        font.weight: fontWeight
        font.family: firacode.font
        anchors.centerIn: parent
    }

    MouseArea {
        cursorShape: "PointingHandCursor"
        hoverEnabled: true
        anchors.fill: parent
        onEntered: parent.color = hoverColor
        onExited: parent.color = buttonColor
        onClicked: buttonClicked()
    }
}
