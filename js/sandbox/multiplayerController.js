import {CreateAvatarController} from "../sandbox/avatarController.js";
import * as cg from "../render/core/cg.js";
import * as ut from "../sandbox/utils.js";
import * as wu from "../sandbox/wei_utils.js";
import * as ac from '../sandbox/avatarController.js'


export let diffPlayer = (x1, x2) =>{
    let msg = new Map();
    let keys = ["VM", "RM", "IN_BOX", "FLOOR"];
    for(let i = 0; i < keys.length; ++ i){
        let v1 = x1.get(keys[i]);
        let v2 = x2.get(keys[i]);
        if(v1 !== v2){
            msg.set(keys[i], v1);
        }
    }
    return msg.size === 0? null : msg;

}

let debug = false;
export function CreateMultiplayerController(sandbox){
    let avatar_controller = new CreateAvatarController(sandbox);

    this.scene = 0;
    this.player = 0;
    this.player_list = new Map();
    this.name = null;
    this.wholeScene = null;
    this.reloadedScene = null;
    this.pre = -1;
    this.has_init = false;

    let out_pos = [-.25+1.25*Math.random(), .8*.05*ac.s_in_out, 1.1+.25*Math.random()];

    let t_ = 0;
    this.debug = false;


    this.reset = () =>{
        this.has_init = false;
        this.name = null;
    }

    this.init =(in_room) =>{
        if(wu.isNull(sandbox._name) || this.has_init)
            return;
        this.has_init = true;
        if (this.debug)
            this.debug_init();
            //console.log("local user", this.name)
        this.name = sandbox._name;
        this.player = this.getPlayer(in_room);
        this.scene = sandbox.getScene(true);
        this.wholeScene = sandbox.getScene(false);
        this.player_list.set(this.name, this.player)
        avatar_controller.initialize(this.player_list, this.name);
        console.log("init!!!!!!!!!!!")

    }

    let checkPlayers = (who) =>{
        let players = this.player_list;
        if(players.size <= 4)
            return;
        let latest = -1;
        let selected_name = null;
        for(let [name, info] of players){
            if(name === this.name || name === who)
                continue
            if(latest === -1 || info[ut.LATEST_KEY] < latest){
                latest = info[ut.LATEST_KEY];
                selected_name = name;
            }
        }
        if(selected_name !== null)
            players.delete(selected_name);
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
        return sandbox.getScene(true);

    }
    this.getWholeScene = () =>{
        return sandbox.getScene(false);
    }

    this.updateScene = (e) =>{
        let who = e.get(ut.WHO_KEY);
        if(wu.isNull(this.name) || wu.isNull(who) || who === this.name)
            return
        if(e.has(ut.SCENE_KEY)){
            console.log("aw", who, e.get(ut.SCENE_KEY), this.name);
            sandbox.setScene(e.get(ut.SCENE_KEY), true);
            if(this.player_list.has(who)){
                let player = this.player_list.get(who);
                player.set(ut.LATEST_KEY, sandbox.timer.newTime());
            }
        }
    };

    this.debug_init = () => {
        let NAME_LIST = ["Mike", "SAM", "TOM", "TIM"];
        for (let i = 0; i < 10; ++i) {
            let vm = cg.mIdentity();
            let in_room = i % 2 === 0 ? true : false;
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
        if (this.player_list.get(this.name).get("IN_BOX")) {
            this.player_list.get(this.name).set("RM", cg.mTranslate([.88 - .6*Math.random(), .8*.05, .33+.5*Math.random()]))
        }
    }

    this.debug_div_in = () => {
        console.log("debug move player in")
        this.player_list.get(this.name).set("IN_BOX", true)
        this.player_list.get(this.name).set("RM", cg.mTranslate([.23+.6*Math.random(), .8*.05, .25+.6*Math.random()]))
    }

    this.debug_leave_room = () => {
        console.log("debug move player out")
        this.player_list.get(this.name).set("IN_BOX", false)
        this.player_list.get(this.name).set("RM", cg.mTranslate([.75, .8*.05, 1.25]))
    }

    this.updateWholeScene = (e) =>{
        let who = e.get(ut.WHO_KEY);
        if(wu.isNull(who) || (!wu.isNull(this.name) && who === this.name))
            return
        console.log("asasa", e, ut.WHO_KEY, who, this.name)
        this.reloadedScene = e.get(ut.WHOLE_KEY);
    }

    this.updatePlayer = (e) =>{
        let who = e.get(ut.WHO_KEY);
        //console.log("player", who);
        if(wu.isNull(this.name) || wu.isNull(who) || who === this.name)
            return

        if(e.has(ut.PLAYER_KEY)) {
            let diff_player = e.get(ut.PLAYER_KEY);
            if(this.player_list.has(who)){
                let player = this.player_list.get(who);
                for(let [k, v] of diff_player){
                    player.set(k, v);
                }
                this.player_list.set(who, player);
            }else{
                checkPlayers(who);
                this.player_list.set(who, diff_player);
            }
            //console.log("new", who, diff_player);
            if(this.player_list.has(who)) {
                let player = this.player_list.get(who);
                player.set(ut.LATEST_KEY, sandbox.timer.newTime());
                this.player_list.set(who, player);

            }

        }
    };

    let updateSendList = (player_list, state) =>{
        if(wu.isNull(this.name) || wu.isNull(this.player_list)){
            return this.player_list;
        }
        let user = state.PERSPECTIVE.ACTION.USER;
        let players = new Map();
        if(user !== null){
            for(let [name, info] of player_list){
                if(name === this.name){
                    players.set(name, player_list.get(user));
                }else{
                    players.set(name, info);
                }
            }
        }else{
            players = this.player_list;
        }
        return players;


    }

    let debuAnimate = (t, in_room, state) =>{
        if (this.debug) {
            // if (t_ >= 300 && t_ < 1230 ) {
            //     console.log("share view");
            //     state.PERSPECTIVE.ACTION.MSG = ut.PERSPECTIVE_SHARE_MSG;
            // }

            if (t_ === 200 ) {
                console.log("elapse time", t_)
                this.debug_div_in();
                console.log(this.player_list.get(sandbox._name));
                state.PERSPECTIVE.ACTION.MSG = ut.PERSPECTIVE_EXCHANGE_MSG;
            }

            if (t_ === 400 || t_ === 800 || t_ === 900 || t_ === 1000) {
                console.log("elapse time", t_)
                this.debug_exchange_in_room();
                console.log(this.player_list.get(sandbox._name));
                state.PERSPECTIVE.ACTION.MSG = ut.PERSPECTIVE_EXCHANGE_MSG;
            }


            if (t_ === 600) {
                console.log("elapse time", t_)
                this.debug_leave_room();
                console.log(this.player_list.get(sandbox._name));
                state.PERSPECTIVE.ACTION.MSG = ut.PERSPECTIVE_EXCHANGE_MSG;
            }

            if (t_ === 1100) {
                console.log("elapse time", t_)
                this.debug_leave_room();
                console.log(this.player_list.get(sandbox._name));
                state.PERSPECTIVE.ACTION.MSG = ut.PERSPECTIVE_EXCHANGE_MSG;
            }

            if (t === 1250 ) {
                console.log("stop share view");
                state.PERSPECTIVE.ACTION.MSG = ut.NON_ACTION_MSG;
            }

            if (t === 1270) {
                console.log("elapse time", t_)
                this.debug_div_in();
                console.log(this.player_list.get(sandbox._name));
                state.PERSPECTIVE.ACTION.MSG = ut.PERSPECTIVE_EXCHANGE_MSG;
            }

            if (t_ === 1290) {
                console.log("elapse time", t_)
                this.debug_div_in();
                console.log(this.player_list.get(sandbox._name));
                state.PERSPECTIVE.ACTION.MSG = ut.PERSPECTIVE_EXCHANGE_MSG;
            }

            if (t_ === 1320) {
                console.log("elapse time", t_)
                this.debug_leave_room();
                console.log(this.player_list.get(sandbox._name));
                state.PERSPECTIVE.ACTION.MSG = ut.PERSPECTIVE_EXCHANGE_MSG;
            }

            t_++;
        }
    }

    this.animate = (t, in_room, state) =>{
        if(!this.has_init)
            return [false, state];
        this.scene = this.getScene();
        this.wholeScene = this.getWholeScene();
        this.player = this.getPlayer(in_room);
        this.player_list.set(this.name, this.player);

        //let send_player_list = updateSendList(this.player_list, state);
        
        // debug
        debuAnimate(t, in_room, state);

        //console.log("sss", send_player_list);
        //if(avatar_controller.local_user !== null)
        //    state = avatar_controller.animate(send_player_list, state);
        state["PERSPECTIVE"]["PLAYER_INFO"] = this.player_list;
        state["PERSPECTIVE"]["SELF"] = this.name;
        return [true, state];
    }

    this.clearState = (t, state) =>{
        if(t - this.pre > 5){
            if(!wu.isNull(this.reloadedScene))
                sandbox.setScene(this.reloadedScene, false);
            this.pre = t;
        }
        return state;
    }

}
