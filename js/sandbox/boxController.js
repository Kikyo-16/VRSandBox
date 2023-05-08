import {buttonState, controllerMatrix, joyStickState} from "../render/core/controllerInput.js";
import {lcb, rcb} from '../handle_scenes.js';
import * as cg from "../render/core/cg.js"
import * as bc from "../sandbox/baseController.js"
import * as ut from "../sandbox/utils.js"
import {COLLAPSE_FLOOR_MSG, FOCUS_WALL_MSG, SPLITTING_FOCUS_WALL_MSG} from "../sandbox/utils.js";



export function CreateBoxController(model, sandbox) {
    // split-merge / box

    let CD = 10;
    this.remove_cnt = -1;
    this.cold_down = -1;
    this.isSpliting = 0;
    this.cursor = model.add("cube").scale(.1).color(1, 0, 0).move(-100, 0, 0);
    this.box_mode = 0;
    this.stick_len = 5;
    this.multi_select = 0;
    this.collection_mode = 0;
    this.menu_id = ut.MENU_DISABLED;


    let rod = model.add("tubeZ").color(1, 0, 1);


    let adjustRodLength = (t) =>{
        let y = joyStickState.right.y;
        let flag = false;
        if(y > .1){
            this.stick_len -= .1;
            flag = true;
        }else if(y < -.1){
            this.stick_len += .1;
            flag = true;
        }
        if(this.stick_len > 20)
            this.stick_len = 20
        if(this.stick_len < 1)
            this.stick_len = 1;
        return flag;
    }


    let getPN = () =>{
        let origin = rcb.m.slice(12, 15);
        return [origin, getEndPoint()]
    }
    let focusWall = (direct) =>{
        let res = getPN(direct);
        return sandbox.select(res[0], res[1], this.box_mode);
    }


    let clearStatus = (idx)=>{
        if(idx === 0 || idx >=2)
            this.isSpliting = 0;
        if(idx >=1)
            this.multi_select = 0
    }

    let split = () =>{
        let res = focusWall(1);

        if(bc.isLY()){
            clearStatus(2);
            return [ut.DELETE_WALL_MSG, null];
        }else if(bc.isRBt1()){
            clearStatus(1);
            if(this.isSpliting <= 1){
                if(res[0] !== undefined){
                    this.isSpliting = 2;
                    return [ut.FOCUS_WALL_MSG, [res, true, this.box_mode, false]]
                }
            }else{
                if(res[0] !== undefined){
                    return [ut.SPLITTING_FOCUS_WALL_MSG, res]
                    //sandbox.splitingFocus(res, this.box_mode);
                } else{
                    this.isSpliting = 3;
                    return [ut.SPLITTING_WALL_MSG, getEndPoint()]
                    //sandbox.spliting(getEndPoint(), this.box_mode);
                }
            }

        }else if(bc.isRB()){
            clearStatus(2);
            return [ut.SPLIT_WALL_MSG, null];
        }else if(bc.isRBt2()){
            clearStatus(0);
            this.multi_select += 1;
            return [ut.MULTI_FOCUS_WALL_MSG, [res, false, this.box_mode, false]];
        }else if(bc.isLX()) {
            //clearStatus(2);
            return [ut.REVISE_WALL_MSG, null];
        }else if(bc.isRB()) {
            return [ut.BOX_OBJ_MSG, null];

        }else{
            clearStatus(0);
            return [ut.FOCUS_WALL_MSG, [res, false, this.box_mode, true]];

        }
        return [ut.NON_ACTION_MSG, null];
    }

    let getEndPoint = () =>{
        let m = rod.getMatrix();
        return cg.mMultiply(m, cg.mTranslate([0, 0, -1])).slice(12, 15);

    }

    let box = () =>{

        clearStatus(2);
        if(bc.isRBt1() && bc.isRBt2()) {
            // Pick a location
            this.cursor.identity().move(getEndPoint()).turnX(Math.PI/4)
                .turnZ(Math.PI/4).scale(.01);
            return [ut.PICK_LOCATION_MSG, null];
        }else if(bc.isRB()) {
            // Dive into the selected location marked by the cursor
            //sandbox.div(this.cursor.getGlobalMatrix().slice(12, 15));
            return [ut.DIVING_MSG, this.cursor.getGlobalMatrix().slice(12, 15)];
        }else if(bc.isLY()){
            // add a floor
            return [ut.ADD_FLOOR_MSG, null];
        }else if(bc.isLX()){
            // remove a floor
            //sandbox.removeFloor();
            return [ut.REMOVE_FLOOR_MSG, null];
        }else if(bc.isLBt1()){
            // expand
            return [ut.EXPAND_FLOOR_MSG, null];
        }else if(bc.isLBt2()){
            // collapse
            return [ut.COLLAPSE_FLOOR_MSG, null];
        }
        return [ut.NON_ACTION_MSG, null];

    }
    let fixRod = (mode_id) =>{
        let m = cg.mMultiply(rcb.m,
            cg.mMultiply(
                cg.mRotateX(-Math.PI / 4),
                cg.mMultiply(cg.mScale(.002, .002, this.stick_len * .1),
                    cg.mTranslate(0, 0, -1))));
        rod.setMatrix(m);
        rcb.beam.opacity(0.0001);
        rod.opacity(1);
        if(mode_id === ut.BOX_VIEW_MSG)
            this.cursor.opacity(1);
        else
            this.cursor.opacity(0.0001)
        //.005, .005, this.stick_len / 50
    }


    let restoreBeam = () =>{
        rcb.beam.opacity(1);
        rod.opacity(0.0001);
        this.cursor.opacity(0.0001);
    }

    let reset = (sandbox, idx) =>{
        sandbox.clear(idx);
        this.isSpliting = 0;
    }

    this.clearState = (t, state, sandbox) =>{
        let action = state.BOX.ACTION;
        let act_code = action.MSG;
        let clear = true;
        let args = action.ARG;
        switch(act_code) {
            case ut.DIVING_MSG:
                sandbox.div(args);
                state.MODE["MODE"] = ut.DIVING_MSG;
                state.MODE["ARG"] = sandbox.div_pos;
                break;
            case ut.ADD_FLOOR_MSG:
                sandbox.addFloor(true);
                this.cold_down = CD;
                break;
            case ut.REMOVE_FLOOR_MSG:
                sandbox.removeFloor();
                this.cold_down = CD;
                break;
            case ut.EXPAND_FLOOR_MSG:
                sandbox.expand();
                break;
            case ut.COLLAPSE_FLOOR_MSG:
                sandbox.collapse();
                break;
            case ut.DELETE_WALL_MSG:
                sandbox.reviseFocus(["delete", null]);
                this.cold_down = CD;
                break;
            case ut.FOCUS_WALL_MSG:
                sandbox.focus(args[0], args[1], args[2], args[3]);
                clear = false;
                break;
            case ut.MULTI_FOCUS_WALL_MSG:
                if(this.multi_select === 1)
                    reset(sandbox, 4)

                sandbox.focus(args[0], args[1], args[2], args[3]);
                this.cold_down = CD;
                clear = false;
                break;
            case ut.SPLITTING_WALL_MSG:

                sandbox.spliting(args, this.box_mode)
                clear = false;
                break;
            case ut.SPLITTING_FOCUS_WALL_MSG:
                sandbox.splitingFocus(args, this.box_mode);
                clear = false;
                break;
            case ut.SPLIT_WALL_MSG:
                sandbox.split();
                break;
            case ut.REVISE_WALL_MSG:
                if(sandbox.hasFocus()){
                    state.MENU.INACTIVE = false;
                    state.MENU.REQUIRE = true;
                    this.cold_down = CD;
                }
                clear = false;
                break;
            default:
        }
        state.BOX.ACTION = {
            MSG: ut.NON_ACTION_MSG,
            ARG: null,
        }
        if(this.multi_select > 0)
            clear = false;
        if(clear)
            reset(sandbox, 4);
        return state;
    }

    this.animate = (t, state) =>{
        if(state.BOX.DISABLED){
            restoreBeam();
            return [false, state];
        }
        let flag = false;
        if(state.MODE.MODE === ut.BOX_OBJ_MSG || state.MODE.MODE === ut.DIVING_MSG){
            restoreBeam();
            clearStatus(2);
        }
        else{
            fixRod(state.MODE.MODE);
            adjustRodLength(t);
        }


        if(this.cold_down > 0){
            this.cold_down -= 1;
            return [flag, state];
        }
        if(!flag){
            if (state.MODE.MODE !== ut.DIVING_MSG) {
                let res = [ut.NON_ACTION_MSG, null];
                if(state.MODE.MODE === ut.BOX_VIEW_MSG)
                    res = box();
                if(res[0] === ut.NON_ACTION_MSG && state.MODE.MODE === ut.BOX_EDIT_MSG) {
                    res = split();
                }
                state.BOX.ACTION = {
                    MSG: res[0],
                    ARG: res[1]
                }
                flag = res[0] !== ut.NON_ACTION_MSG;
            } else {
                flag = state.BOX.ACTION.MSG !== ut.NON_ACTION_MSG;
            }
            
        }
        return [flag, state];
    }
}