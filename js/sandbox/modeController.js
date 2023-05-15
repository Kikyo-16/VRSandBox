import {g2} from "../util/g2.js";

import * as bc from "../sandbox/baseController.js"
import * as ut from "../sandbox/utils.js"
import * as wu from "../sandbox/wei_utils.js"
import {RECEIVE_MSG} from "../sandbox/utils.js";



export function CreateModeController(model){
    let node = model.add();
    
    let menu_button = node.add('cube').texture('../media/textures/menu/png-small/menu-item-type-3.png');
    menu_button.add('cube').texture( () => {
         g2.textHeightAndFont('',0.042,'Arial');
         g2.setColor('#1a1aff');
         g2.fillText( menu_button.text, 0.5, 0.5 , 'center');
         g2.drawWidgets(menu_button);
    }).scale(1.4,8.4,1);

    let CD = 10;
    this.cold_down = -1;
    this.mode_id = ut.BOX_VIEW_MSG;
    menu_button.text = "";
    menu_button.color = [1, 1, 1];

    this.tmp_mode = ut.BOX_VIEW_MSG;
    this.mode = ut.BOX_VIEW_MSG;


    let refresh = (mode, state) =>{
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
            case ut.PERSP_SHARING_MSG:
                text = "You are viewing " + state.GLOBAL_MENU.ACTION.user + "'s view";
                break;
            case ut.RECEIVE_MSG:
                text = RECEIVE_MSG + state.REV.USER;
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
            this.mode_id === ut.ROOM_WALKING_MSG || 
            (this.tmp_mode === ut.PERSP_SHARING_MSG && this.mode === ut.ROOM_WITHOUT_BOX_MSG);
    }
    let isInBox = () =>{
        return this.mode_id === ut.BOX_VIEW_MSG ||
            this.mode_id === ut.BOX_EDIT_MSG ||
            this.mode_id === ut.BOX_OBJ_MSG ||
            (this.tmp_mode === ut.PERSP_SHARING_MSG && this.mode === ut.BOX_VIEW_MSG);
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
        state.SAVING.INACTIVE = true;
        state.GLOBAL_MENU.INACTIVE = true;
        state.BOX.DISABLED = false;
        state.ROOM.WALKING.DISABLED = true;
        state.MODE.DISABLED = false;


        let menu_active = state.MENU.OPEN || state.GLOBAL_MENU.OPEN || state.SAVING.OPEN || !state.LOGIN.INACTIVE;
        let mode = wu.isNull(state.MODE.TMP_MODE) ? state.MODE.MODE : state.MODE.TMP_MODE;
        switch(mode) {
            case ut.ROOM_WITH_BOX_MSG:
                sandbox.mini_sandbox.comeBack();
                state.MENU.INACTIVE = false;
                state.OBJ.INACTIVE = menu_active;
                state.GLOBAL_MENU.INACTIVE = false;
                state.SAVING.INACTIVE = false;
                break;
            case ut.ROOM_WITHOUT_BOX_MSG:
                sandbox.mini_sandbox.flyAway();
                state.MENU.INACTIVE = false;
                state.OBJ.INACTIVE = menu_active;
                state.GLOBAL_MENU.INACTIVE = false;
                state.SAVING.INACTIVE = false;
                break;
            case ut.BOX_VIEW_MSG:
                state.GLOBAL_MENU.INACTIVE = true;
                break;
            case ut.BOX_EDIT_MSG:
                break;
            case ut.BOX_OBJ_MSG:
                state.MENU.INACTIVE = false;
                state.OBJ.INACTIVE = menu_active;
                sandbox.clear(4);
                state.GLOBAL_MENU.INACTIVE = false;
                state.SAVING.INACTIVE = false;
                break;
            case ut.DIVING_MSG:
                menu_active = true;
                break;
            case ut.ROOM_WALKING_MSG:
                state.ROOM.WALKING.DISABLED = false;
                break;
            case ut.PERSP_SHARING_MSG:
                menu_active = true;
                break;
            case ut.RECEIVE_MSG:
                menu_active = true;
                break;
            default:
                let bug = "you got a bug here";
                console.log(bug);
        }
        this.mode_id = mode;

        this.mode = state.MODE.MODE;
        this.tmp_mode = state.MODE.TMP_MODE;

        state.BOX.DISABLED = state.MENU.OPEN;
        if(isInBox()){
            sandbox.mini_sandbox.comeBack();
            sandbox.room.flyAway();
        }else{
            state.BOX.DISABLED = true;
        }
        if(menu_active){
            state.BOX.DISABLED = true;
            state.MODE.DISABLED = true;
            state.OBJ.INACTIVE =true;
            state.MENU.INACTIVE = true;
            state.GLOBAL_MENU.INACTIVE = true;
            state.SAVING.INACTIVE = true;
        }
        if(state.MENU.OPEN){
            state.MENU.INACTIVE = false;
        }

        if(state.GLOBAL_MENU.OPEN){
            state.GLOBAL_MENU.INACTIVE = false;
        }
        if(state.SAVING.OPEN){
            state.SAVING.INACTIVE = false;
        }

        return state;
    }

    this.animate = (t, state) =>{

        if(state.LOGIN.INACTIVE){
            menu_button.identity().hud().move(0, .47, 0.1).scale(.36, .06, .001).opacity(1);
        } else {
            menu_button.identity().hud().move(0, .47, 0.1).scale(.36, .06, .001).opacity(0.001);
        }
        if(state.MODE.TMP_MODE === ut.PERSP_SHARING_MSG){
            if(bc.isRB()){
                state.PERSPECTIVE.ACTION.MSG = ut.NON_ACTION_MSG;
                state.PERSPECTIVE.ACTION.USER = null;
                state.PERSPECTIVE.ACTION.INFO = null;
                state.MODE.TMP_MODE = null;
            }
        }
        if(state.MODE.DISABLED){
            let mode = wu.isNull(state.MODE.TMP_MODE) ? state.MODE.MODE : state.MODE.TMP_MODE;
            refresh(mode, state);
            return [false, state]
        }
        this.mode_id = state.MODE.MODE;
        if(state.MODE.SWITCH){
            if(state.MODE.IN_ROOM)
                this.mode_id = ut.ROOM_WITHOUT_BOX_MSG;
            else
                this.mode_id = ut.BOX_VIEW_MSG;
            refresh(this.mode_id, state);
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

        refresh(this.mode_id, state);
        state.MODE.IN_ROOM = isInRoom();
        state.MODE.MODE = this.mode_id;
        return [flag, state]

      }

}