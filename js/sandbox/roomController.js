import * as ut from "../sandbox/utils.js"
import * as wu from "../sandbox/wei_utils.js"
import {joyStickState} from "../render/core/controllerInput.js";
import {lcb, rcb} from '../handle_scenes.js';
import * as bc from "../sandbox/baseController.js"
import * as cg from "../render/core/cg.js";



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
        let end = cg.mMultiply(views[0]._viewMatrix, cg.mTranslate(0, 0, 1)).slice(12, 15);
        let origin = views[1]._viewMatrix.slice(12, 15);
        let front = cg.subtract(end, origin);
        front[1] = 0;
        front[0] = -front[0];
        let direct = getDirect();
        let sc = this.speed * .01;
        if(direct === ut.WALKING_BACKWARD){
            sandbox.move(wu.mulScaler(front, sc));
        }else if(direct === ut.WALKING_FORWARD){
            sandbox.move(wu.mulScaler(front, -sc));
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