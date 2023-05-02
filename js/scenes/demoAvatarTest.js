import * as cg from "../render/core/cg.js";
import * as wu from '../sandbox/wei_utils.js'
import {CreateVRSandbox} from '../sandbox/sandbox.js'
import {CreateBoxController}  from '../sandbox/boxController.js'
import {CreateObjController}  from '../sandbox/objController.js'
import {CreateMenuController}  from '../sandbox/menuController.js'
import {CreateModeController}  from '../sandbox/modeController.js'
import {CreateRoomController}  from '../sandbox/roomController.js'
import {CreateAvatarController}  from '../sandbox/avatarController.js'
import * as ut from '../sandbox/utils.js'


export const init = async model => {
    model.setTable(false);
    model.setRoom(false);

    let menu_model = model.add();
    let box_model = model.add();
    let obj_model = model.add();
    let mode_model = model.add();
    let sandbox_model = model.add();
    let room_model = model.add();
    let avatar_model = model.add();

    let sandbox = new CreateVRSandbox(sandbox_model);
    sandbox.initialize()

    let mode_controller = new CreateModeController(mode_model);
    let box_controller = new CreateBoxController(box_model, sandbox);
    let menu_controller = new CreateMenuController()
    menu_controller.init(menu_model);
    let obj_controller = new CreateObjController(obj_model);
    let room_controller = new CreateRoomController(sandbox);
    
    let avatar_controller = new CreateAvatarController(sandbox_model);
    console.log("ctrs created");

    let local_user = 'sam';
    let msg = new Map();
    msg.set('sam', new Map([['ID', 0],['IN_BOX', false], ['RM', [1,0,0,0, 0,1,0,0, 0,0,1,0, Math.random()*1, .00, 1.25, 0]],['VM', null]]));
    msg.set('tom', new Map([['ID', 1],['IN_BOX', true], ['RM',  [1,0,0,0, 0,1,0,0, 0,0,1,0, .5, .00, .5, 0]],['VM', null]]));
    msg.set('tim', new Map([['ID', 2],['IN_BOX', true], ['RM',  [1,0,0,0, 0,1,0,0, 0,0,1,0, .25, .00, .25, 0]],['VM', null]]));
    msg.set('jay', new Map([['ID', 3],['IN_BOX', false], ['RM', [1,0,0,0, 0,1,0,0, 0,0,1,0, -.25, .00, .25, 0]],['VM', null]]));
    console.log("msg", msg);
    avatar_controller.initialize(msg, local_user, sandbox.room, sandbox.mini_sandbox);
    console.log("avatars initialized");

    let mode_id = ut.BOX_VIEW;
    let menu_id = ut.MENU_DISABLED;
    let menu_status = [ut.MENU_CLOSE, null];

    let t = model.time;

    // mode_controller.debugInRoom();
    model.animate(() => {

        mode_id = mode_controller.animate(model.time, mode_id, sandbox.is_diving);
        menu_id = mode_controller.clearMenuID(sandbox, menu_id, menu_status);

        if (model.time - t >= 20) {
            console.log("add user");
            msg.set('ray', new Map([['ID', 4],['IN_BOX', false], ['RM', [1,0,0,0, 0,1,0,0, 0,0,1,0, -.3-Math.random()*.1, .00, -.25, 0]],['VM', null]]));
            // msg.delete('tom');
            // console.log(msg);
            msg.set('tom', new Map([['ID', 1],['IN_BOX', true], ['RM',  [1,0,0,0, 0,1,0,0, 0,0,1,0, .5 - Math.random()*.25, .08, .5, 0]],['VM', null]]));
            msg.set('tim', new Map([['ID', 2],['IN_BOX', true], ['RM',  [1,0,0,0, 0,1,0,0, 0,0,1,0, Math.random()*.25+.25, .08, .25, 0]],['VM', null]]));
            msg.set('jay', new Map([['ID', 3],['IN_BOX', false], ['RM', [1,0,0,0, 0,1,0,0, 0,0,1,0, -.3-Math.random()*.1, .00, .25, 0]],['VM', null]]));
            
            // msg.set('sam', new Map([['ID', 1],['IN_BOX', false], ['RM',  [1,0,0,0, 0,1,0,0, 0,0,1,0, -.25+.1*Math.random(), .08, .25, 0, 0]],['VM', null]]));
            msg.set('sam', msg.get('tom'));
            avatar_controller.animate(msg, sandbox);
        }

        //avatar_controller.animate(msg, sandbox);

        room_controller.animate(model.time, mode_id);

        let res = box_controller.animate(model.time, mode_id, menu_id, menu_status[0]);
        mode_id = res[0];
        menu_id = res[1];

        let inactive = !mode_controller.parseCodeForMenu(menu_id);
        menu_status = menu_controller.animate(model.time, menu_model, menu_id, inactive);

        let collection_mode = mode_controller.getCollectionCode();
        let obj_collection = sandbox.getObjCollection(collection_mode);
        let ctrl_code = mode_controller.parseCodeForCrl(menu_status[0]);

        let obj_index = obj_controller.animate(model.time, obj_collection, ctrl_code);

        // Remove selected object if any selection
        sandbox.removeObj(collection_mode, obj_index[0]);
        // Modify selected object if any selection
        sandbox.refreshObj(collection_mode, obj_index[1]);
        // Diving animation

        sandbox.animate(model.time);


   });

}

