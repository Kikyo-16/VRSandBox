import {CreateAvatarController} from "../sandbox/avatarController.js";
import * as cg from "../render/core/cg.js";
import * as ut from "../sandbox/utils.js";

export function CreateMultiplayerController(model, sandbox){
    let avatar_controller = new CreateAvatarController(model);


    this.scene = 0;
    this.player = 0;
    this.player_list = new Map();
    this.name = null;

    this.init =(in_room) =>{
        this.name = sandbox._name;
        this.player = this.getPlayer(in_room);
        this.scene = sandbox.getScene();
        this.player_list.set(this.name, this.player)
        //avatar_controller.initialize(this.player_list,
        //    sandbox._name, sandbox.room, sandbox.mini_sandbox);
    }

    this.getPlayer = (in_room) =>{
        let vm = window.views[0]._viewMatrix;
        let pos = vm.slice(12, 15);
        let rm = sandbox.getRPosition(in_room?1:0, pos);
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
        let who = e.get(ut.WHO_KEY);
        //console.log("update", e);
        if(who === null || who === undefined || who === this.name)
            return
        if(e.has(ut.SCENE_KEY)){
            console.log("aw", who, e.get(ut.SCENE_KEY));
            sandbox.setScene(e.get(ut.SCENE_KEY))
        }else if(e.has(ut.PLAYER_KEY)) {
            this.player_list.set(who, e.get(ut.PLAYER_KEY));
        }

    };

    this.animate = (t, in_room) =>{
        this.scene = this.getScene();
        this.player = this.getPlayer(in_room);
        //if(avatar_controller.local_user !== null)
        //    avatar_controller.animate(this.player_list, sandbox);
    }
}
