import {CreateVRSandbox} from '../sandbox/vr_sandbox.js'
import {CreateBoxController} from '../sandbox/boxController.js'
import {CreateObjController} from '../sandbox/objController.js'
import {CreateMenuController} from '../sandbox/menuController.js'
import {CreateModeController} from '../sandbox/modeController.js'
import {CreateRoomController} from '../sandbox/roomController.js'
import {CreateMultiplayerController} from "../sandbox/multiplayerController.js";
import {CreateLoginMenuController} from '../sandbox/loginMenuController.js'
import {CreateShareMenuController} from "../sandbox/shareMenuController.js";
import {CreateSavingController} from "../sandbox/savingController.js";
import {CreateInvitationMenuController} from "../sandbox/invitationMenuController.js"
import {CreateMessageCollection} from "../sandbox/messageCollection.js"

import * as ut from '../sandbox/utils.js';
import * as wu from '../sandbox/wei_utils.js';
import * as croquet from "../util/croquetlib.js";

export let updateModelScene = msg => {
    window.clay.model.multi_controller.updateScene(msg);

}

export let updateModelPlayer = msg => {
    window.clay.model.multi_controller.updatePlayer(msg);

}

export let updateModelWholeScene = msg => {
    window.clay.model.multi_controller.updateWholeScene(msg);

}

export let updateModelMsg = msg => {
    window.clay.model.message_collection.updateRev(msg);

}


export const init = async model => {

    model.setTable(false);
    model.setRoom(false);

    let menu_model = model.add();
    let box_model = model.add();
    let obj_model = model.add();
    let mode_model = model.add();
    let sandbox_model = model.add();
    let multi_model = model.add();
    let invi_model = model.add()
    let shared_menu_model = model.add();
    let login_menu_model = model.add();
    let save_model = model.add();

    let sandbox = new CreateVRSandbox(sandbox_model);
    sandbox.initialize()
    let saving_controller = new CreateSavingController(save_model, sandbox);
    let mode_controller = new CreateModeController(mode_model);
    let box_controller = new CreateBoxController(box_model, sandbox);
    let obj_controller = new CreateObjController(obj_model);
    let room_controller = new CreateRoomController(sandbox);

    let invitation_controller = new CreateInvitationMenuController();
    invitation_controller.init(invi_model);

    let login_controller = new CreateLoginMenuController();
    login_controller.init(login_menu_model, []);


    // Object Customize/Select Menu
    let menu_controller = new CreateMenuController();
    menu_controller.init(menu_model);

    // User Collaboration/Share Menu
    let share_menu_controller = new CreateShareMenuController();
    share_menu_controller.init(shared_menu_model);


    let message_collection = new CreateMessageCollection(sandbox);


    let state_msg = {
        RESUME: true,
        MODE: {
            DISABLED: false,
            SWITCH: false,
            IN_ROOM: false,
            MODE: ut.BOX_VIEW_MSG,
            TMP_MODE: null,
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
                DELETE: -1,
                REVISE: Array(0),
            }
        },

        LOGIN: {
            INACTIVE: false,
            NAME: "Liwei",
            SAVE: false,
            OUT: false,
            CD: 0,

        },
        SAVING:{
            INACTIVE: false,
            OPEN: false,
        },

        PERSPECTIVE: {
            ACTION: {
                MSG: ut.NON_ACTION_MSG, // ut.PERSPECTIVE_SHARE_MSG, ut.PERSPECTIVE_EXCHANGE_MSG
                USER: null,
                ARG: null,
            },
            PLAYER_INFO: new Map(),
            SELF: sandbox.name,
        },

        GLOBAL_MENU: {
            ACTION: {
                op: null,
                user: null,
            },
            INACTIVE: true,
            OPEN: false,
            SELECT: null,
        },
        SEND : {
            USER: null,
            OP: null,
            ACT: null,
        },
        REV : {
            USER: null,
            OP: null,
            ACT: null,
            ANS: null,
        }

    }

    let multi_controller = new CreateMultiplayerController(sandbox);
    multi_controller.init(state_msg.MODE.IN_ROOM);
    multi_controller.debug = false;//false;
    model.message_collection = message_collection;
    model.multi_controller = multi_controller;

    let checkStateCode = (state) =>{
        let s = state[1];
        s.RESUME = !state[0];
        return s;
    }

    croquet.register('croquetDemo_23.11');

    let debug = true;

    model.animate(() => {

        state_msg.RESUME =true;

        let state_code = login_controller.animate(model.time, state_msg, sandbox);
        state_msg = checkStateCode(state_code);

        state_code = saving_controller.animate(model.time, state_msg);
        state_msg = checkStateCode(state_code);
        state_msg = saving_controller.clearState(model.time, state_msg, multi_controller, message_collection);

        state_code = share_menu_controller.animate(model.time, state_msg);
        state_msg = checkStateCode(state_code);
        state_msg = share_menu_controller.clearState(model.time, state_msg, message_collection);

        state_code = message_collection.animate(model.time, state_msg);
        state_msg = checkStateCode(state_code);
        state_msg = message_collection.clearState(model.time, state_msg);

        state_code = invitation_controller.animate(model.time, state_msg);
        state_msg = checkStateCode(state_code);
        state_msg = invitation_controller.clearState(model.time, state_msg, message_collection);

        state_code = mode_controller.animate(model.time, state_msg);
        state_msg = checkStateCode(state_code);
        state_msg = mode_controller.clearState(model.time, state_msg, sandbox);

        state_code = multi_controller.animate(model.time, state_msg.MODE.IN_ROOM, state_msg);
        state_msg = checkStateCode(state_code);
        state_msg = multi_controller.clearState(model.time, state_msg)

        multi_controller.init(state_msg.MODE.IN_ROOM);
        state_code = room_controller.animate(model.time, state_msg);
        state_msg = checkStateCode(state_code);
        state_msg = room_controller.clearState(model.time, state_msg);


        state_code = box_controller.animate(model.time, state_msg);
        state_msg = checkStateCode(state_code);
        state_msg = box_controller.clearState(model.time, state_msg, sandbox);


        state_code = menu_controller.animate(model.time, menu_model, state_msg);
        state_msg = checkStateCode(state_code);
        state_msg = menu_controller.clearState(model.time, state_msg, sandbox);

        let box_mode = state_msg.MODE.IN_ROOM ? 1 : 0;
        let obj_collection = sandbox.getObjCollection(box_mode);
        state_code = obj_controller.animate(model.time, obj_collection, state_msg);
        state_msg = checkStateCode(state_code);
        state_msg = obj_controller.clearState(model.time, state_msg, sandbox, box_mode);


        state_code = sandbox.animate(model.time, state_msg);
        state_msg = checkStateCode(state_code);





        /*
            Returns Object with keys 'user' and 'op'
            'user' : <username selected>
            'op'   : <operation selected>
        */

        //login_controller.animate(model);

   });

}

