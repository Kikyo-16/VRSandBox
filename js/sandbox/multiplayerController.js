import {CreateAvatarController} from "../sandbox/avatarController.js";
import * as cg from "../render/core/cg.js";
import * as ut from '../sandbox/utils.js';
import * as ac from '../sandbox/avatarController.js'

let debug = true;
export function CreateMultiplayerController(sandbox){
    let avatar_controller = new CreateAvatarController(sandbox);

    this.scene = 0;
    this.player = 0;
    this.player_list = new Map();
    this.name = null;

    let out_pos = [-.25+1.25*Math.random(), .8*.05*ac.s_in_out, 1.1+.25*Math.random()];

    let t_ = 0;
    this.debug = false;

    this.init =(in_room) =>{
        if (debug)
            this.debug_init();
        let name = sandbox._name;
        this.player = this.getPlayer(in_room);
        this.scene = sandbox.getScene();
        this.player_list.set(name, this.player)
        avatar_controller.initialize(this.player_list, sandbox._name);
    }

    this.getPlayer = (in_room) =>{
        let vm_ = window.avatars[0].headset.matrix;
        // let vm = window.views[0]._viewMatrix;
        let rm = in_room ? sandbox.getRobotPosition(1,  vm_.slice(12, 15)) : out_pos;
        // let rm = in_room ? sandbox.getRPosition(1, vm_.slice(12, 15)) : out_pos;
        rm = cg.mTranslate(rm);
        let msg = new Map();
        msg.set("VM", vm_);
        msg.set("RM", rm);
        msg.set("IN_BOX", in_room);
        msg.set("FLOOR", sandbox.active_floor);
        return msg;

    }

    this.getScene = () =>{
        return sandbox.getScene();

    }

    this.updateScene = (e) =>{
        let who = e.get(ut.WHO_KEY);
        if(who === null || who === undefined || who === this.name)
            return
        if(e.scene !== null && e.name !== sandbox._name){
            if(e.scene.latest > this.latest_version){
                sandbox.setScene(e.scene)
                this.latest_version = e.scene.latest;
            }
        }

        this.player_list.set(e.name, e.player);

    };

    this.debug_init = () => {
        let NAME_LIST = ["Mike", "SAM", "TOM", "TIM"];
        for (let i = 0; i < 10; ++i) {
            let vm = cg.mIdentity();
            let in_room = i % 2 == 0 ? true : false;
            let rm = in_room ? [Math.random(), .8*.05, Math.random()] : [-.25+1.25*Math.random(), .8*.05*ac.s_in_out, 1.1+.25*Math.random()];
            rm = cg.mTranslate(rm);
            let msg = new Map();
            msg.set("VM", vm);
            msg.set("RM", rm);
            msg.set("IN_BOX", in_room);
            msg.set("FLOOR", sandbox.active_floor);
            this.player_list.set(NAME_LIST[0] + "_" + Math.round(Math.random() * 10000).toString(), msg)
        }  
    }

    this.debug_exchange_in_room = () => {
        console.log("debug move player")
        if (this.player_list.get(sandbox._name).get("IN_BOX")) {
            this.player_list.get(sandbox._name).set("RM", cg.mTranslate([.88 - .6*Math.random(), .8*.05, .33+.5*Math.random()]))
        }
    }

    this.debug_div_in = () => {
        console.log("debug move player in")
        this.player_list.get(sandbox._name).set("IN_BOX", true)
        this.player_list.get(sandbox._name).set("RM", cg.mTranslate([.23+.6*Math.random(), .8*.05, .25+.6*Math.random()]))
    }

    this.debug_leave_room = () => {
        console.log("debug move player out")
        this.player_list.get(sandbox._name).set("IN_BOX", false)
        this.player_list.get(sandbox._name).set("RM", cg.mTranslate([.75, .8*.05, 1.25]))
    }


    this.animate = (t, in_room, state) =>{

        this.scene = this.getScene();
        this.player = this.getPlayer(in_room);
        this.player_list.set(sandbox._name, this.player);

        // debug
        if (this.debug) {
            if (t_ >= 300 && t_ < 1230 ) {
                console.log("share view");
                state.PERSPECTIVE.ACTION.MSG = ut.PERSPECTIVE_SHARE_MSG;
            }

            if (t_ == 200 ) {
                console.log("elapse time", t_)
                this.debug_div_in();
                console.log(this.player_list.get(sandbox._name));
                // state.PERSPECTIVE.ACTION.MSG = ut.PERSPECTIVE_EXCHANGE_MSG;
            } 

            if (t_ == 400 || t_ == 800 || t_ == 900 || t_ == 1000) {
                console.log("elapse time", t_)
                this.debug_exchange_in_room();
                console.log(this.player_list.get(sandbox._name));
                // state.PERSPECTIVE.ACTION.MSG = ut.PERSPECTIVE_EXCHANGE_MSG;
            }


            if (t_ == 600) {
                console.log("elapse time", t_)
                this.debug_leave_room();
                console.log(this.player_list.get(sandbox._name));
                // state.PERSPECTIVE.ACTION.MSG = ut.PERSPECTIVE_EXCHANGE_MSG;
            }

            if (t_ == 1100) {
                console.log("elapse time", t_)
                this.debug_leave_room();
                console.log(this.player_list.get(sandbox._name));
                // state.PERSPECTIVE.ACTION.MSG = ut.PERSPECTIVE_EXCHANGE_MSG;
            }

            if (t == 1250 ) {
                console.log("stop share view");
                state.PERSPECTIVE.ACTION.MSG = ut.NON_ACTION_MSG;
            }

            if (t == 1270) {
                console.log("elapse time", t_)
                this.debug_div_in();
                console.log(this.player_list.get(sandbox._name));
                state.PERSPECTIVE.ACTION.MSG = ut.PERSPECTIVE_EXCHANGE_MSG;
            }

            if (t_ == 1290) {
                console.log("elapse time", t_)
                this.debug_div_in();
                console.log(this.player_list.get(sandbox._name));
                state.PERSPECTIVE.ACTION.MSG = ut.PERSPECTIVE_EXCHANGE_MSG;
            } 

            if (t_ == 1320) {
                console.log("elapse time", t_)
                this.debug_leave_room();
                console.log(this.player_list.get(sandbox._name));
                state.PERSPECTIVE.ACTION.MSG = ut.PERSPECTIVE_EXCHANGE_MSG;
            }

            t_++;
        }

        if(avatar_controller.local_user !== null)
            state = avatar_controller.animate(this.player_list, sandbox, state);

        return [true, state];
    }
}
