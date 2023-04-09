import * as cg from "../render/core/cg.js";
import {CreateVRSandbox} from "../sandbox/sandbox.js";
import {CreateBoxController}  from '../sandbox/boxController.js'
import {CreateMenuController} from '../sandbox/menuController.js'


export const init = async model => {
   model.setTable(false);

   let box_model = model.add();
   let sandbox_model = model.add();
   let menu_model = model.add();

   sandbox_model.move(0, .5, 0);
   let sandbox = new CreateVRSandbox(sandbox_model);
   sandbox.addFloor();

   let menu_controller = new CreateMenuController(menu_model)
   let box_controller = new CreateBoxController(box_model);

   model.animate(() => {
      box_controller.animate(model.time);
      menu_controller.animate(model.time);


   });
}

