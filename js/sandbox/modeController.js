import {g2} from "../util/g2.js";

import * as bc from "../sandbox/baseController.js"
import * as ut from "../sandbox/utils.js"



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
    this.mode_id = ut.BOX_VIEW_MSG;
    menu_button.text = "";
    menu_button.color = [1, 1, 1];


    let refresh = (mode) =>{
        let text = "";
        let color = [1, 1, 1];
        switch(mode) {
            case ut.ROOM_WITH_BOX_MSG:
                text = ut.TEXT_ROOM_WITH_BOX;
                color = ut.COLOR_ROOM_WITH_BOX;
                break;
            case ut.ROOM_WITHOUT_BOX_MSG:
                text = ut.TEXT_ROOM_WITHOUT_BOX;
                color = ut.COLOR_ROOM_WITHOUT_BOX;
                break;
            case ut.BOX_VIEW_MSG:
                text = ut.TEXT_BOX_VIEW;
                color = ut.COLOR_BOX_VIEW;
                break;
            case ut.BOX_EDIT_MSG:
                text = ut.TEXT_BOX_EDIT;
                color = ut.COLOR_BOX_EDIT;
                break;
            case ut.BOX_OBJ_MSG:
                text = ut.TEXT_BOX_OBJ;
                color = ut.COLOR_BOX_OBJ;
                break;
            case ut.DIVING_MSG:
                text = ut.TEXT_IS_DIVING;
                color = ut.COLOR_IS_DIVING;
                break;
            case ut.ROOM_WALKING_MSG:
                text = ut.TEXT_ROOM_WALKING;
                color = ut.COLOR_ROOM_WALKING;
                break;
            default:
                let bug = "you got a bug here";
                console.log(bug);
        }

        menu_button.color = color;
        menu_button.text = text;

    }

    let isInRoom = () =>{
        return this.mode_id === ut.ROOM_WITH_BOX_MSG ||
            this.mode_id === ut.ROOM_WITHOUT_BOX_MSG ||
            this.mode_id === ut.ROOM_WALKING_MSG;
    }
    let isInBox = () =>{
        return this.mode_id === ut.BOX_VIEW_MSG ||
            this.mode_id === ut.BOX_EDIT_MSG ||
            this.mode_id === ut.BOX_OBJ_MSG;
    }

    let changeGlobalMode = () =>{
        if(bc.isLBt1() && bc.isLBt2() && bc.isRBt1() && bc.isRBt2() && isInRoom()){
            this.mode_id = ut.BOX_VIEW_MSG;
            return true;
        }
        return false;
    }
    let switchModeInRoom = () =>{
        if(isInRoom()){
            let mid = this.mode_id;
            switch(mid) {
                case ut.ROOM_WITHOUT_BOX_MSG:
                    this.mode_id = ut.ROOM_WITH_BOX_MSG;
                break;
                case ut.ROOM_WITH_BOX_MSG:
                    this.mode_id = ut.ROOM_WALKING_MSG;
                break;
                case ut.ROOM_WALKING_MSG:
                    this.mode_id = ut.ROOM_WITHOUT_BOX_MSG;
                break;
                default:
            }

            return true;
        }
        return false;
    }
    let switchModeInBox = () =>{
        if(isInBox()){
            let mid = this.mode_id;
            switch(mid) {
                case ut.BOX_VIEW_MSG:
                    this.mode_id = ut.BOX_EDIT_MSG;

                break;
                case ut.BOX_EDIT_MSG:
                    this.mode_id = ut.BOX_OBJ_MSG;
                break;
                case ut.BOX_OBJ_MSG:
                    this.mode_id = ut.BOX_VIEW_MSG;
                break;
                default:
            }
            return true;
        }
        return false;
    }


    this.clearState = (t, state, sandbox) =>{
        state.MENU.INACTIVE = true;
        state.OBJ.INACTIVE = true;
        state.BOX.DISABLED = false;
        state.ROOM.WALKING.DISABLED = true;
        switch(state.MODE.MODE) {
            case ut.ROOM_WITH_BOX_MSG:
                sandbox.mini_sandbox.comeBack();
                state.MENU.INACTIVE = false;
                state.OBJ.INACTIVE = state.MENU.OPEN;
                break;
            case ut.ROOM_WITHOUT_BOX_MSG:
                sandbox.mini_sandbox.flyAway();
                state.MENU.INACTIVE = false;
                state.OBJ.INACTIVE = state.MENU.OPEN;
                break;
            case ut.BOX_VIEW_MSG:


                break;
            case ut.BOX_EDIT_MSG:
                break;
            case ut.BOX_OBJ_MSG:
                state.MENU.INACTIVE = false;
                state.OBJ.INACTIVE = state.MENU.OPEN;
                sandbox.clear(4);
                break;
            case ut.DIVING_MSG:
                break;
            case ut.ROOM_WALKING_MSG:
                state.ROOM.WALKING.DISABLED = false;
                break;
            default:
                let bug = "you got a bug here";
                console.log(bug);
        }
        this.mode_id = state.MODE.MODE;
        state.BOX.DISABLED = state.MENU.OPEN;
        if(isInBox()){
            sandbox.mini_sandbox.comeBack();
            sandbox.room.flyAway();
        }else{
            state.BOX.DISABLED = true;
        }
        return state;
    }

    this.animate = (t, state) =>{
        if(state.MODE.MODE === ut.DIVING_MSG){
            refresh(ut.DIVING_MSG);
            return [false, state]
        }
        this.mode_id = state.MODE.MODE;
        menu_button.identity().hud().move(-.2, .5, -.1).scale(.2, .2, .001);
        if(state.MODE.SWITCH){
            if(state.MODE.IN_ROOM)
                this.mode_id = ut.ROOM_WITHOUT_BOX_MSG;
            else
                this.mode_id = ut.BOX_VIEW_MSG;
            refresh(this.mode_id);
            state.MODE.MODE = this.mode_id;
            state.MODE.SWITCH = false;
            return [true, state]
        }

        if(this.cold_down > 0){
              this.cold_down -= 1;
              return [false, state]
        }
        let flag = false;
        flag = changeGlobalMode() || flag;

        if(!flag && bc.isRA()){
            flag = switchModeInRoom() || switchModeInBox();
        }
        if(flag){
            this.cold_down = CD;

        }

        refresh(this.mode_id);
        state.MODE.IN_ROOM = isInRoom();
        state.MODE.MODE = this.mode_id;
        return [flag, state]

      }

}