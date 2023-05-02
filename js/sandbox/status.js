import * as ut from "../sandbox/utils.js";
import * as wu from "../sandbox/wei_utils.js";


export function Status() {

    this.rec_ops = null;
    this.send_ops = null;

    this.max_send_time = -1
    this.max_rev_time = -1

    this.getOPs = () => {
        let op = this.rec_ops;
        this.rec_ops = null;
        return op;
    }

    this.setOPs = (msg) => {
        if(wu.isNull(msg))
            return false;
        if(this.rec_ops !== null){
            console.log("setOps", this.rec_ops.time, msg.time);
        }
        if(this.max_rev_time < msg.time){
            this.max_rev_time = msg.time;
            this.rec_ops = msg;
        }
        return true
    }

    this.sendOPs = (msg) => {
        if(wu.isNull(msg))
            return false;
        this.send_ops = msg;
        if(this.max_send_time < msg.time){
            this.max_send_time = msg.time;
            this.send_ops = msg;
        }
        return true
    }
    this.checkOPs = () => {
        //return this.send_ops;
        let op = this.send_ops;
        this.send_ops = null;
        return op;
    }

    this.setViewId = (viewId) =>{
        this._viewId = viewId
    }

}