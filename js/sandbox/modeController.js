import {g2} from "../util/g2.js";
import { controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";
import {MODES, SANDBOX_MODES} from "../sandbox/utils.js"


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
    this.mode_id = 0;
    this.sub_mode_id = 0;
    menu_button.text = SANDBOX_MODES[0];
    menu_button.color = COLORS[0]

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
        if(this.mode_id === 0){
            menu_button.text = SANDBOX_MODES[this.sub_mode_id];
            menu_button.color = COLORS[this.sub_mode_id];
        }else{
            menu_button.text = MODES[1];
            menu_button.color = COLORS[2];
        }


    }
    let changeMode = () =>{
        if(isLBt1() && isLBt2() && isRBt1() && isRBt2()){
            this.turnSandboxMode(0);
            return true;
        }
        return false;
    }

    this.getModeID = () =>{
          return this.mode_id;
    }
    this.turnObjMode = () =>{
        this.mode_id = 1;
        refresh();
    }
    this.turnSandboxMode = (sub_id) =>{
        this.mode_id = 0;
        this.sub_mode_id = sub_id;
        refresh();
    }
    this.animate = (t, in_room, sub_id) =>{
        if(in_room){
            this.turnObjMode();

        }else{
            this.turnSandboxMode(sub_id);
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