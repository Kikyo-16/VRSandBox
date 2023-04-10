import {g2} from "../util/g2.js";
import { controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";
import {MODES} from "../sandbox/utils.js"


let COLORS = [[153/255, 204/255, 255/255], [153/255, 1, 153/255], [255/255, 153/255, 204/255]];
export function CreateModeController(model){
    let node = model.add();
    let menu_button = node.add("cube").texture(() => {
            g2.setColor(menu_button.color);
            g2.fillRect(0,0,1,1);
            g2.setColor('black');
            g2.textHeight(.12);
            g2.fillText(menu_button.text, .5, .5, 'center');
            g2.drawWidgets(menu_button);
    });
    let CD = 20;
    this.cold_down = -1;
    this.selected_id = 0;
    menu_button.text = MODES[this.selected_id];
    menu_button.color = COLORS[this.selected_id]

    let isLBt1 = () =>{
        return buttonState.left[0].pressed;
    }
    let isLBt2 = () =>{
        return buttonState.left[1].pressed;
    }
    let isRBt1 = () =>{
        return buttonState.right[0].pressed;
    }
    let isRBt2 = () =>{
        return buttonState.right[1].pressed;
    }
    let refresh = () =>{
        menu_button.text = MODES[this.selected_id];
        menu_button.color = COLORS[this.selected_id];
    }
    let changeMode = () =>{
        if(isLBt1() && isLBt2() && isRBt1() && isRBt2()){
            if(this.selected_id === MODES.length - 1){
                this.selected_id = 0;
            }else{
                this.selected_id = (this.selected_id + 1) % (MODES.length - 1);
            }
            refresh();
            return true;
        }
        return false;
    }
    this.getMode = () =>{
          return MODES[this.selected_id];
    }
    this.getModeID = () =>{
          return this.selected_id;
    }
    this.turnObjMode = () =>{
        this.selected_id = 2;
        refresh();
    }
    this.animate = (t, in_room) =>{
        if(in_room){
            this.turnObjMode();
        }
        menu_button.identity().hud().move(-.2, .5, -.1).scale(.2, .2, .001);
        if(this.cold_down > 0){
              this.cold_down -= 1;
              return
        }
        let flag = changeMode();
        if(flag){
              this.cold_down = CD;
        }

      }

}
