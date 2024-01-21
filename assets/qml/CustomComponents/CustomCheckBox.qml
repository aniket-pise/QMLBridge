import QtQuick
import QtQuick.Shapes
import QtQuick.Controls

Rectangle {
    width: 15
    height: 15
    border.color: "#000000"
    border.width: 1
    color: "#00000000"
    radius: 5

    signal checkboxClicked()

    Rectangle {
        x: 5
        y: 5
        id: checkIcon
        width: 5
        height: 5
        color: "#000000"
        radius: 2.5
        visible: false
    }

    MouseArea {
        cursorShape: "PointingHandCursor"
        anchors.fill: parent
        onClicked: {
            checkIcon.visible = !checkIcon.visible
            checkboxClicked()
        }
    }
}
