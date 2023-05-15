import { g2 } from "../util/g2.js";
import * as ut from "../sandbox/utils.js"

export class CreateControlsViewController {

   constructor(){
      this.controlTextBox = null;
      this.controlList = [];
      this.controls = new Map();
      this.controls.set(ut.BOX_VIEW_MSG, ["Left Y -> Add a floor",
                                          "Left X -> Remove a floor",
                                          "Left 1 -> Expand",
                                          "Left 2 -> Collapse",
                                          "Right B -> Div",
                                          "Right A -> Turn mode (Edit / Object)",

                                          "Right 1&2 -> Place the loc cursor"]);
      this.controls.set(ut.BOX_EDIT_MSG, ["Left Y -> Delete walls / Finish menu selection",
                                          "Left X -> Open menu",
                                          "Right B -> Split walls",
                                          "Right A -> Turn mode (Object / View)",
                                          "*Right 1 -> Hold to select walls to split",
                                          "Right 2 -> Select multiple walls",
                                          "J-stick Y -> Cancel menu"]);
      this.controls.set(ut.BOX_OBJ_MSG, ["Left Y -> Finish menu selection",
                                          "Left X -> Open object menu",
                                          "Right B -> Open multi-perspective menu",
                                          "Right A -> Turn mode (View / Edit)",
                                          "Right 1&2 -> Open Saving&Refresh menu",
                                          "J-stick Y -> Cancel menu",
                                          "Select obj r & *Right1 -> Hold to move obj",
                                          "Select obj l & *Left1 -> Rotate obj",
                                          "Select obj l & *Left1 & Right B -> Copy obj",
                                          "(Select obj r&l) & (Left 2 & Right 2) -> Copy obj",
                                          "(Select obj r&l) & (Left 1 & Right 1) -> Resize obj"]);
      this.controls.set(ut.ROOM_WITHOUT_BOX_MSG, ["Left Y -> Finish menu selection",
                                                   "Left X -> Open object menu",
                                                   "Right B -> Open multi-perspective menu",
                                                   "Right A -> Turn mode (mini-sandbox / walking)",
                                                   "Right 1&2 -> Open Saving&Refresh menu",
                                                   "J-stick Y -> Cancel menu",
                                                   "Select obj r & *Right1 -> Hold to move obj",
                                          "Select obj l & *Left1 -> Rotate obj",
                                          "Select obj l & *Left1 & Right B -> Copy obj",
                                          "(Select obj r&l) & (Left 2 & Right 2) -> Copy obj",
                                          "(Select obj r&l) & (Left 1 & Right 1) -> Resize obj"]);
      this.controls.set(ut.ROOM_WITH_BOX_MSG, ["Left Y -> Finish menu selection",
                                                   "Left X -> Open object menu",
                                                   "Right B -> Open multi-perspective menu",
                                                   "Right A -> Turn mode (walking / general)",
                                                   "Right 1&2 -> Open Saving&Refresh menu",
                                                   "J-stick Y -> Cancel menu",
                                          "Select obj r & *Right1 -> Hold to move obj",
                                          "Select obj l & *Left1 -> Rotate obj",
                                          "Select obj l & *Left1 & Right B -> Copy obj",
                                          "(Select obj r&l) & (Left 2 & Right 2) -> Copy obj",
                                          "(Select obj r&l) & (Left 1 & Right 1) -> Resize obj"]);
      this.controls.set(ut.ROOM_WALKING_MSG, ["Left Y -> Speed up",
                                                "Left X -> Speed down",
                                                "Turn head -> Change direction",
                                                "Right A -> Turn mode (general / mini-sandbox)",
                                                "J-stick Y+ -> Walk forward",
                                                "J-stick Y- -> Walk backward"]);
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

   animate = (t, state_msg) => {
      let currentMode = state_msg.MODE.MODE;
      //this.controlList = this.controls.get(currentMode);

      if(this.controls.has(currentMode)){
         this.controlList = this.controls.get(currentMode);
         this.controlTextBox.identity().hud().opacity(1).move(-0.7,0.4,0.1).scale(0.8,2,0.0001);
      } else {
         this.controlList = Array(0);
         this.controlTextBox.identity().hud().opacity(0.0001).move(-0.7,0.4,0.1).scale(0.8,2,0.0001);
      }
      return [false, state_msg]
   }
}