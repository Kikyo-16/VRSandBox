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
            console.log("local_user", sandbox._name)
        let name = sandbox._name;
        this.player = this.getPlayer(in_room);
        this.scene = sandbox.getScene();
        this.player_list.set(name, this.player)
        avatar_controller.initialize(this.player_list, sandbox._name);
    }

    this.getPlayer = (in_room) =>{
        let vm_ = window.avatars[0].headset.matrix;
        let rm = in_room ? sandbox.getRobotPosition(1,  vm_.slice(12, 15)) : out_pos;
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
            let in_room = Math.random() > 0.4 ? true : false;
            // let rm = in_room ? [Math.random(), (i % 2)*.05*2 + .8*.05, Math.random()] : [-.25+1.25*Math.random(), .8*.05*ac.s_in_out, 1.1+.25*Math.random()];
            let rm = in_room ? [Math.random(), .8*.05, Math.random()] : [-.25+1.25*Math.random(), .8*.05*ac.s_in_out, 1.1+.25*Math.random()];
            rm = cg.mTranslate(rm);
            let msg = new Map();
            msg.set("VM", vm);
            msg.set("RM", rm);
            msg.set("IN_BOX", in_room);
            msg.set("FLOOR", in_room ? i % 2 : -1);
            this.player_list.set(NAME_LIST[0] + "_" + Math.round(Math.random() * 10000).toString(), msg)
        }
        console.log(this.player_list)
    }

    this.debug_exchange_in_room_across_floor = () => {
        console.log("debug move player between floors")
        if (this.player_list.get(sandbox._name).get("IN_BOX")) {
            this.player_list.get(sandbox._name).set("RM", cg.mTranslate([.88 - .6*Math.random(), .8*.05, .33+.5*Math.random()]));
            this.player_list.get(sandbox._name).set("FLOOR", 1-this.player_list.get(sandbox._name).get("FLOOR"));
            console.log(this.player_list.get(sandbox._name))
        }
    }

    this.debug_exchange_in_room_within_floor = () => {
        console.log("debug move player within floors")
        if (this.player_list.get(sandbox._name).get("IN_BOX")) {
            this.player_list.get(sandbox._name).set("RM", cg.mTranslate([.88 - .6*Math.random(), .8*.05, .33+.5*Math.random()]));
            this.player_list.get(sandbox._name).set("FLOOR", this.player_list.get(sandbox._name).get("FLOOR"));
        }
        console.log(this.player_list.get(sandbox._name))
    }

    this.debug_div_in = () => {
        console.log("debug move player in")
        this.player_list.get(sandbox._name).set("IN_BOX", true)
        this.player_list.get(sandbox._name).set("RM", cg.mTranslate([.23+.6*Math.random(), .8*.05, .25+.6*Math.random()]))
        this.player_list.get(sandbox._name).set("FLOOR", Math.random() > .5 ? 1 : 0);
        console.log(this.player_list.get(sandbox._name))
    }

    this.debug_leave_room = () => {
        console.log("debug move player out")
        this.player_list.get(sandbox._name).set("IN_BOX", false)
        this.player_list.get(sandbox._name).set("RM", cg.mTranslate([.75, .8*.05, 1.25]))
        console.log(this.player_list.get(sandbox._name))
    }

    this.debug_remove_player = () => {
        for (const [name, info] of this.player_list) {
            if (name !== sandbox._name && Math.random() > .7) {
                this.player_list.delete(name);
            }
        }
    }


    this.animate = (t, in_room, state) =>{

        this.scene = this.getScene();
        this.player = this.getPlayer(in_room);
        this.player_list.set(sandbox._name, this.player);

        // debug
        if (this.debug) {

            if (t_ == 200 ) {
                console.log("elapse time", t_)
                this.debug_div_in();
                console.log(this.player_list.get(sandbox._name));
                state.PERSPECTIVE.ACTION.MSG = ut.PERSPECTIVE_EXCHANGE_MSG;
            } 
            if (t_ == 450 || t_ == 650 || t_ == 850 || t_ == 1050) {
                console.log("elapse time", t_)
                this.debug_exchange_in_room_within_floor();
                
                console.log(this.player_list.get(sandbox._name));
                state.PERSPECTIVE.ACTION.MSG = ut.PERSPECTIVE_EXCHANGE_MSG;
            }
            if (t_ == 300 || t_ == 500 || t_ == 7000 || t_ == 900) {
                console.log("elapse time", t_)
                this.debug_exchange_in_room_across_floor();
                
                console.log(this.player_list.get(sandbox._name));
                state.PERSPECTIVE.ACTION.MSG = ut.PERSPECTIVE_EXCHANGE_MSG;
            }
            if (t_ == 1300) {
                console.log("elapse time", t_)
                this.debug_leave_room();
                console.log(this.player_list.get(sandbox._name));
                state.PERSPECTIVE.ACTION.MSG = ut.PERSPECTIVE_EXCHANGE_MSG;

                this.debug_remove_player();
            }
            

            if (t_ == 1500) {
                console.log("elapse time", t_)
                this.debug_div_in();
                console.log(this.player_list.get(sandbox._name));
                state.PERSPECTIVE.ACTION.MSG = ut.PERSPECTIVE_EXCHANGE_MSG;
            }
            if (t_ == 1750 || t_ == 1850 || t_ == 1950 ) {
                console.log("elapse time", t_)
                if (Math.random() > 0.5) {
                    this.debug_exchange_in_room_across_floor();
                } else {
                    this.debug_exchange_in_room_within_floor();
                }
                console.log(this.player_list.get(sandbox._name));
                state.PERSPECTIVE.ACTION.MSG = ut.PERSPECTIVE_EXCHANGE_MSG;
            }
            if (t_ == 2000) {
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
