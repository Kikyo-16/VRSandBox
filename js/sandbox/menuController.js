import { g2 } from "../util/g2.js";
import * as cg from "../render/core/cg.js";
import { controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";
import { lcb, rcb } from '../handle_scenes.js';

export function CreateMenuController (model){

   let selectedObjectMeshIndex = 0;
   let selectedTextureIndex = 0;
   let selectedColor = [0.5,0.5,0.5];
   let selectedObject = null;

   let rt = false;
   let rt_prev = false;
   let hit = false;
   model.move(0,0,0.3);

   // Color Picker Panel
   let colorPicker = model.add('cube').texture(() => {
      g2.setColor('white');
      g2.fillRect(0.2,0,0.6,1);
      g2.setColor([colorPicker.colorR, colorPicker.colorG, colorPicker.colorB]);
      g2.fillRect(.25,0.40,.5,0.45);
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


   // TexturePicker
   let texturePreviewObjects = [];
   let spaceBetweenTextures = 0.5;
   let textureScale = 0.25;
   let textureList = [
      '../media/textures/NO_TEXTURE.png',
      '../media/textures/brick.png',
      '../media/textures/concrete.png'
   ];
   let texturePicker = model.add('cube').texture(() => {
      g2.setColor('#FFFFFF');
      g2.fillRect(0.25,0,0.5,1);
      g2.textHeight(0.06);
      g2.setColor('black');
      g2.fillText('Texture Picker', .5, .92, 'center');
   });
   for (let i = 0; i < textureList.length; i++) {
      let yLoc = spaceBetweenTextures - 2.2*i*textureScale ;
      let texturePanelItem = texturePicker.add('cube').move(0,yLoc,0.83 ).scale(textureScale).texture(textureList[i]);
      texturePreviewObjects.push(texturePanelItem);

   }


   // ObjectPicker
   let objectPicker = model.add();
   let objectMeshList = ['cube', 'sphere', 'donut'];
   let objectList = [];
   let spaceBetweenObjects = 1;
   let objectPickerLeftOffset = -0.2;
   for (let i = 0; i < objectMeshList.length; i++) {
         let objectPickerItem = objectPicker.add(objectMeshList[i]).move(spaceBetweenObjects*i,0,0).scale(0.3);
         objectList.push(objectPickerItem);
   }

   let getBeamIntersectionWithObjects = (objectList, intersectionRadius, rt, rt_prev, currentSelection) => {
      for(let i=0;i<objectList.length;i++){
         let center = objectList[i].getGlobalMatrix().slice(12,15);
         let point = rcb.projectOntoBeam(center);
         let diff = cg.subtract(point, center);
         let hit = cg.norm(diff) < intersectionRadius;

         if(hit){
            if(rt && !rt_prev){
               return i;
            }
         }
      }
      return currentSelection;
   }


   this.animate = (t) =>{

      selectedColor = [colorPicker.colorR,colorPicker.colorG,colorPicker.colorB];
      let rotationSpeedDivider = 2000;
      let selectedObjectScale = 0.2;

      for(let i=0;i<objectList.length;i++){
         objectList[i].turnY(t/rotationSpeedDivider).turnX(model.time/rotationSpeedDivider).turnZ(model.time/rotationSpeedDivider);
      }

      // Display selected object
      if(selectedObject == null){
         if(selectedTextureIndex>0){
            selectedObject = model.add(objectMeshList[selectedObjectMeshIndex]).color(selectedColor).texture(textureList[selectedTextureIndex]).scale(selectedObjectScale);
         } else {
            selectedObject = model.add(objectMeshList[selectedObjectMeshIndex]).color(selectedColor).scale(selectedObjectScale);
         }


      } else {
         selectedObject.identity().hud().color(selectedColor).scale(selectedObjectScale).turnX(model.time/2).turnZ(model.time/2).turnZ(model.time/2);
      }

      colorPicker.identity().hud().move(-0.7,0, 0).turnY(0.4).scale(0.3,0.3,.0001);
      texturePicker.identity().hud().move(0.7,0, 0).turnY(-0.4).scale(0.4,0.4,0.0001);
      objectPicker.identity().hud().move(objectPickerLeftOffset,-0.5, 0).scale(0.2);
      // Debug Panel
      //debugPanel.identity().hud().move(0,0.1, 0).turnY(0.4).scale(0.3,0.3,.0001);

      rt = buttonState.right[0].pressed;
      let hitRadius = 0.04;
      // BEAM INTERSECTION FOR TEXTURE PICKER
      let newSelectedTextureIndex = getBeamIntersectionWithObjects(texturePreviewObjects, hitRadius, rt, rt_prev, selectedTextureIndex);
      if(newSelectedTextureIndex != selectedTextureIndex){
         model.remove(selectedObject);
         selectedObject = null;
         selectedTextureIndex = newSelectedTextureIndex;
      }
      // BEAM INTERSECTION FOR OBJECT PICKER
      let newSelectedObjectMeshIndex = getBeamIntersectionWithObjects(objectList, hitRadius, rt, rt_prev, selectedObjectMeshIndex);
      if(newSelectedObjectMeshIndex != selectedObjectMeshIndex){
         model.remove(selectedObject);
         selectedObject = null;
         selectedObjectMeshIndex = newSelectedObjectMeshIndex;
      }

      rt_prev = rt;

   };
}

// NOTE : The current selected object is variable with name "selectedObject" , can use this variable to calculate intersection and place a replica of the object in the world