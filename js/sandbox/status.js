import * as ut from "../sandbox/utils.js";
import * as wu from "../sandbox/wei_utils.js";


export function Status() {
    this.has_init = false;
    this.init_scene = null;

    this.scene_request = false;
    this.required_scene = null;

    this.rec_ops = Array(0);
    this.send_ops = Array(0);

    this.getOPs = () => {
        if(this.rec_ops.length > 0){
            let flag = true;
            let op = null;
            while(flag){
                op = this.rec_ops.shift();
                if(op.code === ut.REVISE_OBJ_MSG && this.rec_ops.length > 0) {
                    if(this.rec_ops[this.rec_ops.length - 1].code === ut.REVISE_OBJ_MSG &&
                        this.rec_ops[this.rec_ops.length - 1].args._name === op.args._name){
                        console.log("here");
                    }else{
                        flag = false;
                    }
                }else{
                    flag = false;
                }
            }
            return op;
        }
        return null;
    }

    this.setOPs = (msg) => {
        if(wu.isNull(msg))
            return false;

        if(msg.code === ut.SET_SCENE_MSG && (this.has_init || msg.userId !== this._viewId))
            return false;
        if(msg.code === ut.SET_SCENE_MSG && !this.has_init){
            this.has_init = true;
        }
        this.rec_ops.push(msg);
        return true
    }

    this.sendOPs = (msg) => {
        if(wu.isNull(msg))
            return false;


        this.send_ops.push(msg);
        return true
    }
    this.checkOPs = () => {
        if(this.send_ops.length > 0){
            return this.send_ops.shift();
        }
        return null;
    }

    this.setViewId = (viewId) =>{
        this._viewId = viewId
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