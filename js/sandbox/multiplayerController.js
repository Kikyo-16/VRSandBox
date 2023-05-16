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
    this.latest = -1;

    this.original_info_while_share = null;

    let out_pos = [1.*Math.random(), .8*.05*ac.s_in_out, 1.1+.25*Math.random()];

    let t_ = 0;
    this.debug = false;


    this.reset = () =>{
        this.has_init = false;
        this.name = null;
    }

    this.init =(in_room, state) =>{
        if(wu.isNull(sandbox._name) || this.has_init)
            return;
        this.has_init = true;
        this.name = sandbox._name;
        this.player = this.getPlayer(in_room, state);
        this.scene = sandbox.getScene(true);
        this.wholeScene = sandbox.getScene(false);
        this.player_list.set(this.name, this.player)
        avatar_controller.initialize(this.player_list, this.name);

        console.log("local user", this.name)
        console.log(this.player_list);
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

    this.getPlayer = (in_room, state) =>{
        // if (wu.isNull(this.name) || wu.isNull(this.player_list)){
        //     return;
        // }

        // let user = state.PERSPECTIVE.ACTION.USER;
        // let msg = new Map();
        // let vm_ = window.avatars[0].headset.matrix;
        // msg.set("VM", vm_);
        // if (wu.isNull(user) || state.PERSPECTIVE.ACTION.MSG === ut.NON_ACTION_MSG){
        //     // let vm = window.views[0]._viewMatrix;
        //     // let rm = in_room ? sandbox.getRobotPosition(1,  vm_.slice(12, 15)) : out_pos;
        //     let rm = in_room ? sandbox.getRPosition(1, vm_.slice(12, 15)) : out_pos;
        //     rm = cg.mTranslate(rm);
        //     msg.set("RM", rm);
        //     msg.set("IN_BOX", in_room);
        //     msg.set("FLOOR", sandbox.active_floor);
        // } else {
        //     if (state.PERSPECTIVE.ACTION.MSG === ut.PERSP_SHARING_MSG) {
        //         msg.set("VM", this.player_list.get(user).get("VM"));
        //         msg.set("RM", this.player_list.get(user).get("RM"))
        //         msg.set("IN_BOX", this.player_list.get(user).get("IN_BOX"));
        //         msg.set("FLOOR", this.player_list.get(user).get("FLOOR"));
        //     } else if (state.PERSPECTIVE.ACTION.MSG === ut.POS_EXCHANGE_MSG) {
        //         console.log("update exchange");
        //         console.log(state.PERSPECTIVE.ACTION.INFO)
        //         msg.set("RM", state.PERSPECTIVE.ACTION.INFO.get("RM"))
        //         msg.set("IN_BOX", state.PERSPECTIVE.ACTION.INFO.get("IN_BOX"));
        //         msg.set("FLOOR", state.PERSPECTIVE.ACTION.INFO.get("FLOOR"));
        //         console.log("updated", msg);
        //     }

        // }        
        // msg.set(ut.LATEST_KEY, sandbox.timer.newTime());
        // return msg;

        if (wu.isNull(this.name) || wu.isNull(this.player_list)){
            return;
        }

        let user = state.PERSPECTIVE.ACTION.USER;
        let msg = new Map();
        let vm_ = window.avatars[0].headset.matrix;
        msg.set("VM", vm_);
        if (!wu.isNull(user) && state.PERSPECTIVE.ACTION.MSG === ut.POS_EXCHANGE_MSG) {
            console.log("update exchange");
            console.log(state.PERSPECTIVE.ACTION.INFO)
            msg.set("RM", state.PERSPECTIVE.ACTION.INFO.get("RM"))
            msg.set("IN_BOX", state.PERSPECTIVE.ACTION.INFO.get("IN_BOX"));
            msg.set("FLOOR", state.PERSPECTIVE.ACTION.INFO.get("FLOOR"));
            console.log("updated", msg);
        } else if (!wu.isNull(user) && state.PERSPECTIVE.ACTION.MSG === ut.PERSP_SHARING_MSG) {
            state.PERSPECTIVE.ACTION.ORI_INFO = ut.deepcopy_player(this.player_list.get(this.name));
            msg = ut.deepcopy_player(this.player_list.get(this.name));
            console.log("update player persp share", msg);
        } else {
            let rm = in_room ? sandbox.getRPosition(1, vm_.slice(12, 15)) : out_pos;
            rm = cg.mTranslate(rm);
            msg.set("RM", rm);
            msg.set("IN_BOX", in_room);
            msg.set("FLOOR", sandbox.active_floor);
        }
        msg.set(ut.LATEST_KEY, sandbox.timer.newTime());
        return msg;

    }

    this.getScene = () =>{
        let v = sandbox.getScene(true);
        v.set(ut.LATEST_KEY, sandbox.timer.newTime());
        return v;

    }
    this.getWholeScene = () =>{
        let v = sandbox.getScene(false);
        v.set(ut.LATEST_KEY, sandbox.timer.newTime());
        return v;
    }

    this.updateScene = (e) =>{
        let who = e.get(ut.WHO_KEY);
        let when = null;
        if(e.has(ut.SCENE_KEY))
            when = e.get(ut.SCENE_KEY).get(ut.LATEST_KEY);
        if(wu.isNull(this.name) || wu.isNull(who) || who === this.name  || wu.isNull(when) || when < this.latest )
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

    this.updateWholeScene = (e) =>{
        let who = e.get(ut.WHO_KEY);
        let when = null;
        if(e.has(ut.WHOLE_KEY))
            when = e.get(ut.WHOLE_KEY).get(ut.LATEST_KEY);
        if(wu.isNull(who) || (!wu.isNull(this.name) && who === this.name) || wu.isNull(when) || when < this.latest )
            return
        console.log("asasa", e, ut.WHO_KEY, who, this.name)
        this.reloadedScene = e.get(ut.WHOLE_KEY);
    }

    this.updatePlayer = (e) =>{
        let who = e.get(ut.WHO_KEY);
        let when = null;
        if(e.has(ut.PLAYER_KEY))
            when = e.get(ut.PLAYER_KEY).get(ut.LATEST_KEY);
        //console.log("player", who);
        if(wu.isNull(this.name) || wu.isNull(who) || who === this.name|| wu.isNull(when) || when < this.latest )
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


    this.animate = (t, in_room, state) =>{
        this.latest = state.RESET;
        if(!this.has_init)
            return [false, state];
        this.scene = this.getScene();
        this.wholeScene = this.getWholeScene();
        this.player = this.getPlayer(in_room, state);
        this.player_list.set(this.name, this.player);

        // updateSendList(state);

        console.log("sss", this.player_list);
        if(avatar_controller.local_user !== null)
           state = avatar_controller.animate(this.player_list, state);
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
