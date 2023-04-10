import { g2 } from "../util/g2.js";
import * as cg from "../render/core/cg.js";
import { controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";
import { lcb, rcb } from '../handle_scenes.js';

export class CreateMenuController {
   constructor() {

      let mode = 0;
      let menu = undefined;
      let menuOpen = false;

      // Menu items
      let colorPicker = undefined;
      let texturePicker = undefined;
      let objectPicker = undefined;

      // Menu selection 
      let selectedObject = null;
      let selectedTextureIndex = 0;
      let selectedObjectMeshIndex = 0;
      let selectedColor = [0.5, 0.5, 0.5];

      // Menu selection controls
      let rt = false;
      let rt_prev = false;

      // Texture picker properties
      let textureScale = 0.25;
      let texturePreviewObjects = [];
      let spaceBetweenTextures = 0.5;
      let textureList = [
         '../media/textures/NO_TEXTURE.png',
         '../media/textures/brick.png',
         '../media/textures/concrete.png'
      ];

      // Object Picker Properties
      let objectList = [];
      let objectPickerLeftOffset = -0.2;
      let objectMeshList = ['cube', 'sphere', 'donut'];

      this.getBeamIntersectionWithObjects = (objectList, intersectionRadius, rt, rt_prev, currentSelection) => {
         for (let i = 0; i < objectList.length; i++) {
            let center = objectList[i].getGlobalMatrix().slice(12, 15);
            let point = rcb.projectOntoBeam(center);
            let diff = cg.subtract(point, center);
            let hit = cg.norm(diff) < intersectionRadius;

            if (hit) {
               if (rt && !rt_prev) {
                  return i;
               }
            }
         }
         return currentSelection;
      };

      // Create Debug Panel
      this.createDebugPanel = (model, objOfInterest) => {
         let debugPanel = model.add('cube').texture(() => {
            g2.setColor('black');
            g2.textHeight(0.07);
            g2.fillText('' + objOfInterest, .5, .92, 'center');
         });
      };

      /*
         JS = buttonState.left[3].pressed
         X  = buttonState.left[4].pressed
         Y  = buttonState.left[5].pressed
      */
      // Create Color Picker Panel
      this.createColorPicker = (model) => {
         colorPicker = model.add('cube').texture(() => {
            g2.setColor('white');
            g2.fillRect(0.2, 0, 0.6, 1);
            g2.setColor([colorPicker.colorR, colorPicker.colorG, colorPicker.colorB]);
            g2.fillRect(.25, 0.40, .5, 0.45);
            g2.setColor('black');
            g2.textHeight(0.07);
            g2.fillText('Color Picker', .5, .92, 'center');
            g2.drawWidgets(colorPicker);
         });
         colorPicker.colorR = 0.5;
         colorPicker.colorG = 0.5;
         colorPicker.colorB = 0.5;
         g2.addWidget(colorPicker, 'slider', .5, .268, '#ff0000', 'RED', value => colorPicker.colorR = value);
         g2.addWidget(colorPicker, 'slider', .5, .168, '#00ff00', 'GREEN', value => colorPicker.colorG = value);
         g2.addWidget(colorPicker, 'slider', .5, .068, '#0000ff', 'BLUE', value => colorPicker.colorB = value);
      };

      // Delete Color Picker Panel
      this.deleteColorPicker = (model) => {
         model.remove(colorPicker);
         colorPicker = undefined;
      };

      // Create Texture picker Panel
      this.createTexturePicker = (model) => {
         texturePicker = model.add('cube').texture(() => {
            g2.setColor('#FFFFFF');
            g2.fillRect(0.25, 0, 0.5, 1);
            g2.textHeight(0.06);
            g2.setColor('black');
            g2.fillText('Texture Picker', .5, .92, 'center');
         });
         for (let i = 0; i < textureList.length; i++) {
            let yLoc = spaceBetweenTextures - 2.2 * i * textureScale;
            let texturePanelItem = texturePicker.add('cube').move(0, yLoc, 0.83).scale(textureScale).texture(textureList[i]);
            texturePreviewObjects.push(texturePanelItem);
         }
      };

      // Delete Texture picker Panel
      this.deleteTexturePicker = (model) => {
         model.remove(texturePicker);
         texturePicker = undefined;
         // clear texturePreviewObjects
         while (texturePreviewObjects.length > 0) {
            texturePreviewObjects.pop();
         }
      };


      // Create Object Picker Bottom Panel
      this.createObjectPicker = (model) => {
         objectPicker = model.add();
         let spaceBetweenObjects = 1;
         for (let i = 0; i < objectMeshList.length; i++) {
            let objectPickerItem = objectPicker.add(objectMeshList[i]).move(spaceBetweenObjects * i, 0, 0).scale(0.3);
            objectList.push(objectPickerItem);
         }
      };

      this.deleteObjectPicker = (model) => {
         model.remove(objectPicker);
         objectPicker = undefined;
         // clear objectList
         while (objectList.length > 0) {
            objectList.pop();
         }
      };

      // model.move(0,0,0.3);
      this.setMode = (currentMode) => {
         mode = currentMode;
      };

      this.openMenu = (model) => {
         selectedObject = null;
         this.createColorPicker(model);
         this.createTexturePicker(model);
         this.createObjectPicker(model);
         menuOpen = true;
      };
      this.closeMenu = (model) => {
         this.deleteColorPicker(model);
         this.deleteTexturePicker(model);
         this.deleteObjectPicker(model);
         menuOpen = false;
      };

      this.animate = (t, model, require_mode) => {
         rt = buttonState.right[0].pressed;
         let res = null;
         let menu_mode = menuOpen? 1 : 0;
         // Object Mode
         if (require_mode > 0 || menuOpen) {
            // Create Menu - "X" button on left controller
            //let leftXButton = true; //buttonState.left[4].pressed;
            let leftXButton = buttonState.left[4].pressed || require_mode >= 3;
            //console.log("here")
            if (leftXButton && !menuOpen) {
               this.openMenu(model);
            } 
            if (menuOpen) {
               // Menu interaction
               let rotationSpeedDivider = 2000;
               let selectedObjectScale = 0.2;

               selectedColor = [colorPicker.colorR, colorPicker.colorG, colorPicker.colorB];

               for (let i = 0; i < objectList.length; i++) {
                  objectList[i].turnY(t / rotationSpeedDivider).turnX(t / rotationSpeedDivider).turnZ(t / rotationSpeedDivider);
               }

               // Display selected object
               if (selectedObject == null) {
                  if (selectedTextureIndex > 0) {
                     selectedObject = model.add(objectMeshList[selectedObjectMeshIndex]).color(selectedColor).texture(textureList[selectedTextureIndex]).scale(selectedObjectScale);
                  } else {
                     selectedObject = model.add(objectMeshList[selectedObjectMeshIndex]).color(selectedColor).scale(selectedObjectScale);
                  }


               } else {
                  selectedObject.identity().hud().color(selectedColor).scale(selectedObjectScale).turnX(t / 2).turnZ(t / 2).turnZ(t / 2);
               }

               colorPicker.identity().hud().move(-0.7, 0, 0).turnY(0.4).scale(0.3, 0.3, .0001);
               texturePicker.identity().hud().move(0.7, 0, 0).turnY(-0.4).scale(0.4, 0.4, 0.0001);
               objectPicker.identity().hud().move(objectPickerLeftOffset, -0.5, 0).scale(0.2);
               // Debug Panel
               //debugPanel.identity().hud().move(0,0.1, 0).turnY(0.4).scale(0.3,0.3,.0001);
               let hitRadius = 0.04;

               // BEAM INTERSECTION FOR TEXTURE PICKER
               let newSelectedTextureIndex = this.getBeamIntersectionWithObjects(texturePreviewObjects, hitRadius, rt, rt_prev, selectedTextureIndex);
               if (newSelectedTextureIndex != selectedTextureIndex) {
                  model.remove(selectedObject);
                  selectedObject = null;
                  selectedTextureIndex = newSelectedTextureIndex;
               }
               // BEAM INTERSECTION FOR OBJECT PICKER
               let newSelectedObjectMeshIndex = this.getBeamIntersectionWithObjects(objectList, hitRadius, rt, rt_prev, selectedObjectMeshIndex);
               if (newSelectedObjectMeshIndex != selectedObjectMeshIndex) {
                  model.remove(selectedObject);
                  selectedObject = null;
                  selectedObjectMeshIndex = newSelectedObjectMeshIndex;
               }
            }
         
            // Close Menu - "Y" Button
            if (buttonState.left[5].pressed) {
               this.closeMenu(model);
               if (selectedObject != null) {
                  res = selectedObject;
                  model.remove(selectedObject);
                  selectedObject = null;
                  menu_mode = 0;
               }
            }

            // Cancel Menu - Left Joystick Button
            if (buttonState.left[3].pressed) {
               menu_mode = 2;
               if(menuOpen){
                  this.closeMenu(model);
                  if (selectedObject != null) {
                     model.remove(selectedObject);
                     selectedObject = null;
                  }
               }
            }
         }


         rt_prev = rt;
         return [menu_mode, res];
      };

   }
}
