import * as ut from "../sandbox/utils.js";

export class Server extends Croquet.Model {
    init()  {
        this.num_users = 0;
        this.user_list = Array(0);
        console.log("here")

    }

    addUser = (viewId) =>{
        this.num_users ++;
    }
    numUsers = () =>{
        return this.num_users;
    }
}


export function Status() {
    this.has_init = false;
    this.init_scene = null;

    this.scene_request = false;
    this.required_scene = null;

    let rec_ops = Array(0);
    let send_ops = Array(0);

    this.getOPs = () => {
        if(rec_ops.length > 0){
            return rec_ops.shift();
        }
        return null;
    }

    this.setOPs = (msg) => {
        if(msg === null || msg === undefined)
            return;
        rec_ops.push(msg);
    }

    this.sendOPs = (msg) => {
        if(msg === null || msg === undefined)
            return;
        //console.log(msg)
        send_ops.push(msg);
    }
    this.checkOPs = () => {
        if(send_ops.length > 0){
            return send_ops.shift();
        }
        return null;
    }



    this.requireScene = (viewId, userId) =>{
        let msg = {
            code : ut.REQURE_SCENE_MSG,
            args : {
                viewId : viewId,
                userId : userId,
            },

        }
        this.setOPs(msg);

    }



}