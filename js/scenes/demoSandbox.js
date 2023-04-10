import * as cg from "../render/core/cg.js";
import {CreateVRSandbox} from '../sandbox/sandbox.js'
import {CreateBoxController}  from '../sandbox/boxController.js'
import {CreateObjController}  from '../sandbox/objController.js'
import {CreateMenuController}  from '../sandbox/menuController.js'
import {CreateModeController}  from '../sandbox/modeController.js'


export const init = async model => {
   model.setTable(false);
   model.setRoom(false);
   let menu_model = model.add();
   let box_model = model.add();
   let obj_model = model.add();
   let mode_model = model.add();
   let sandbox_model = model.add();

   let sandbox = new CreateVRSandbox(sandbox_model);
   sandbox.initialize()
   //model.add("cube").color(1, 0, 0).move([0.5, .84, -.0]).scale(.02);

   let mode_controller = new CreateModeController(mode_model);
   let box_controller = new CreateBoxController(box_model, sandbox);
   let menu_controller = new CreateMenuController()
   let obj_controller = new CreateObjController(obj_model);


   model.animate(() => {
      mode_controller.animate(model.time, sandbox.in_room);
      let require_mode = box_controller.animate(model.time, mode_controller.getModeID());
      //menu_controller.setMode(mode_controller.getModeID());
      let created_obj = menu_controller.animate(model.time, menu_model, require_mode);
      box_controller.recieveObj(created_obj);
      //obj_controller.animate(model.time, box_controller.getObjCollection(mode_controller.getModeID()));
      sandbox.animate(model.time);

   });
}