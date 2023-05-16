import { g2 } from "../util/g2.js";
import * as cg from "../render/core/cg.js";
import { controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";
import { lcb, rcb } from '../handle_scenes.js';
import * as ut from "../sandbox/utils.js"
import {customClays} from "../sandbox/defineClays.js"

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
      let texturePreviewObjectsBG = [];
      let spaceBetweenTextures = 0.5;
      let textureList = [
         '../media/textures/sandbox/NO_TEXTURE.png',
         '../media/textures/sandbox/brick.png',
         '../media/textures/sandbox/concrete.png',
         '../media/textures/sandbox/silver-old.png',
         '../media/textures/sandbox/wood-1.png',
         '../media/textures/sandbox/wood-2.png',
         '../media/textures/sandbox/wood-3.png',
         '../media/textures/sandbox/wood-4.png',
         //'../media/textures/sandbox/blackboard.png',
         '../media/textures/sandbox/rainbow-1.png',
         //'../media/textures/sandbox/rainbow-2.png',
         '../media/textures/sandbox/silver.png',
         '../media/textures/sandbox/wood-5.png',
         '../media/textures/sandbox/wood-white.png',
         
         '../media/textures/sandbox/carpet-1.png',
         '../media/textures/sandbox/carpet-2.png',
         '../media/textures/sandbox/carpet-3.png',
         '../media/textures/sandbox/carpet-4.png',
      ];
      let textureTilesDefaultColor = [0.5,0.5,1];
      let textureTilesHoverColor = [0.1,0.1,1];

      // Object Picker Properties
      let objectList = [];
      let objectPickerLeftOffset = -0.2;
      let objectMeshList = ['cube', 'sphere', 'donut'];

      objectMeshList = objectMeshList.concat(customClays());

      // Menu interaction
      let rotationSpeedDivider = 2000;
      let selectedObjectScale = 0.17;
      let hitRadius = 0.04;

      this.getBeamIntersectionWithObjects = (objectList, intersectionRadius, rt, rt_prev, currentSelection, bgList, defColor, hoverColor) => {
         for (let i = 0; i < objectList.length; i++) {
            let center = objectList[i].getGlobalMatrix().slice(12, 15);
            let point = rcb.projectOntoBeam(center);
            let diff = cg.subtract(point, center);
            let hit = cg.norm(diff) < intersectionRadius;

            if (hit) {
               if(hoverColor){
                  bgList[i].color(hoverColor);
               }
               if (rt && !rt_prev) {
                  return i;
               }
            } else {
               if(hoverColor){
                  bgList[i].color(defColor);
               }
            }
         }
         return currentSelection;
      };
      /*
         JS = buttonState.left[3].x,y
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
            g2.setColor([colorPicker.colorR, colorPicker.colorG, colorPicker.colorB]);
            g2.fillRect(.25, 0.40, .5, 0.45);
            g2.setColor('white');
            g2.textHeight(0.08);
            g2.fillText('Color Picker', .5, .97, 'center');
            g2.drawWidgets(colorPicker);
         });
         let colorPickerBG = colorPicker.add('cube').texture('../media/textures/menu/png-small/menu-bg.png').move(0,0,-0.2).scale(0.8,1.4,0.001);
         let colorPickerText = colorPicker.add('cube').texture('../media/textures/menu/png-small/menu-item-type-6.png').move(0,0.94,-0.1).scale(0.60,0.15,1);
      
         colorPicker.colorR = 0.5;
         colorPicker.colorG = 0.5;
         colorPicker.colorB = 0.5;
         g2.addWidget(colorPicker, 'slider', .5, .268, '#ff0000', 'RED', value => colorPicker.colorR = value);
         g2.addWidget(colorPicker, 'slider', .5, .168, '#00ff00', 'GREEN', value => colorPicker.colorG = value);
         g2.addWidget(colorPicker, 'slider', .5, .068, '#0000ff', 'BLUE', value => colorPicker.colorB = value);

         texturePicker = menu.add('cube').texture(() => {
            g2.textHeight(0.08);
            g2.setColor('white');
            g2.fillText('Texture Picker', .5, .97, 'center');
         });

         let texturePickerBG = texturePicker.add('cube').texture('../media/textures/menu/png-small/menu-bg.png').move(0,0,-0.2).scale(0.8,1.4,0.001);
         let texturePickerText = texturePicker.add('cube').texture('../media/textures/menu/png-small/menu-item-type-6.png').move(0,0.94,-0.1).scale(0.60,0.15,1);
      

         for (let i = 0; i < textureList.length; i++) {
            let yLoc = spaceBetweenTextures - 1.4 * Math.floor(i/4) * textureScale;
            let xLoc = (i%4)*0.28;
            let texturePanelItem = texturePicker.add('cube').move(-0.41 + xLoc, yLoc, 0.83).scale(textureScale/2.1).texture(textureList[i]);
            let texturePanelItemBG = texturePicker.add('cube').move(-0.41 + xLoc, yLoc, 0.73).scale(textureScale/2).color(textureTilesDefaultColor);
            texturePreviewObjects.push(texturePanelItem);
            texturePreviewObjectsBG.push(texturePanelItemBG);
         }

         objectPicker = menu.add();
         let objectPickerBG = objectPicker.add('cube').texture('../media/textures/menu/png-small/rectangle-boundary.png').scale(5,0.8,0.001).color(0.1,0.1,1).move(0.26,-0.05,0);
         let spaceBetweenObjects = 1;
         for (let i = 0; i < objectMeshList.length; i++) {
            let objectPickerItem = objectPicker.add(objectMeshList[i]).move(-3 + spaceBetweenObjects * i, 0, 0).scale(0.3);
            objectList.push(objectPickerItem);
         }

         menu.move(0, 0, 0);
         colorPicker.move(-.6, 0, 0).turnY(0.4).scale(0.27, 0.27, .0001);
         texturePicker.move(.6,0, 0).turnY(-0.4).scale(0.27, 0.27, 0.0001);
         objectPicker.move(objectPickerLeftOffset, -0.6, 0).scale(0.2);
         //console.log("menu created")
      }

      this.openMenu = (model) => {
         selectedObject = null;
         menuOpen = true;
      }

      this.closeMenu = (model) => {
         menuOpen = false;
      }

      this.animate = (t, model, state) => {
         // console.log("menu_id",  menu_id);
         // console.log("inactive", inactive);
         let inactive = state.MENU.INACTIVE && !state.MENU.REQUIRE;
         //let inactive = false;

         rt = buttonState.right[0].pressed;
         let res = null;

         // Object Mode
         // Create Menu - "X" button on left controller
         let leftXButton = buttonState.left[4].pressed;
         if (leftXButton && !menuOpen && !inactive) {
            console.log("open menu");
            this.openMenu(model);
         }

         // visualize menu
         let menu_pos = [0,-0.18,0.4];
         menu.identity().hud().move(menu_pos);
         colorPicker.opacity(menuOpen ? 1 : .001);
         texturePicker.opacity(menuOpen ? 1 : .001);
         objectPicker.opacity(menuOpen ? 1 : .001);

         if (menuOpen) {
            //console.log("menu is on")
            selectedColor = [colorPicker.colorR, colorPicker.colorG, colorPicker.colorB];

            for (let i = 0; i < objectList.length; i++) {
               objectList[i].turnY(t / rotationSpeedDivider).turnX(t / rotationSpeedDivider).turnZ(t / rotationSpeedDivider);
            }

            // Display selected object
            if (selectedObject == null) {
               if (selectedTextureIndex > 0) {
                  selectedObject = model.add(objectMeshList[selectedObjectMeshIndex]).color(selectedColor).move(menu_pos).texture(textureList[selectedTextureIndex]).scale(selectedObjectScale);
               } else {
                  selectedObject = model.add(objectMeshList[selectedObjectMeshIndex]).color(selectedColor).move(menu_pos).scale(selectedObjectScale);
               }
            } else {
               selectedObject.identity().hud().color(selectedColor).move(menu_pos).scale(selectedObjectScale).turnY(t / 2);
            }

            // BEAM INTERSECTION FOR TEXTURE PICKER
            let newSelectedTextureIndex = this.getBeamIntersectionWithObjects(texturePreviewObjects, hitRadius/2, rt, rt_prev, selectedTextureIndex,texturePreviewObjectsBG, textureTilesDefaultColor,textureTilesHoverColor);
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

         if (buttonState.left[5].pressed) {
            state["MENU"]["REQUIRE"] = false;
            //console.log("close menu");
            //console.log("selected obj: ", selectedObject);
            this.closeMenu(model);
            if (selectedObject != null) {
               res = selectedObject;
               model.remove(selectedObject);
               selectedObject = null;
            }
            //console.log("results: ", res);
         }
         if (buttonState.left[3].pressed || inactive) {
            state.MENU.REQUIRE = false;
            if (menuOpen) {
               this.closeMenu(model);
               if (selectedObject != null) {
                  model.remove(selectedObject);
                  selectedObject = null;
               }
            }
         }
         state["MENU"]["OPEN"] = menuOpen;
         state["MENU"]["SELECT"] = res;
         rt_prev = rt;
         return [menuOpen, state];
      };


      this.clearState = (t, state, sandbox)=>{
         if(!state.MENU.OPEN && state.MENU.SELECT!== null){
            if(state.MODE.MODE === ut.BOX_EDIT_MSG){
               sandbox.reviseFocus(["revise", state.MENU.SELECT]);
            }else if(state.MODE.MODE === ut.BOX_OBJ_MSG){
               sandbox.addNewObj(0, state.MENU.SELECT);
            }else if(state.MODE.MODE === ut.ROOM_WITHOUT_BOX_MSG || state.MODE.MODE === ut.ROOM_WITH_BOX_MSG){
               sandbox.addNewObj(1, state.MENU.SELECT);
            }
            state.MENU.SELECT = null;
         }
         return state;

      }

   }
}
