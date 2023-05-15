import { g2 } from "../util/g2.js";

export class CreateControlsViewController {

   constructor(){
      this.controlTextBox = null;
      this.controlList = [];
      this.controls = new Map();
      this.controls.set("MODE 1", ["Control Line 1","Control Line 2"]);
      this.controls.set("MODE 2", ["Control Line 1"]);
      this.controls.set("MODE 3", ["Control Line 1","Control Line 2", "Control Line 3"]);
   }
   
   init = (model) => {
      this.controlTextBox = model.add();
      let controlTextBoxBG = this.controlTextBox.add('cube').scale(0.24,0.08,1).texture('../media/textures/menu/png-small/rectangle-boundary.png').move(0.07,-0.4,0);
      let controlTextBoxHeadingBG = this.controlTextBox.add('cube').scale(0.20,0.015,1).texture('../media/textures/menu/png-small/menu-item-type-6.png').move(0,3,0);
      let controlTextBoxHeadingText = this.controlTextBox.add('cube').texture( () => {
         g2.textHeightAndFont('',0.1,'Arial');
         g2.fillText("CONTROLS", 0.5, 0.5 , 'center');
         g2.drawWidgets(controlTextBoxControlList);
      }).move(0,0.045,1.1).scale(0.20,0.1,0.001);
      
      let controlTextBoxControlList = this.controlTextBox.add('cube').texture( () => {
         g2.textHeightAndFont('',0.1,'Arial');
         g2.setColor('white');
         g2.fillRect(0,0.06,1,0.52);
         g2.setColor('black');
         for(let i = 0;i < this.controlList.length;i++){
            g2.fillText(this.controlList[i], 0.5, 0.5 - 0.15*i , 'center');
         }
         g2.drawWidgets(controlTextBoxControlList);
      }).scale(0.22,0.1,0.001).move(0,.10,0.1);
   };

   animate = (state_msg) => {
      let currentMode = "MODE 0"; // get mode from state_msg
      this.controlList = this.controls.get(currentMode);

      if(this.controlList != null && this.controlList.length != 0){
         this.controlTextBox.identity().hud().opacity(1).move(-0.7,0.4,0.1).scale(0.8,2,0.0001);
      } else {
         this.controlList = [];
         this.controlTextBox.identity().hud().opacity(0.0001).move(-0.7,0.4,0.1).scale(0.8,2,0.0001);
      }
   }
}