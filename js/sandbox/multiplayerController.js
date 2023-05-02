
export function CreateMultiplayerController(model, sandbox){
    this.scene = 2;
    this.player = 3;
    this.viewID = null;
    this.latest_version = -1;


    this.getPlayer = (in_room) =>{
        let vm = window.views[0]._viewMatrix;
        let pos = vm.slice(12, 15);
        let rm = sandbox.getRPosition(in_room?1:0, pos);
        return {
            VM : vm,
            RM : rm,
            IN_BOX: in_room,
            FLOOR: sandbox.active_floor,
        }

    }
    this.getScene = () =>{
        return sandbox.getScene();

    }
    this.getScene = () =>{
        return sandbox.getScene();

    }
    this.updateScene = (e) =>{
        if(this.scene !== null && e.scene._name !== sandbox._name){
            console.log("aw", sandbox._name, e.scene._name, e.scene.latest, this.latest_version, e.scene);
            if(e.scene !== null && e.scene.latest >this.latest_version){
                sandbox.setScene(e.scene)
                console.log("asas");
                this.latest_version = e.scene.latest;
            }
        }


    };

    this.animate = (t, in_room) =>{
        this.scene = this.getScene();
        this.player = this.getPlayer(in_room);
    }
}
