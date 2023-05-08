import {CreateVRSandbox} from '../sandbox/vr_sandbox.js'
import {CreateBoxController} from '../sandbox/boxController.js'
import {CreateObjController} from '../sandbox/objController.js'
import {CreateMenuController} from '../sandbox/menuController.js'
import {CreateModeController} from '../sandbox/modeController.js'
import {CreateRoomController} from '../sandbox/roomController.js'
import {CreateMultiplayerController} from "../sandbox/multiplayerController.js";
import {CreateLoginMenuController } from '../sandbox/loginMenuController.js'
import * as ut from '../sandbox/utils.js'

import * as croquet from "../util/croquetlib.js";

export let updateModel = msg => {
    if(window.demoDemoSandboxState) { // use window.demo[your-demo-name]State to see if the demo is active. Only update the croquet interaction when the demo is active.
        console.log("update");
        window.clay.model.multi_controller.updateScene(msg);
    }
}


export const init = async model => {

    model.setTable(false);
    model.setRoom(false);

    let menu_model = model.add();
    let box_model = model.add();
    let obj_model = model.add();
    let mode_model = model.add();
    let sandbox_model = model.add();
    let multi_model = model.add()
    //let room_model = model.add();
    let login_menu_model = model.add();

    let sandbox = new CreateVRSandbox(sandbox_model);
    sandbox.initialize()
    let mode_controller = new CreateModeController(mode_model);
    let box_controller = new CreateBoxController(box_model, sandbox);
    let obj_controller = new CreateObjController(obj_model);
    let room_controller = new CreateRoomController(sandbox);

    let menu_controller = new CreateMenuController();
    menu_controller.init(menu_model);

    //let login_controller = new CreateLoginMenuController();
    //login_controller.init(login_menu_model);



    let state_msg = {
        RESUME: true,
        MODE: {
            DISABLED: false,
            SWITCH: false,
            IN_ROOM: false,
            MODE: ut.BOX_VIEW_MSG,
            ARG: null,
        },
        MENU: {
            INACTIVE: true,
            OPEN: false,
            SELECT: null,
            REQUIRE: false,

        },
        ROOM: {
            WALKING: {
                DISABLED: true
            }
        },
        BOX: {
            DISABLED: false,
            ACTION: {
                MSG: ut.NON_ACTION_MSG,
                ARG: null,
            }
        },

        OBJ: {
            INACTIVE: true,
            ACTION: {
                DELETE: Array(0),
                REVISE: Array(0),
            }
        },

        PERSPECTIVE: {
            ACTION: {
                MSG: ut.NON_ACTION_MSG, // ut.PERSPECTIVE_SHARE_MSG, ut.PERSPECTIVE_EXCHANGE_MSG
            }
        }

    }

    let multi_controller = new CreateMultiplayerController(sandbox);
    multi_controller.init(state_msg.MODE.IN_ROOM);
    model.multi_controller = multi_controller;

    let checkStateCode = (state) =>{
        let s = state[1];
        s.RESUME = !state[0];

        return s;
    }

    croquet.register('croquetDemo_5.01');
    
    model.animate(() => {

        state_msg.RESUME =true;
        let state_code = mode_controller.animate(model.time, state_msg);
        state_msg = checkStateCode(state_code);
        state_msg = mode_controller.clearState(model.time, state_msg, sandbox);


        state_code = multi_controller.animate(model.time, state_msg.MODE.IN_ROOM, state_msg);
        state_msg = checkStateCode(state_code);


        state_code = room_controller.animate(model.time, state_msg);
        state_msg = checkStateCode(state_code);
        state_msg = room_controller.clearState(model.time, state_msg);


        state_code = box_controller.animate(model.time, state_msg);
        state_msg = checkStateCode(state_code);
        state_msg = box_controller.clearState(model.time, state_msg, sandbox);


        state_code = menu_controller.animate(model.time, menu_model, state_msg);
        state_msg = checkStateCode(state_code);
        state_msg = menu_controller.clearState(model.time, state_msg, sandbox);

        //login_controller.animate(model);

        let box_mode = state_msg.MODE.IN_ROOM ? 1 : 0;
        state_code = obj_controller.animate(model.time, sandbox.getObjCollection(box_mode), state_msg);
        state_msg = checkStateCode(state_code);
        state_msg = obj_controller.clearState(model.time, state_msg, sandbox, box_mode);


        state_code = sandbox.animate(model.time, state_msg);
        state_msg = checkStateCode(state_code);


   });

}

