import * as cg from "../render/core/cg.js";
import {CreateBoxController}  from '../sandbox/boxController.js'
import {customClays} from '../sandbox/defineClays.js'


export const init = async model => {
   model.setTable(false);
   let box_controller = new CreateBoxController(model);

   model.animate(() => {
      box_controller.animation(model.time);


   });
}

