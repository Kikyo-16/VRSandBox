import { g2 } from "../util/g2.js";
import * as ut from "../sandbox/utils.js"
import { controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";

export class CreateControlsViewController {

   constructor(){
      this.controlTextBox = null;
      this.helpTextBox = null;
      this.controlList = [];
      this.controls = new Map();
      this.controls.set(ut.BOX_VIEW_MSG, ["Left Y    : Add a floor",
                                          "Left X    : Remove a floor",
                                          "Left 1    : Expand",
                                          "Left 2    : Collapse",
                                          "Right B   : Div",
                                          "Right A   : Turn mode (Edit / Object)",
                                          "Right 1&2 : Place the loc cursor"]);
                                          
      this.controls.set(ut.BOX_EDIT_MSG, ["Left Y    : Delete walls / Finish menu selection",
                                          "Left X    : Open menu",
                                          "Right B   : Split walls",
                                          "Right A   : Turn mode (Object / View)",
                                          "*Right 1  : Hold to select walls to split",
                                          "Right 2   : Select multiple walls",
                                          "J-stick Y : Cancel menu"]);
      this.controls.set(ut.BOX_OBJ_MSG, ["Left Y     : Finish menu selection",
                                          "Left X    : Open object menu",
                                          "Right B   : Open multi-perspective menu",
                                          "Right A   : Turn mode (View / Edit)",
                                          "Right 1&2 : Open Saving&Refresh menu",
                                          "J-stick Y : Cancel menu",
                                          "Select obj r & *Right1 : Hold to move obj",
                                          "Select obj l & *Left1 : Rotate obj",
                                          "Select obj l & *Left1 & Right B : Copy obj",
                                          "(Select obj r&l) & (Left 2 & Right 2) : Copy obj",
                                          "(Select obj r&l) & (Left 1 & Right 1) : Resize obj"]);
      this.controls.set(ut.ROOM_WITHOUT_BOX_MSG, ["Left Y    : Finish menu selection",
                                                  "Left X    : Open object menu",
                                                  "Right B   : Open multi-perspective menu",
                                                  "Right A   : Turn mode (mini-sandbox / walking)",
                                                  "Right 1&2 : Open Saving&Refresh menu",
                                                  "J-stick Y : Cancel menu",
                                                  "Select obj r & *Right1 : Hold to move obj",
                                                  "Select obj l & *Left1 : Rotate obj",
                                                  "Select obj l & *Left1 & Right B : Copy obj",
                                                  "(Select obj r&l) & (Left 2 & Right 2) : Copy obj",
                                                  "(Select obj r&l) & (Left 1 & Right 1) : Resize obj",
                                                  "Left 1 & Left 2 & Right 3 & Right 4 : Jump out of the room"]);
      this.controls.set(ut.ROOM_WITH_BOX_MSG, ["Left Y    : Finish menu selection",
                                               "Left X    : Open object menu",
                                               "Right B   : Open multi-perspective menu",
                                               "Right A   : Turn mode (walking / general)",
                                               "Right 1&2 : Open Saving&Refresh menu",
                                               "J-stick Y : Cancel menu",
                                               "Select obj r & *Right1 : Hold to move obj",
                                               "Select obj l & *Left1  : Rotate obj",
                                               "Select obj l & *Left1 & Right B : Copy obj",
                                               "(Select obj r&l) & (Left 2 & Right 2) : Copy obj",
                                               "(Select obj r&l) & (Left 1 & Right 1) : Resize obj"]);
      this.controls.set(ut.ROOM_WALKING_MSG, ["Left Y     : Speed up",
                                              "Left X     : Speed down",
                                              "Turn head  : Change direction",
                                              "Right A    : Turn mode (general / mini-sandbox)",
                                              "J-stick Y+ : Walk forward",
                                              "J-stick Y- : Walk backward"]);
      this.controls.set(ut.PERSP_SHARING_MSG, ["Right B : Exit perspective-mode"]);    
                                          
   }
   
   init = (model) => {
      this.controlTextBox = model.add();
      let controlTextBoxBG = this.controlTextBox.add('cube').scale(0.5,0.2,1).texture('../media/textures/menu/png-small/rectangle-boundary.png').move(0.07,-0.6,0.05);
      let controlTextBoxHeadingBG = this.controlTextBox.add('cube').scale(0.20,0.015,1).texture('../media/textures/menu/png-small/menu-item-type-6.png').move(0,5,0.1);
      let controlTextBoxHeadingText = this.controlTextBox.add('cube').texture( () => {
         g2.textHeightAndFont('',0.1,'Arial');
         g2.setColor('white');
         g2.fillText("CONTROLS", 0.5, 0.5 , 'center');
         g2.drawWidgets(controlTextBoxControlList);
      }).move(0,0.075,1.1).scale(0.20,0.1,0.001);
      
      let controlTextBoxControlList = this.controlTextBox.add('cube').texture( () => {
         g2.textHeightAndFont('',0.045,'Arial');
         g2.setColor('white');
         g2.fillRect(0.01,0,0.97 ,0.75);
         g2.setColor('black');
         for(let i = 0;i < this.controlList.length;i++){
            g2.fillText(this.controlList[i], 0.05, 0.71 - 0.05*i , 'left');
         }
         g2.drawWidgets(controlTextBoxControlList);
      }).scale(0.44,0.2,0.001).move(0,-.21,0.1);

      this.helpTextBox = model.add();
      let helpTextBoxBG = this.helpTextBox.add('cube').scale(0.24,0.04,1).texture('../media/textures/menu/png-small/rectangle-boundary.png').move(0.07,-0.4,0);
      let helpTextBoxHeadingBG = this.helpTextBox.add('cube').scale(0.20,0.015,1).texture('../media/textures/menu/png-small/menu-item-type-6.png').move(0,3,0);
      let helpTextBoxHeadingText = this.helpTextBox.add('cube').texture( () => {
         g2.textHeightAndFont('',0.1,'Arial');
         g2.setColor('white');
         g2.fillText("HELP", 0.5, 0.5 , 'center');
         g2.drawWidgets(controlTextBoxControlList);
      }).move(0,0.045,1.1).scale(0.20,0.1,0.001);
      
      let displayText = ["FOR HELP AND CONTROLS", "HOLD RIGHT JOYSTICK"];
      let helpTextBoxControlList = this.helpTextBox.add('cube').texture( () => {
         g2.textHeightAndFont('',0.071,'Arial');
         g2.setColor('white');
         g2.fillRect(0.03,0.24,0.94,0.31);
         g2.setColor('black');
         for(let i = 0;i < displayText.length;i++){
            g2.fillText(displayText[i], 0.5, 0.5 - 0.15*i , 'center');
         }
         g2.drawWidgets(helpTextBoxControlList);
      }).scale(0.22,0.09,0.001).move(0,.10,0.1);
   
   };

   

   animate = (t, state_msg) => {
      let currentMode = state_msg.MODE.MODE;
      let helpPressed = buttonState.right[3].pressed;
      // let display = [];

      // for(let i = 0;i<buttonState.right.length;i++){
      //    let newLine = i + ' : ' + buttonState.right[i].pressed;
      //    display.push(newLine);
      // }
      //this.controlList = this.controls.get(currentMode);
      if(state_msg.GLOBAL_MENU.OPEN || state_msg.SAVING.OPEN || state_msg.MENU.OPEN || !state_msg.LOGIN.INACTIVE || !this.controls.has(currentMode)){
         this.controlList = Array(0);
         this.controlTextBox.identity().hud().opacity(0.0001).move(0,0.1,0.1).scale(1.1,2.5,0.0001);
         this.helpTextBox.identity().hud().opacity(0.0001).move(-0.7,0.4,0.1).scale(0.8,2,0.0001);
      } else if(this.controls.has(currentMode) && helpPressed){
         this.controlList = this.controls.get(currentMode);
         this.controlTextBox.identity().hud().opacity(1).move(0,0.1,0.1).scale(1.1,2.5,0.0001);
         this.helpTextBox.identity().hud().opacity(0.0001).move(-0.7,0.4,0.1).scale(0.8,2,0.0001);
      } else {
         this.controlList = Array(0);
         this.controlTextBox.identity().hud().opacity(0.0001).move(0,0.1,0.1).scale(1.1,2.5,0.0001);
         this.helpTextBox.identity().hud().opacity(1).turnY(0.4).move(-0.7,0.4,0.01).scale(1.2,2.4,0.0001);
      }
      
      return [false, state_msg]
   }
}