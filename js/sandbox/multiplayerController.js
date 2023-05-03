import {CreateAvatarController} from "../sandbox/avatarController.js";
import * as cg from "../render/core/cg.js";
import * as ut from '../sandbox/utils.js'

let debug = true;
export function CreateMultiplayerController(model, sandbox){
    let avatar_controller = new CreateAvatarController(model);

    this.scene = 0;
    this.player = 0;
    this.viewID = null;
    this.latest_version = -1;
    this.player_list = new Map();

    let out_pos = [-.25+1.25*Math.random(), 0, 1.1+.25*Math.random()];

    let t_ = 0;

    this.init =(in_room) =>{
        if (debug)
            this.debug_init();
        let name = sandbox._name;
        this.player = this.getPlayer(in_room);
        this.scene = sandbox.getScene();
        this.player_list.set(name, this.player)
        avatar_controller.initialize(this.player_list, sandbox._name, sandbox);
    }

    this.getPlayer = (in_room) =>{
        let vm = window.views[0]._viewMatrix;
        let pos = vm.slice(12, 15);
        //
        let rm = in_room ? sandbox.getRPosition(1, pos) : out_pos;
        rm = cg.mTranslate(rm);
        let msg = new Map();
        msg.set("VM", vm);
        msg.set("RM", rm);
        msg.set("IN_BOX", in_room);
        msg.set("FLOOR", sandbox.active_floor);

        return msg;

    }

    this.getScene = () =>{
        return sandbox.getScene();

    }
    
    this.updateScene = (e) =>{
        if(e.name === null || e.name === undefined)
            return
        if(e.scene !== null && e.name !== sandbox._name){
            // console.log("aw", sandbox._name, e.scene._name, e.scene.latest, this.latest_version, e.scene);
            if(e.scene.latest > this.latest_version){
                sandbox.setScene(e.scene)
                this.latest_version = e.scene.latest;
            }
        }

        this.player_list.set(e.name, e.player);
        // console.log("sent", e.name, e.player.get("VM"))

    };

    this.debug_init = () => {
        let NAME_LIST = ["Mike", "SAM", "TOM", "TIM"];
        for (let i = 0; i < 10; ++i) {
            let vm = null;
            let in_room = i % 2 == 0 ? true : false;
            let rm = in_room ? [Math.random(), 0, Math.random()] : [-.25+1.25*Math.random(), 0, 1.1+.25*Math.random()];
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
        console.log("move player")
        if (this.player_list.get(sandbox._name).get("IN_BOX")) {
            this.player_list.get(sandbox._name).set("RM", cg.mTranslate([.25, 0, .25]))
        }
    }

    this.debug_div_in = () => {
        console.log("move player in")
        this.player_list.get(sandbox._name).set("IN_BOX", true)
        this.player_list.get(sandbox._name).set("RM", cg.mTranslate([.75, 0, .75]))
    }

    this.debug_leave_room = () => {
        console.log("move player out")
        this.player_list.get(sandbox._name).set("IN_BOX", false)
        this.player_list.get(sandbox._name).set("RM", cg.mTranslate([.75, 0, 1.25]))
    }


    this.animate = (t, in_room, state) =>{

        this.scene = this.getScene();
        this.player = this.getPlayer(in_room);
        this.player_list.set(sandbox._name, this.player);

        
        if (t_ == 300 ) {
            console.log("elapse time", t_)
            this.debug_div_in();
            console.log(this.player_list.get(sandbox._name));
            state.PERSPECTIVE.ACTION.MSG = ut.PERSPECTIVE_EXCHANGE_MSG;
        }

        if (t_ == 600) {
            console.log("elapse time", t_)
            this.debug_exchange_in_room();
            console.log(this.player_list.get(sandbox._name));
            state.PERSPECTIVE.ACTION.MSG = ut.PERSPECTIVE_EXCHANGE_MSG;
        }

        if (t_ == 601) {
            console.log("elapse time", t_)
            console.log(this.player)
            state.PERSPECTIVE.ACTION.MSG = ut.PERSPECTIVE_EXCHANGE_MSG;
        }

        if (t_ == 900) {
            console.log("elapse time", t_)
            this.debug_leave_room();
            console.log(this.player_list.get(sandbox._name));
            state.PERSPECTIVE.ACTION.MSG = ut.PERSPECTIVE_EXCHANGE_MSG;
        }

        if(avatar_controller.local_user !== null)
            state = avatar_controller.animate(this.player_list, sandbox, state);

        t_++;

        return [true, state];
    }
}
