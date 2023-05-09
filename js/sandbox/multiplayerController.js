import {CreateAvatarController} from "../sandbox/avatarController.js";
import * as cg from "../render/core/cg.js";
import * as ut from "../sandbox/utils.js";
import * as wu from "../sandbox/wei_utils.js";

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


export function CreateMultiplayerController(model, sandbox){
    let avatar_controller = new CreateAvatarController(model);


    this.scene = 0;
    this.player = 0;
    this.player_list = new Map();
    this.name = null;

    let out_pos = [-.25+1.25*Math.random(), 0, 1.1+.25*Math.random()];

    this.init =(in_room) =>{
        this.name = sandbox._name;
        this.player = this.getPlayer(in_room);
        this.scene = sandbox.getScene();
        this.player_list.set(this.name, this.player)
        avatar_controller.initialize(this.player_list, this.name);
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
        let vm = window.views[0]._viewMatrix;
        let pos = vm.slice(12, 15);
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
        return sandbox.getScene(true);

    }
    this.updateScene = (e) =>{
        let who = e.get(ut.WHO_KEY);
        if(who === null || who === undefined || who === this.name)
            return
        if(e.has(ut.SCENE_KEY)){
            //console.log("aw", who, e.get(ut.SCENE_KEY));
            sandbox.setScene(e.get(ut.SCENE_KEY));
            if(this.player_list.has(who)){
                let player = this.player_list.get(who);
                player.set(ut.LATEST_KEY, sandbox.timer.newTime());
            }
        }
    };


    this.updatePlayer = (e) =>{
        let who = e.get(ut.WHO_KEY);
        if(who === null || who === undefined || who === this.name)
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
            if(this.player_list.has(who)) {
                let player = this.player_list.get(who);
                player.set(ut.LATEST_KEY, sandbox.timer.newTime());
                this.player_list.set(who, player);
                //console.log("new", who, player);
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
    this.animate = (t, in_room, state) =>{
        this.scene = this.getScene();
        this.player = this.getPlayer(in_room);
        this.player_list.set(this.name, this.player);
        let send_player_list = updateSendList(this.player_list, state["PERSPECTIVE"]["ACTION"]);
        if(avatar_controller.local_user !== null)
            state = avatar_controller.animate(send_player_list, sandbox, state);
        state["PERSPECTIVE"]["PLAYER_INFO"] = this.player_list;
        state["PERSPECTIVE"]["SELF"] = this.name;
        return [true, state];
    }

}
