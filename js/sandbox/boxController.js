import {buttonState, controllerMatrix, joyStickState} from "../render/core/controllerInput.js";
import {lcb, rcb} from '../handle_scenes.js';
import {CreateVRSandbox} from "../sandbox/sandbox.js";


let newSandBox = (model) =>{
    let p = controllerMatrix.right.slice(12, 15);
    p[2] = p[2] - 1;
    let sandbox = new CreateVRSandbox(model);
    p = [0, 1.5, 1];
    model.move(p).scale(.1);
    return sandbox
}

export function CreateBoxController(model) {
    // split-merge / box

    let CD = 10;
    let mode = "box";
    let cbs = [lcb, rcb];
    this.sandbox = newSandBox(model);
    this.remove_cnt = -1;
    this.cold_down = -1;
    this.isSpliting = false;
    this.cursor = model.add("cube").scale(.1).color(1, 0, 0);
    this.box_mode = 0;


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


    let adjustBeamLength = (t, direct) =>{
        if(Math.cos(t) > 0)
            return
        let y = direct === "left" ? joyStickState.left.y : joyStickState.right.y;
        let idx = direct === "left" ? 0 : 1;
        if(y > .1){
            cbs[idx].beam.scale(1.1);
        }else if(y < -.1){
            cbs[idx].beam.scale(0.9);
        }
    }


    let focusWall = () =>{
        let p = 1;
        let n = 1;
        return this.sandbox.select(p, n);
    }
    let remove = (fn) => {
        console.log(this.remove_cnt);
        if(this.remove_cnt <0) {
            this.remove_cnt = CD*5;
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
        if(s !== 2){
            if(this.isSpliting){
                this.sandbox.split();
                this.isSpliting = false;
            }
        }

    }
    let split = () =>{
        if(isRBt1()&&isRBt2()){
            //pop menu change color texture
            clearStatus(0);
            return true;
        }else if(isRBt1()){
            let w = focusWall();
            if(!this.isSpliting){
                if(w !== undefined){
                    this.sandbox.focus(w[0], w[1], true);
                    this.isSpliting = true;
                }
            }else{
                if(w !== undefined){
                    this.sandbox.splitingFocus(w[0], w[1]);
                } else{
                    let p = 1;
                    this.sandbox.spliting(p);
                }
            }
            clearStatus(2);
            return false;
        }else if(isRBt2()){
            clearStatus(1);
            return remove(this.sandbox.deleteFocus);
        }else if(isLBt1()){
            let w = focusWall();
            if(w !== undefined){
                this.sandbox.focus(w[0], w[1], false)
            }
            clearStatus(0);
            return true;
        }else if(isLBt2()){
            this.sandbox.merge();
            clearStatus(0);
            return true;
        }

        clearStatus(0);
        return false;
    }


    let div = () =>{

    }
    let getEndPoint = () =>{

    }

    let box = () =>{
        if(isRBt1() && isRBt1()) {
            // Pick a location
            this.cursor.identity().turnX(Math.PI/4)
                .turnZ(Math.PI/4).move(getEndPoint());
            clearStatus(0);
            return true;
        }else if(isRBt2() && isRBt2()) {
            // Dive into the selected location marked by the cursor
            this.sandbox.div(this.cursor.getGlobalMatrix().slice(12, 15));
            clearStatus(0);
            return true;
        }else if(isRBt1()){
            // add a floor
            this.sandbox.addFloor();
            clearStatus(0);
            return true;
        }else if(isRBt2()){
            // remove a floor
            clearStatus(1);
            return remove(this.sandbox.removeFloor);
        }else if(isLBt1()){
            // expand
            clearStatus(0);
            return this.sandbox.expand();
        }else if(isLBt2()){
            // collapse
            clearStatus(0);
            return this.sandbox.gather();
        }

        clearStatus(0);
        return false;

    }

    this.animation = (t) =>{
        adjustBeamLength(t, "left");
        adjustBeamLength(t, "right");
        if(this.cold_down > 0){
            this.cold_down -= 1;
            return;
        }
        let flag = false;
        if(mode === "split")
            flag = split() || flag;
        else if(mode === "div")
            flag = div() || flag;
        else if(mode === "box")
            flag = box() || flag;
        if(flag){
            this.cold_down = CD;
        }

    }
}