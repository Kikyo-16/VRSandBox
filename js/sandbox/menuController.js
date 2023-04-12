import { g2 } from "../util/g2.js";
import * as cg from "../render/core/cg.js";
import { controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";
import { lcb, rcb } from '../handle_scenes.js';
import * as ut from "../sandbox/utils.js"

export class CreateMenuController {
   constructor() {
      let mode = 0;
      let menuOpen = false;

      // Menu items
      let menu = undefined;
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

      // Menu interaction
      let rotationSpeedDivider = 2000;
      let selectedObjectScale = 0.2;
      let hitRadius = 0.04;

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
      /*
         JS = buttonState.left[3].pressed
         X  = buttonState.left[4].pressed
         Y  = buttonState.left[5].pressed
      */

      // model.move(0,0,0.3);
      this.setMode = (currentMode) => {
         mode = currentMode;
      };

      this.init = (model) => {
         menu = model.add('cube').opacity(.0001);
         colorPicker = menu.add('cube').texture(() => {
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

         texturePicker = menu.add('cube').texture(() => {
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

         objectPicker = menu.add();
         let spaceBetweenObjects = 1;
         for (let i = 0; i < objectMeshList.length; i++) {
            let objectPickerItem = objectPicker.add(objectMeshList[i]).move(spaceBetweenObjects * i, 0, 0).scale(0.3);
            objectList.push(objectPickerItem);
         }

         menu.move(0, 0, 0);
         colorPicker.move(-.7, 0, 0).turnY(0.4).scale(0.3, 0.3, .0001);
         texturePicker.move(.7, 0, 0).turnY(-0.4).scale(0.4, 0.4, 0.0001);
         objectPicker.move(objectPickerLeftOffset, -0.5, 0).scale(0.2);
         console.log("menu created")
      }

      this.openMenu = (model) => {
         selectedObject = null;
         menuOpen = true;
      }

      this.closeMenu = (model) => {
         menuOpen = false;
      }

      this.animate = (t, model, menu_id, inactive) => {
         // console.log("menu_id",  menu_id);
         // console.log("inactive", inactive);

         if(menu_id === ut.MENU_DISABLED)
            return ut.MENU_CLOSE;

         rt = buttonState.right[0].pressed;
         let res = null;

         // Object Mode
         // Create Menu - "X" button on left controller
         let leftXButton = buttonState.left[4].pressed || menu_id === ut.MENU_REVISE_WALL;
         if (leftXButton && !menuOpen) {
            console.log("open menu")
            this.openMenu(model);
         }

         // visualize menu
         menu.identity().hud();
         colorPicker.opacity(menuOpen ? 1 : .001);
         texturePicker.opacity(menuOpen ? 1 : .001);
         objectPicker.opacity(menuOpen ? 1 : .001);

         if (menuOpen) {
            console.log("menu is on")
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

         let menu_status = menuOpen ? ut.MENU_OPEN : ut.MENU_CLOSE;
         if (buttonState.left[5].pressed) {
            console.log("close menu");
            console.log("selected obj: ", selectedObject);
            this.closeMenu(model);
            if (selectedObject != null) {
               res = selectedObject;
               model.remove(selectedObject);
               selectedObject = null;
               menu_status = ut.MENU_CLOSE;
            }
            console.log("results: ", res);
         }
         if (buttonState.left[3].pressed || inactive) {
            menu_status = ut.MENU_CANCEL;
            if (menuOpen) {
               this.closeMenu(model);
               if (selectedObject != null) {
                  model.remove(selectedObject);
                  selectedObject = null;
               }
            }
         }

         rt_prev = rt;
         if(menuOpen)
            menu_status = ut.MENU_OPEN;
         return [menu_status, res];
      };

   }
}
