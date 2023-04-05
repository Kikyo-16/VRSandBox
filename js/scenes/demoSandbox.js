import {getSelectedObj, unselectAll} from '../sandbox/baseController.js'
import {}  from '../sandbox/boxController.js'
import {CreateObjController}  from '../sandbox/objController.js'
import {CreateMenuController}  from '../sandbox/menuController.js'
import {customClays} from '../sandbox/defineClays.js'


export const init = async model => {
   customClays();
   let world = model.add("cube");
   let obj_controller = new CreateObjController();
   let menu_controller = new CreateMenuController();

   model.animate(() => {
      //unselectAll(world);
      let selected_obj = getSelectedObj(world);
      menu_controller.animation(world, selected_obj, model.time);
      obj_controller.animation(world, selected_obj, model.time);

   });
}

