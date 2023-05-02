import {CreateAvatarController} from "../sandbox/avatarController.js";

export function CreateMultiplayerController(model, sandbox){
    let avatar_controller = new CreateAvatarController(model);


    this.scene = 0;
    this.player = 0;
    this.viewID = null;
    this.latest_version = -1;
    this.player_list = new Map();

    this.init =(in_room) =>{
        let name = sandbox._name;
        this.player = this.getPlayer(in_room);
        this.scene = sandbox.getScene();
        this.player_list.set(name, this.player)
        avatar_controller.initialize(this.player_list,
            sandbox._name, sandbox.room, sandbox.mini_sandbox);
    }

    this.getPlayer = (in_room) =>{
        let vm = window.views[0]._viewMatrix;
        let pos = vm.slice(12, 15);
        let rm = sandbox.getRPosition(in_room?1:0, pos);
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
    this.getScene = () =>{
        return sandbox.getScene();

    }
    this.updateScene = (e) =>{
        if(e.name === null || e.name === undefined)
            return
        if(e.scene !== null && e.name !== sandbox._name){
            console.log("aw", sandbox._name, e.scene._name, e.scene.latest, this.latest_version, e.scene);
            if(e.scene !== null && e.scene.latest >this.latest_version){
                sandbox.setScene(e.scene)
                console.log("asas");
                this.latest_version = e.scene.latest;
            }
        }

        this.player_list.set(e.name, e.player);
        if(avatar_controller.local_user !== null)
            avatar_controller.animate(this.player_list, sandbox);
    };

    this.animate = (t, in_room) =>{
        this.scene = this.getScene();
        this.player = this.getPlayer(in_room);

        console.log(this.player_list);
    }
}
