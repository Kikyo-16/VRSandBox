import * as cg from "../render/core/cg.js";
import {CreateVRSandbox} from '../sandbox/sandbox.js'
import {CreateBoxController}  from '../sandbox/boxController.js'
import {CreateObjController}  from '../sandbox/objController.js'
import {CreateMenuController}  from '../sandbox/menuController.js'
import {CreateModeController}  from '../sandbox/modeController.js'


export const init = async model => {
   model.setTable(false);
   let menu_model = model.add();
   let box_model = model.add();
   let obj_model = model.add();
   let mode_model = model.add();
   let sandbox_model = model.add();

   let sandbox = new CreateVRSandbox(sandbox_model)
   let mode_controller = new CreateModeController(mode_model);
   /*let box_controller = new CreateBoxController(box_model, sandbox);
   let obj_controller = new CreateObjController(obj_model);
   let menu_controller = new CreateMenuController(menu_model)*/

   model.animate(() => {
      mode_controller.animate(model.time);

      /*menu_controller.animate(model.time, sandbox.getRoom());
      obj_controller.animate(model.time, sandbox.getObjCollection());

      box_controller.animate(model.time);
      box_controller.setMode(mode_controller.getMode());
      obj_controller.setMode(mode_controller.getMode());
      menu_controller.setMode(mode_controller.getMode());*/

   });
}