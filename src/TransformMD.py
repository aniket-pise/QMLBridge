from re import compile, sub
from os.path import join, basename

class TransformMD:
    def __init__(self, add_ids_checked, anchors_checked, unique_ids_checked, add_object_names_checked, update_log_box, savePath, filename):
        self.library = set()
        self.anchors = {
            "top": "anchors.fill: parent",
            "top": "anchors.top: parent.top",
            "left": "anchors.left: parent.left",
            "right": "anchors.right: parent.right",
            "bottom": "anchors.bottom: parent.bottom"
        }
        self.alignment = {
            "top": "Text.AlignTop",
            "left": "Text.AlignLeft",
            "right": "Text.AlignRight",
            "bottom": "Text.AlignBottom",
            "justify": "Text.AlignJustify"
        }
        self.qml_code = ""
        self.savePath = savePath
        self.filename = filename
        self.idBucket = {}
        self.fontBucket = set()
        self.addIDsChecked = add_ids_checked
        self.anchorsChecked = anchors_checked
        self.uniqueIDsChecked = unique_ids_checked
        self.addObjectNamesChecked = add_object_names_checked
        self.update_log_box = update_log_box

    def transform_qml(self, json_data):
        artboards = json_data["artboards"]
        artboardSets = json_data["artboardSets"]
        self.documentName = json_data["documentInfo"]["name"]
        
        for artboard in artboards:
            self.qml_code += self.parse_children(artboard) + "\n"
        self.save_qml(self.qml_code, self.library, self.documentName)

        for artboardSet in artboardSets:
            self.qml_code = ""
            filename = artboardSet["name"]
            artboards = artboardSet["artboards"]
            for artboard in artboards:
                self.qml_code += self.parse_children(artboard) + "\n"
            self.save_qml(self.qml_code, self.library, filename)

    def save_data(self, qml_code, file_name):
        savePath = join(self.savePath, self.filename)
        with open(join(savePath, file_name+".qml"), "w") as data:
            data.write(qml_code)
        self.update_log_box("Data Saved.")
    
    def save_qml(self, qml_code, library, file_name):
        libs = ""
        for lib in library:
            libs += lib + "\n"
        
        qml_code = libs + qml_code.replace("QtQuick.", "")
        pattern = compile(r'ENUM\((.*?)\)')
        qml_code = sub(pattern, r'\1', qml_code)
        self.update_log_box("Transformation done.\nSaving Data.")
        self.save_data(qml_code, file_name)

    def generate_unique_id(self, base_id):
        base_id = base_id[0].lower() + base_id[1:]
        count = self.idBucket.get(base_id, 0)
        self.idBucket[base_id] = count + 1
        return f"{base_id}{count}"

    def get_alignment_value(self, alignment_type, alignment_value):
        if alignment_value != "center":
            return self.alignment.get(alignment_value)
        return "Text.AlignHCenter" if alignment_type == "horizontalAlignment" else "Text.AlignVCenter"

    def parse_children(self, children):
        metadata = children["metadata"]
        
        qml_code = "\nItem {"
        qml_code += f"\n{" "*4}x: {children['x']}"
        qml_code += f"\n{" "*4}y: {children['y']}"
        qml_code += f"\n{" "*4}z: {children['layerIndex']}"
        qml_code += f"\n{" "*4}width: {children['width']}"
        qml_code += f"\n{" "*4}height: {children['height']}"

        if self.addIDsChecked or (self.uniqueIDsChecked and self.addIDsChecked):
            qml_code += f"\n{" "*4}id: {self.generate_unique_id(metadata.get('qmlId', 'default'))}"
        else:
            if self.uniqueIDsChecked:
                qml_code += f"\n{" "*4}id: {metadata['uuid']}"

        if self.addObjectNamesChecked:
            qml_code += f"\n{" "*4}objectName: \"{children['name']}\""

        if "typeName" in metadata:
            if metadata["typeName"] != "SvgPathItem":
                qml_code = qml_code.replace("Item", metadata["typeName"])
                if "qmlProperties" in metadata:
                    for qmlProperty in metadata["qmlProperties"]:
                        qml_code += f"\n{" "*4}{qmlProperty}"
            else:
                qml_code = qml_code.replace("Item", "Shape")
                qml_code += f"\n\n{" "*4}ShapePath " + "{"
                if "qmlProperties" in metadata:
                    for qmlProperty in metadata["qmlProperties"]:
                        if "path" not in qmlProperty:
                            qml_code += f"\n{" "*4}{" "*4}{qmlProperty}"
                qml_code += f"\n\n{" "*4}{" "*4}PathSvg " + "{"
                qml_code += f"\n{" "*4}{" "*4}{" "*4}{metadata['qmlProperties'][0]}"
                qml_code += f"\n{" "*4}{" "*4}" + "}"
                qml_code += f"\n{" "*4}" + "}"

        else:
            if "qmlProperties" in metadata:
                for qmlProperty in metadata["qmlProperties"]:
                    qml_code += f"\n{" "*4}{qmlProperty}"
            
        if "qmlVisible" in metadata:
            qml_code += f"\n{" "*4}visible: {metadata['qmlVisible']}"

        if "opacity" in metadata:
            qml_code += f"\n{" "*4}opacity: {metadata['opacity']}"

        if self.anchorsChecked: 
            if "anchors" in metadata:
                for anchor in metadata["anchors"]:
                    qml_code += f"\n{" "*4}{self.anchors.get(anchor)}"

        if "extraImports" in metadata:
            for extra_imports in metadata["extraImports"]:
                self.library.add(extra_imports)

        if "textDetails" in metadata:
            text_details = metadata["textDetails"]
            qml_code = qml_code.replace("Item", "Text")
            qml_code += f"\n{" "*4}text: \"{text_details['contents']}\""
            qml_code += f"\n{" "*4}color: \"{text_details['textColor']}\""
            qml_code += f"\n{" "*4}font.family: \"{text_details['fontFamily']}\""
            qml_code += f"\n{" "*4}font.pixelSize: {text_details['fontSize']}"
            qml_code += f"\n{" "*4}verticalAlignment: {self.get_alignment_value('verticalAlignment', text_details['verticalAlignment'])}"
            qml_code += f"\n{" "*4}horizontalAlignment: {self.get_alignment_value('horizontalAlignment', text_details['horizontalAlignment'])}"
            self.fontBucket.add(str(text_details["fontFamily"]))

        if "transformation" in metadata:
            transformation = metadata["transformation"]
            qml_code += f"\n{" "*4}rotation: {transformation['rotation']}"
            if transformation["flippedHorizontally"] or transformation["flippedVertically"]:
                if transformation["flippedHorizontally"]:
                    qml_code += f"\n{" "*4}xScale: -1"
                else:
                    qml_code += f"\n{" "*4}yScale: -1"
                qml_code += f"\n{" "*4}origin.x: parent.width/2"
                qml_code += f"\n{" "*4}origin.y: parent.height/2"
        
        if "assetData" in metadata:
            asset_data = metadata["assetData"]            
            qml_code = qml_code.replace("Item", "Image")
            qml_code += f"\n{" "*4}source: \"./Images/{basename(asset_data['assetPath'])}\""
        
        if "children" in children:
            for child in children["children"]:
                qml_code += self.parse_children(child)

        qml_code += "\n}"
        return qml_code
