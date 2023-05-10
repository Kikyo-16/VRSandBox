import {CreateVRSandbox} from '../sandbox/vr_sandbox.js'
import {CreateBoxController} from '../sandbox/boxController.js'
import {CreateObjController} from '../sandbox/objController.js'
import {CreateMenuController} from '../sandbox/menuController.js'
import {CreateModeController} from '../sandbox/modeController.js'
import {CreateRoomController} from '../sandbox/roomController.js'
import {CreateMultiplayerController} from "../sandbox/multiplayerController.js";
import {CreateLoginMenuController} from '../sandbox/loginMenuController.js'
import {CreateShareMenuController} from "../sandbox/shareMenuController.js";
import {CreateInvitationMenuController} from "../sandbox/invitationMenuController.js";

import * as ut from '../sandbox/utils.js'
import * as wu from '../sandbox/wei_utils.js'
import * as croquet from "../util/croquetlib.js";




export let updateScene = msg => {
    if(window.demoDemoSandboxState) { // use window.demo[your-demo-name]State to see if the demo is active. Only update the croquet interaction when the demo is active.
        window.clay.model.multi_controller.updateScene(msg);
    }
}

export let updatePlayer = msg => {
    if(window.demoDemoSandboxState) { // use window.demo[your-demo-name]State to see if the demo is active. Only update the croquet interaction when the demo is active.
        window.clay.model.multi_controller.updatePlayer(msg);
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
    let shared_menu_model = model.add();
    let login_menu_model = model.add();

    let sandbox = new CreateVRSandbox(sandbox_model);
    sandbox.initialize()
    let mode_controller = new CreateModeController(mode_model);
    let box_controller = new CreateBoxController(box_model, sandbox);
    let obj_controller = new CreateObjController(obj_model);
    let room_controller = new CreateRoomController(sandbox);

    // Object Customize/Select Menu
    let menu_controller = new CreateMenuController();
    menu_controller.init(menu_model);

    // User Collaboration/Share Menu
    let share_menu_controller = new CreateShareMenuController();
    share_menu_controller.init(shared_menu_model);

    // User invitation prompt
    let invitation_menu_controller = new CreateInvitationMenuController();


    let login_controller = new CreateLoginMenuController();
    login_controller.init(login_menu_model);



    let test_players = new Map();
    let names = ["Mike_1111", "Mike_1112", "Mike_1113", "Mike_1114"]
    for(let i =0; i < names.length; ++ i){
        test_players.set(names[i], "");
    }
    test_players.set(sandbox.name, "");

    let state_msg = {
        RESUME: true,
        MODE: {
            DISABLED: false,
            SWITCH: false,
            IN_ROOM: false,
            MODE: ut.BOX_VIEW_MSG,
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
            DISABLED: false,
            NAME: null,

        },

         PERSPECTIVE: {
            ACTION: {
                MSG: ut.NON_ACTION_MSG, // ut.PERSPECTIVE_SHARE_MSG, ut.PERSPECTIVE_EXCHANGE_MSG
                ARG: null,
            },
            PLAYER_INFO: new Map(),
            SELF: sandbox.name,
        },

        GLOBAL_MENU: {
            ACTION: null,
            INACTIVE: true,
            OPEN: false,
            SELECT: null,
        }

    }

    let multi_controller = new CreateMultiplayerController(multi_model, sandbox);
    multi_controller.init(state_msg.MODE.IN_ROOM);
    model.multi_controller = multi_controller;

    let checkStateCode = (state) =>{
        let s = state[1];
        s.RESUME = !state[0];
        return s;
    }

    croquet.register('croquetDemo_11.99');

    model.animate(() => {
        state_msg.RESUME =true;

        let state_code = login_controller.animate(model, state_msg);
        state_msg = checkStateCode(state_code);
        login_controller.clearState(state_msg, sandbox);


        state_code = share_menu_controller.animate(model.time, state_msg);
        state_msg = checkStateCode(state_code);
        state_msg = share_menu_controller.clearState(state_msg)

        state_code = mode_controller.animate(model.time, state_msg);
        state_msg = checkStateCode(state_code);
        state_msg = mode_controller.clearState(model.time, state_msg, sandbox);


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

        state_code = multi_controller.animate(model.time, state_msg.MODE.IN_ROOM, state_msg);
        state_msg = checkStateCode(state_code);


        // let invitationResult = invitation_menu_controller.animate(model,<fromUser>, <operation> ,<isInviteForMe> ,true);
        /*
            Inputs :
            <fromUser> = The user name who sent the invitaion
            <operation> = The operation/invitation type
            <isInviteForMe> = Set this to true if the invitation is for the current user, currentUser == <the user for which the invitation is meant for>

            Output :
            Returns null until the user accepts or rejects the invitation.
            Returns True   if user accepts invitaion
            Returns False  if user rejects invitaion

            Example : let invitationResult = invitation_menu_controller.animate(model, 'Rahul', 'collaborate' ,true);
        */

        //login_controller.animate(model);

   });

}

