//import {getSelectedObj, unselectAll} from '../sandbox/baseController.js'
//import {}  from '../sandbox/boxController.js'
import {CreateObjController}  from '../sandbox/objController.js'
//import {CreateMenuController}  from '../sandbox/menuController.js'
//import {customClays} from '../sandbox/defineClays.js'
import {Object}  from '../sandbox/objCollection.js'

export const init = async model => {
   model.setTable(false);
   //customClays();
   //let world = model.add("cube");
   let obj_controller = new CreateObjController();
   //let menu_controller = new CreateMenuController();

   let world = model.add();
   let t = new Date();
   let obj = new Object();
   obj.init(model, 'cube', [0,1,0], .1, t.getTime());

   let obj1 = new Object();
   obj1.init(model, 'sphere', [-.5, 1, 0], .1, t.getTime());

   model.animate(() => {
      //unselectAll(world);
      //let selected_obj = getSelectedObj(world);
      //menu_controller.animation(world, selected_obj, model.time);
      //obj_controller.animation(world, selected_obj, model.time);
      
      //obj_controller.animation(world, [obj, obj], model.time);
      obj_controller.animation(world, [obj, obj1], model.time);
   });
}

