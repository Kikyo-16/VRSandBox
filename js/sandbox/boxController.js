import * as cg from "../render/core/cg.js";
import { controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";
import { lcb, rcb } from '../handle_scenes.js';


export function ObjController(){

    this.animation = (obj, t) =>{
        //obj[0]: obj selected by the left controller (undefined for unselected)
        //obj[1]: obj selected by the right controller (undefined for unselected)
        if(obj[0] === obj[1]){
            //TODO if the two controllers point the same object, then resize

        }else{
            //TODO check if grab/place/delete/
        }

    }

}