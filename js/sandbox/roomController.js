import * as ut from "../sandbox/utils.js"
import * as wu from "../sandbox/wei_utils.js"
import {joyStickState} from "../render/core/controllerInput.js";
import * as bc from "../sandbox/baseController.js"



export function CreateRoomController(sandbox) {
    this.speed = 10;
    let cold_down = -1;
    let CD = -1;

    let getDirect = () =>{
        let direct = -1;
        let y = joyStickState.right.y;
        if(y > .1){
            direct = ut.WALKING_FORWARD;
        }else if(y < -.1){
            direct = ut.WALKING_BACKWARD;
        }
        let x= joyStickState.right.x;
        if(x > .1){
            direct = ut.WALKING_LEFT;
        }else if(x < -.1){
            direct = ut.WALKING_RIGHT;
        }
        return direct;
    }

    let getSpeed = () =>{
        if(bc.isLY()){
            this.speed += 1;
        }else if(bc.isLX()){
            this.speed -= 1;
        }
        if(this.speed < 1)
            this.speed = 1;
        if(this.speed > 20)
            this.speed = 20;
    }

    let walking = () => {
        let n = [0, 0, 1];//TODO
        let ln = [1, 0, 0];//TODO
        let direct = getDirect();
        let sc = this.speed * .01;
        if(direct === ut.WALKING_BACKWARD){
            sandbox.move(wu.mulScaler(n, sc));
        }else if(direct === ut.WALKING_FORWARD){
            sandbox.move(wu.mulScaler(n, -sc));
        }else if(direct === ut.WALKING_RIGHT){
            sandbox.move(wu.mulScaler(ln, sc));
        }else if(direct === ut.WALKING_LEFT){
            sandbox.move(wu.mulScaler(ln, -sc));
        }else {
            return false;
        }
        return true;

    }


    this.animate = (t, mode_id) => {
        if (mode_id !== ut.ROOM_WALKING)
            return;

        if (cold_down > 0) {
            cold_down -= 1;
            return
        }
        getSpeed();
        if(walking())
            cold_down = CD;
    }
}