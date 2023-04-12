import {buttonState, controllerMatrix, joyStickState} from "../render/core/controllerInput.js";
import {lcb, rcb} from '../handle_scenes.js';
import * as cg from "../render/core/cg.js"
import * as bc from "../sandbox/baseController.js"
import * as ut from "../sandbox/utils.js"



export function CreateBoxController(model, sandbox) {
    // split-merge / box

    let CD = 15;
    this.remove_cnt = -1;
    this.cold_down = -1;
    this.isSpliting = 0;
    this.cursor = model.add("cube").scale(.1).color(1, 0, 0).move(-100, 0, 0);
    this.box_mode = 0;
    this.stick_len = 5;
    this.collection_mode = 0;
    this.menu_id = ut.MENU_DISABLED;


    let rod = model.add("tubeZ").color(1, 0, 1);


    let adjustRodLength = (t) =>{
        let y = joyStickState.right.y;
        if(y > .1){
            this.stick_len -= .1;
        }else if(y < -.1){
            this.stick_len += .1;
        }
        if(this.stick_len > 20)
            this.stick_len = 20
        if(this.stick_len < 1)
            this.stick_len = 1;
    }


    let getPN = () =>{
        let origin = rcb.m.slice(12, 15);
        return [origin, getEndPoint()]
    }
    let focusWall = (direct) =>{
        let res = getPN(direct);
        return sandbox.select(res[0], res[1], this.box_mode);
    }

    let delay = (fn, args, sc) => {
        console.log(this.remove_cnt);
        if(this.remove_cnt <0) {
            this.remove_cnt = CD*sc;
            return false;
        }
        else if(this.remove_cnt >5) {
            this.remove_cnt -= 1;
            return false;
        }else{
            this.remove_cnt = -1;
            if(args === null || args === undefined)
                fn();
            else
                fn(args);
            return true;
        }
    }
    let clearStatus = (s) =>{
        if(s !== 1)
            this.remove_cnt = -1;
        if(s !== 2 ){
            this.isSpliting = 0;

        }


    }
    let split = () =>{
        let res = focusWall(1);

        if(bc.isLX()) {
            clearStatus(3);
            return ut.MENU_REVISE_WALL;
        }if(bc.isRBt2()){
            let args = ["delete", null];
            return delay(sandbox.reviseFocus, args, 2) ? 0 : -1;
        }else if(bc.isRBt1()){
            if(this.isSpliting <= 1){
                sandbox.clear(3);
                if(res[0] !== undefined){
                    sandbox.focus(res, true, this.box_mode, false);
                    this.isSpliting = 2;
                }
            }else{
                if(res[0] !== undefined){
                    sandbox.splitingFocus(res, this.box_mode);
                } else{
                    this.isSpliting = 3;
                    sandbox.spliting(getEndPoint(), this.box_mode);
                }
            }
            return -1;
        }else if(bc.isRB()){
            sandbox.split();
            return 0;
        }else if(bc.isLY()){
            sandbox.clear(0);
            sandbox.clear(2);
            sandbox.focus(res, false, this.box_mode, false);
            clearStatus(0);
            return 0;
        }else{
            clearStatus(0);
            sandbox.focus(res, false, this.box_mode, true);
        }

        return -1;
    }

    let getEndPoint = () =>{
        let m = rod.getMatrix();
        return cg.mMultiply(m, cg.mTranslate([0, 0, -1])).slice(12, 15);

    }

    let box = () =>{
        clearStatus(1);
        sandbox.clear(3);
        if(bc.isRBt1() && bc.isRBt2()) {
            // Pick a location
            this.cursor.identity().move(getEndPoint()).turnX(Math.PI/4)
                .turnZ(Math.PI/4).scale(.01);
            clearStatus(0);
            return -1;
        }else if(bc.isRB()) {
            // Dive into the selected location marked by the cursor
            sandbox.div(this.cursor.getGlobalMatrix().slice(12, 15));
            clearStatus(0);
            return 0;
        }else if(bc.isLY()){
            // add a floor
            sandbox.addFloor();
            clearStatus(0);
            return 0;
        }else if(bc.isLX()){
            // remove a floor
            sandbox.removeFloor();
            clearStatus(1);
            return 0;
        }else if(bc.isLBt1()){
            // expand
            clearStatus(0);
            sandbox.expand();
            return 0;
        }else if(bc.isLBt2()){

            // collapse
            clearStatus(0);
            sandbox.collapse();
            return 0;
        }
        if(bc.isRA()){
            sandbox.clear(3);
            clearStatus(0);
            return 0;
        }
        return -1;

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
        if(mode_id === ut.BOX_VIEW)
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

    this.animate = (t, mode_id, menu_id, menu_status) =>{
        if(menu_status === ut.MENU_OPEN || mode_id === ut.IS_DIVING){
            restoreBeam();
            return [mode_id, menu_id]
        }
        if(menu_id !== ut.MENU_REVISE_WALL) {
            if (mode_id === ut.ROOM_WITH_BOX || mode_id === ut.ROOM_WITHOUT_BOX || mode_id === ut.BOX_OBJ) {
                menu_id = ut.MENU_ADD_OBJ;
            } else {
                menu_id = ut.MENU_DISABLED;
            }
        }

        if(mode_id !== ut.BOX_EDIT && mode_id !== ut.BOX_VIEW){
            restoreBeam();
        }else{
            fixRod(mode_id);
            adjustRodLength(t);
        }

        if(this.cold_down > 0){
            this.cold_down -= 1;
            return [mode_id, menu_id];
        }
        let flag = false;
        if(mode_id === ut.BOX_VIEW){
            sandbox.leaveRoom();
            flag = box() === 0 || flag;

        }else if(mode_id === ut.BOX_EDIT){
            sandbox.leaveRoom();
            let nid = split();
            if(nid > -1){
                flag = true;
                menu_id = (nid === ut.MENU_REVISE_WALL ? ut.MENU_REVISE_WALL : menu_id);
            }
        }else if(mode_id === ut.BOX_OBJ){
            sandbox.leaveRoom();
        }else if(mode_id === ut.ROOM_WITH_BOX){
            sandbox.mini_sandbox.comeBack();
        }else if(mode_id === ut.ROOM_WITHOUT_BOX){
            sandbox.mini_sandbox.flyAway();
        }
        if(sandbox.is_diving)
            mode_id = ut.IS_DIVING

        if(flag){
            this.cold_down = CD;
        }
        return [mode_id, menu_id];

    }
}