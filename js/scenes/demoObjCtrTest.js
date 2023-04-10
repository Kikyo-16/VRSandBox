
import * as cg from "../render/core/cg.js";
// import {CreateVRSandbox} from '../sandbox/sandbox.js'
// import {CreateBoxController}  from '../sandbox/boxController.js'
import {CreateObjController}  from '../sandbox/objController.js'
// import {CreateMenuController}  from '../sandbox/menuController.js'
//import {CreateModeController}  from '../sandbox/modeController.js'

import {Object}  from '../sandbox/objCollection.js'

export const init = async model => {
   model.setTable(false);
   // let menu_model = model.add();
   // let box_model = model.add();
   let obj_model = model.add();
   let mode_model = model.add();
   // let sandbox_model = model.add();

   //let mode_controller = new CreateModeController(mode_model);
   //let menu_controller = new CreateMenuController();
   //let sandbox = new CreateVRSandbox(sandbox_model)
   let obj_controller = new CreateObjController(obj_model);

   // create test obj
   let t = new Date();
   let obj = new Object();
   let obj1 = new Object();
   let obj2 = new Object();
   let obj3 = new Object();
   obj.init(obj_model, 'cube', [0,1,.2], .1, t.getTime());
   obj1.init(obj_model, 'sphere', [0, 1, .1], .1, t.getTime());
   obj2.init(obj_model, 'cube', [.5,1,0], .1, t.getTime());
   obj3.init(obj_model, 'donut', [.5,.8,-.1], .1, t.getTime());
   let obj_collection = [obj, obj1, obj2, obj3];
   
   model.animate(() => {
      obj_controller.animate(model.time, obj_collection);
   });
}

