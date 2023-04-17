import * as cg from "../render/core/cg.js";
import * as wu from '../sandbox/wei_utils.js'
import {CreateVRSandbox} from '../sandbox/sandbox.js'
import {CreateBoxController}  from '../sandbox/boxController.js'
import {CreateObjController}  from '../sandbox/objController.js'
import {CreateMenuController}  from '../sandbox/menuController.js'
import {CreateModeController}  from '../sandbox/modeController.js'
import {CreateRoomController}  from '../sandbox/roomController.js'
import * as ut from '../sandbox/utils.js'
import {getOPs, sendOPs, refreshScene, register} from '../sandbox/croquetlib.js'


export const init = async model => {
    model.setTable(false);
    model.setRoom(false);

    let menu_model = model.add();
    let box_model = model.add();
    let obj_model = model.add();
    let mode_model = model.add();
    let sandbox_model = model.add();
    let room_model = model.add();

    let sandbox = new CreateVRSandbox(sandbox_model);
    sandbox.initialize()
    let mode_controller = new CreateModeController(mode_model);
    let box_controller = new CreateBoxController(box_model, sandbox);
    let menu_controller = new CreateMenuController()
    menu_controller.init(menu_model);
    let obj_controller = new CreateObjController(obj_model);
    let room_controller = new CreateRoomController(sandbox);
    let cur = 0;
    register("SanboxV0.2")
    let mode_id = ut.BOX_VIEW;
    let menu_id = ut.MENU_DISABLED;
    let menu_status = [ut.MENU_CLOSE, null];
    //let action_msg = ut.NON_ACTION_MSG;

    let debug = false;
    model.animate(() => {

        let rev_msg = getOPs();
        let send_msg = sandbox.executeOP(rev_msg);
        if(!wu.isNull(send_msg))
            sendOPs(sandbox.wrapOP(send_msg.code, send_msg.args));

        mode_id = mode_controller.animate(model.time, mode_id, sandbox.is_diving);
        menu_id = mode_controller.clearMenuID(sandbox, menu_id, menu_status);

        room_controller.animate(model.time, mode_id);

        let res = box_controller.animate(model.time, mode_id, menu_id, menu_status[0]);
        mode_id = res[0];
        menu_id = res[1];

        sendOPs(sandbox.wrapOP(res[2], null))
        if(debug){
            sendOPs(sandbox.wrapOP(ut.ADD_FLOOR_MSG, null))
            debug = false;
        }

        let inactive = !mode_controller.parseCodeForMenu(menu_id);
        menu_status = menu_controller.animate(model.time, menu_model, menu_id, inactive);

        let collection_mode = mode_controller.getCollectionCode();
        let obj_collection = sandbox.getObjCollection(collection_mode);
        let ctrl_code = mode_controller.parseCodeForCrl(menu_status[0]);

        let obj_index = obj_controller.animate(model.time, obj_collection, ctrl_code);


        // Remove selected object if any selection
        //sandbox.removeObj(collection_mode, obj_index[0]);
        sendOPs(sandbox.wrapOP(ut.REMOVE_OBJ_MSG, [collection_mode, obj_index[0]]))
        // Modify selected object if any selection
        //sandbox.refreshObj(collection_mode, obj_index[1]);
        sendOPs(sandbox.wrapOP(ut.REVISE_OBJ_MSG, [collection_mode, obj_index[1]]))
        // Diving animation

        sandbox.animate(model.time);


   });

}

