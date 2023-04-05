import * as cg from "../render/core/cg.js";
import { controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";
import { lcb, rcb } from '../handle_scenes.js';


export function CreateObjController(){

    this.animation = (world, obj, t) =>{
        //obj[0]: obj selected by the left controller (undefined for unselected)
        //obj[1]: obj selected by the right controller (undefined for unselected)

        //TODO if the two controllers point the same object, then resize
        //TODO grab/place/delete

    }

}