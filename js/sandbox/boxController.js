import {buttonState, controllerMatrix, joyStickState} from "../render/core/controllerInput.js";
import {lcb, rcb} from '../handle_scenes.js';
import * as cg from "../render/core/cg.js"
import {SANDBOX_MODES, REQUIRE_NEW_OBJ, NON_ACTION, REQUIRE_WALL_PROP, SANDBOX_OBJ} from "../sandbox/utils.js";



export function CreateBoxController(model, sandbox) {
    // split-merge / box

    let CD = 15;
    this.remove_cnt = -1;
    this.cold_down = -1;
    this.isSpliting = 0;
    this.cursor = model.add("cube").scale(.1).color(1, 0, 0).move(-100, 0, 0);
    this.box_mode = 0;
    this.stick_len = 5;
    this.require_mode = NON_ACTION;
    this.sandbox_mode_id = 0;


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
    let isLY = () =>{
        return buttonState.left[5].pressed;
    }
    let isLX = () =>{
        return buttonState.left[4].pressed;
    }
    let isRB = () =>{
        return buttonState.right[5].pressed;
    }
    let isRA = () =>{
        return buttonState.right[4].pressed;
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
        if(s !== 3 ){
            this.require_mode = NON_ACTION;

        }

    }
    let split = () =>{
        let res = focusWall(1);

        if(isLX()) {
            this.require_mode = REQUIRE_WALL_PROP;
            clearStatus(3);
            return true;
        }if(isRBt2()){
            let args = ["delete", null];
            return delay(sandbox.reviseFocus, args, 2);
            //return true;
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
        }else if(isRB()){
            sandbox.split();
            return false;
        }else if(isLY()){
            sandbox.clear(0);
            sandbox.clear(2);
            sandbox.focus(res, false, this.box_mode, false);
            clearStatus(0);
            return true;
        }/*else if(isLBt2()){
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
        clearStatus(1);
        sandbox.clear(3);
        if(isRBt1() && isRBt2()) {
            // Pick a location
            this.cursor.identity().move(getEndPoint()).turnX(Math.PI/4)
                .turnZ(Math.PI/4).scale(.01);
            clearStatus(0);
            return false;
        }else if(isRB()) {
            // Dive into the selected location marked by the cursor
            sandbox.div(this.cursor.getGlobalMatrix().slice(12, 15));
            clearStatus(0);
            return true;
        }else if(isLY()){
            // add a floor
            sandbox.addFloor();
            clearStatus(0);
            return true;
        }else if(isLX()){
            // remove a floor
            sandbox.removeFloor();
            clearStatus(1);
            return true;
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
    this.getObjCollection = (modeID) =>{
        if(modeID === 1){
            return 1;
        }else if(this.sandbox_mode_id === 2){
            return 0;
        }else{
            return -2;
        }
    }
    this.recieveObj = (res) =>{
        let menu_mode = res[0];
        let obj = res[1];
        if(obj !==null && obj !== undefined){
            if(this.require_mode === NON_ACTION){
                if(menu_mode === 0)
                    sandbox.addObj(obj, 1);
            }else if(this.require_mode === REQUIRE_WALL_PROP){
                if(menu_mode === 0)
                    sandbox.reviseFocus(["texture", obj]);
            }
            this.require_mode = NON_ACTION;
        }

    }
    let changeMode = () =>{
        if(isRA()){
            this.sandbox_mode_id = (this.sandbox_mode_id + 1) % SANDBOX_MODES.length;
            clearStatus(0);
            return true;
        }
        return false
    }
    let restoreBeam = () =>{
        rcb.beam.opacity(1);
        rod.opacity(0.0001);
        this.cursor.opacity(0.0001);
    }
    this.animate = (t, modeID) =>{
        if(modeID === 1){
            restoreBeam();
            return REQUIRE_NEW_OBJ;
        }
        if(this.require_mode > 0){
            restoreBeam();
            return this.require_mode;
        }

        //box obj mode
        if(this.sandbox_mode_id === 2) {
            restoreBeam();
        }else{
            sandbox.leaveRoom();
            rcb.beam.opacity(0.0001);
            rod.opacity(1);
        }
        if(this.sandbox_mode_id === 0)
            this.cursor.opacity(1);
        else
            this.cursor.opacity(0.0001);
        fixRod();
        if(this.cold_down > 0){
            this.cold_down -= 1;
            return this.require_mode;
        }
        let flag = false;
        adjustRodLength(t);

        //box edit
        flag = changeMode() || flag;
        if(!flag&&this.sandbox_mode_id === 1)
            flag = split() || flag;
        //box view
        else if(this.sandbox_mode_id === 0)
            flag = box() || flag;

        if(flag){
            this.cold_down = CD;
        }
        return this.sandbox_mode_id === 2 ? SANDBOX_OBJ : this.require_mode;

    }
}