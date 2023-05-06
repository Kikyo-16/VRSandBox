import {CreateVRSandbox} from '../sandbox/vr_sandbox.js'
import {CreateBoxController} from '../sandbox/boxController.js'
import {CreateObjController} from '../sandbox/objController.js'
import {CreateMenuController} from '../sandbox/menuController.js'
import {CreateModeController} from '../sandbox/modeController.js'
import {CreateRoomController} from '../sandbox/roomController.js'
import {CreateMultiplayerController} from "../sandbox/multiplayerController.js";
import { CreateLoginMenuController } from '../sandbox/loginMenuController.js'
import * as ut from '../sandbox/utils.js'
import * as wu from '../sandbox/wei_utils.js'
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

    let login_controller = new CreateLoginMenuController();
    login_controller.init(login_menu_model);



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
            DISABLED: true,
            NAME: null,

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

    croquet.register('croquetDemo_10.77');
    //let debug = model.add("cube").color(1, 0, 0).scale(.2);

    //sandbox.addNewObj(0, debug);
    //console.log(sandbox.latest)
    let debug = 0;
    let debug_name = null;
    let debug_obj = null;
    model.animate(() => {
        state_msg.RESUME =true;
        if(debug === 0){
            //let obj = model.add("cube").move(Math.random(), 1.4, 0).scale(.1);
            //obj.color(Math.random(), Math.random(), Math.random());
            //sandbox.addNewObj(0, obj);
            //model.remove(obj);

            ///let w = sandbox.mini_sandbox.boxes[0].wall_collection.walls.get("2");
            ///w.setColor([Math.random(), Math.random(), Math.random()]);
            ///w._revised = true;
            ///w._latest = sandbox.timer.newTime();
            //let r = Math.random();
            //sandbox.mini_sandbox.boxes[0].wall_collection.createWall(
            //    [0, 0, r], [1, 1, 1], 0, r.toString())
            //let w = sandbox.mini_sandbox.boxes[0].wall_collection.walls.get(r.toString());
            //w._revised = true;
            //w._latest = sandbox.timer.newTime();
            //console.log(w);


        }
        let sa = ["test", "0.7993388552145906", "0.5000515662609963", "0.47496701534904284",
        "0.4092263627108117", "0.7993388552145906", "0.47496701534904284", "0.8863008114607696"];
        for(let i = 0; i < sa.length; ++ i){
            let w = sandbox.mini_sandbox.boxes[0].wall_collection.walls.get(sa[i]);
            if(!wu.isNull(w)){
                console.log("delete", sa[i], w);
                sandbox.mini_sandbox.boxes[0].wall_collection.remove(w, sandbox.timer.newTime());
            }
        }

        debug += 1;

        if(debug === 100 && debug_name !== null){
            //console.log("ready to remove")
            //debug_obj.setColor([1, 0, 0]);
            //sandbox.refreshObj([debug_obj]);
            //sandbox.removeObjOfName(debug_name,0);
        }


        let state_code = login_controller.animate(model.time, state_msg);
        state_msg = checkStateCode(state_code);
        login_controller.clearState(state_msg, sandbox);


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


        if(obj_collection.length > 0){
            //obj_collection[0].move(Math.sin(model.time)*.01, Math.sin(model.time)*.01, Math.sin(model.time) *.01)
            //obj_collection[0]._revised = true;
            //obj_collection[0]._latest = sandbox.timer.newTime();
            //debug_name = obj_collection[0]._name;
            //debug_obj = obj_collection[0];
        }



        multi_controller.animate(model.time, state_msg.MODE.IN_ROOM);


   });

}

