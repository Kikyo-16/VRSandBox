import {g2} from "../util/g2.js";

import * as bc from "../sandbox/baseController.js"
import * as ut from "../sandbox/utils.js"
import {BOX_OBJ} from "../sandbox/utils.js";



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
    menu_button.text = "";
    menu_button.color = [1, 1, 1];


    let refresh = (mode) =>{
        let text = "";
        let color = [1, 1, 1];
        switch(mode) {
            case ut.ROOM_WITH_BOX:
                text = ut.TEXT_ROOM_WITH_BOX;
                color = ut.COLOR_ROOM_WITH_BOX;
                break;
            case ut.ROOM_WITHOUT_BOX:
                text = ut.TEXT_ROOM_WITHOUT_BOX;
                color = ut.COLOR_ROOM_WITHOUT_BOX;
                break;
            case ut.BOX_VIEW:
                text = ut.TEXT_BOX_VIEW;
                color = ut.COLOR_BOX_VIEW;
                break;
            case ut.BOX_EDIT:
                text = ut.TEXT_BOX_EDIT;
                color = ut.COLOR_BOX_EDIT;
                break;
            case ut.BOX_OBJ:
                text = ut.TEXT_BOX_OBJ;
                color = ut.COLOR_BOX_OBJ;
                break;
            case ut.IS_DIVING:
                text = ut.TEXT_IS_DIVING;
                color = ut.COLOR_IS_DIVING;
                break;
            default:
                let bug = "you got a bug here";
                console.log(bug);
        }

        menu_button.color = color;
        menu_button.text = text;

    }

    let isInRoom = () =>{
        return this.mode_id === ut.ROOM_WITH_BOX ||
            this.mode_id === ut.ROOM_WITHOUT_BOX;
    }
    let isInBox = () =>{
        return this.mode_id === ut.BOX_VIEW ||
            this.mode_id === ut.BOX_EDIT ||
            this.mode_id === ut.BOX_OBJ;
    }

    let changeGlobalMode = () =>{
        if(bc.isLBt1() && bc.isLBt2() && bc.isRBt1() && bc.isRBt2() && isInRoom()){
            this.mode_id = ut.BOX_VIEW;
            return true;
        }
        return false;
    }
    let switchModeInRoom = () =>{
        if(bc.isRA() && isInRoom()){
            this.mode_id = this.mode_id === ut.ROOM_WITH_BOX ? ut.ROOM_WITHOUT_BOX : ut.ROOM_WITH_BOX;
            return true;
        }
        return false;
    }
    let switchModeInBox = () =>{
        if(bc.isRA() && isInBox()){
            let mid = this.mode_id + 1;
            if(mid > ut.BOX_OBJ)
                mid = ut.BOX_VIEW;
            this.mode_id = mid;
            return true;
        }
        return false;
    }

    this.parseCodeForMenu = (menu_id) =>{

        return menu_id;
    }


    this.parseCodeForCrl = (menu_status) =>{
        return menu_status !== ut.MENU_OPEN &&
            (isInRoom() || (isInBox() && this.mode_id === ut.BOX_OBJ))

    }

    this.parseCodeForBox = () =>{
        return isInBox();
    }

    this.clearMenuID = (sandbox, menu_id, menu_status) =>{
        if(menu_status[1] !== undefined && menu_status[1] !== null && menu_status[0] !== ut.MENU_OPEN){
            if(menu_id === ut.MENU_ADD_OBJ){
                if(menu_status[0] === ut.MENU_CLOSE)
                    sandbox.addObj(menu_status[1], this.getCollectionCode());
            }else if(menu_id === ut.MENU_REVISE_WALL){
                if(menu_status[0] === ut.MENU_CLOSE)
                    sandbox.reviseFocus(["texture", menu_status[1]])
                menu_id = ut.MENU_DISABLED;
            }
            return menu_id

        }
        return menu_id;
    }

    this.getCollectionCode = () =>{
        return this.mode_id === ut.BOX_OBJ ? 0 : (isInRoom() ? 1: -2);
    }

    this.animate = (t, mode_id, is_diving) =>{
        this.mode_id = mode_id;
        if(!is_diving && this.mode_id === ut.IS_DIVING)
            this.mode_id = ut.ROOM_WITHOUT_BOX;
        menu_button.identity().hud().move(-.2, .5, -.1).scale(.2, .2, .001);
        if(this.cold_down > 0){
              this.cold_down -= 1;
              return this.mode_id
        }
        let flag = false;
        flag = changeGlobalMode() || flag;
        if(!flag){
            flag = switchModeInRoom() || flag;
        }
        if(!flag){
            flag = switchModeInBox() || flag;
        }
        if(flag){
            this.cold_down = CD;
        }
        refresh(this.mode_id);

        return this.mode_id;

      }

}