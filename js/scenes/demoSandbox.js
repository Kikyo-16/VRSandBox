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
   //let cube = model.add("cube").move(0, 1.5, 0).scale(.2)
   model.animate(() => {
      mode_controller.animate(model.time, sandbox.in_room, box_controller.sandbox_mode_id);
      let require_mode = box_controller.animate(model.time, mode_controller.getModeID());
      //menu_controller.setMode(mode_controller.getModeID());
      let menu_status = menu_controller.animate(model.time, menu_model, require_mode);
      box_controller.recieveObj(menu_status);

      let collection_mode = box_controller.getObjCollection(mode_controller.getModeID());
      //if(collection_mode === 0){
      //   cube.move(.5, 0, 0)
      //}
      let obj_collection = sandbox.getObjCollection(collection_mode);
      let delete_idx = obj_controller.animate(model.time, obj_collection, menu_status[0]);
      sandbox.removeObj(collection_mode, delete_idx);
      sandbox.animate(model.time);

   });
}