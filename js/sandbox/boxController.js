import {buttonState, controllerMatrix, joyStickState} from "../render/core/controllerInput.js";
import {lcb, rcb} from '../handle_scenes.js';
import * as cg from "../render/core/cg.js"
import {MODES} from "../sandbox/utils.js"



export function CreateBoxController(model, sandbox) {
    // split-merge / box

    let CD = 15;
    this.remove_cnt = -1;
    this.cold_down = -1;
    this.isSpliting = 0;
    this.cursor = model.add("cube").scale(.1).color(1, 0, 0).move(-100, 0, 0);
    this.box_mode = 0;
    this.stick_len = 5;

    let rod = model.add("tubeZ").color(1, 0, 1);


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

    let delay = (fn, sc) => {
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
            fn();
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

        if(isRBt1()&&isRBt2()) {
            //pop menu change color texture
            clearStatus(0);
            return true;
        }if(isLBt1()&&isLBt2()){
            return delay(sandbox.deleteFocus, 2);
        }else if(isRBt1()){
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
            return false;
        }else if(isRBt2()){
            //clearStatus(1);
            //return remove(sandbox.deleteFocus);
            sandbox.split();
            return false;
        }/*else if(isLBt1()){
            let res = focusWall(0);
            if(res !== undefined){
                sandbox.focus(res, false, this.box_mode)
            }
            clearStatus(0);
            return true;
        }else if(isLBt2()){
            sandbox.merge();
            clearStatus(0);
            return true;
        }


        }*/else{
            clearStatus(0);
            sandbox.focus(res, false, this.box_mode, true);
        }

        return false;
    }

    let getEndPoint = () =>{
        let m = rod.getMatrix();
        return cg.mMultiply(m, cg.mTranslate([0, 0, -1])).slice(12, 15);

    }

    let box = () =>{
        if(isRBt1() && isRBt2()) {
            // Pick a location
            this.cursor.identity().move(getEndPoint()).turnX(Math.PI/4)
                .turnZ(Math.PI/4).scale(.01);
            clearStatus(0);
            return false;
        }else if(isLBt1() && isLBt2()) {
            // Dive into the selected location marked by the cursor
            sandbox.div(this.cursor.getGlobalMatrix().slice(12, 15));
            clearStatus(0);
            return true;
        }else if(isRBt1()){
            // add a floor
            sandbox.addFloor();
            clearStatus(0);
            return true;
        }else if(isRBt2()){
            // remove a floor
            clearStatus(1);
            return delay(sandbox.removeFloor, 2);
        }else if(isLBt1()){
            // expand
            clearStatus(0);
            sandbox.expand();
            return true;
        }else if(isLBt2()){

            // collapse
            clearStatus(0);
            sandbox.collapse();
            return true;
        }

        clearStatus(0);
        return false;

    }
    let fixRod = () =>{
        let m = cg.mMultiply(rcb.m,
            cg.mMultiply(
                cg.mRotateX(-Math.PI / 4),
                cg.mMultiply(cg.mScale(.002, .002, this.stick_len * .1),
                    cg.mTranslate(0, 0, -1))));
        rod.setMatrix(m);
        //.005, .005, this.stick_len / 50
    }

    this.animate = (t, modeID) =>{
        if(modeID !== 1 && modeID !== 0){
            rcb.beam.opacity(1);
            rod.opacity(0.0001);
            this.cursor.opacity(0.0001);
            return
        }
        sandbox.leaveRoom();
        rcb.beam.opacity(0.0001);
        rod.opacity(1);
        if(modeID === 0)
            this.cursor.opacity(1);
        else
            this.cursor.opacity(0.0001);
        fixRod();
        if(this.cold_down > 0){
            this.cold_down -= 1;
            return;
        }
        adjustRodLength(t);
        let flag = false;
        if(modeID === 1)
            flag = split() || flag;
        else if(modeID === 0)
            flag = box() || flag;

        if(flag){
            this.cold_down = CD;
        }


    }
}