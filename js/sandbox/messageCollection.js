import * as wu from "../sandbox/wei_utils.js"
import * as ut from "../sandbox/utils.js"

export function CreateMessageCollection(sandbox){
    let send_queue = new Map();
    let receive_queue = new Map();
    this.name = null;
    this.send_queue = send_queue;

    this.sendInvitation = (state) => {
        let send_msg = state.SEND;
        let new_t = sandbox.timer.newTime();
        if(!wu.isNull(send_msg.USER)&&!wu.isNull(send_msg.OP)&&wu.isNull(send_msg.ACT)){
            let k = send_msg.USER + "_" + send_msg.OP;
            if(send_queue.has(k)){
                let send = send_queue.get(k);
                if(send.getColor(ut.ACT_KEY)){
                    send.set(ut.LATEST_KEY, new_t);
                    send.set(ut.ACT_KEY, false);
                }
            }else{
                let msg = new Map;
                msg.set(ut.USER_KEY, send_msg.USER);
                msg.set(ut.OP_KEY, send_msg.OP);
                msg.set(ut.LATEST_KEY, new_t);
                msg.set(ut.ACT_KEY, false);
                send_queue.set(k, msg);
            }
        }


    }

    this.sendReply = (state) =>{
        let rev_msg = state.REV;
        if(!wu.isNull(rev_msg.USER)&&!wu.isNull(rev_msg.OP)&&!wu.isNull(rev_msg.ACT)) {
            let k = rev_msg.USER + "_" + rev_msg.OP + "_r";
            let rev = receive_queue.get(k);
            let msg = new Map();
            msg.set(ut.USER_KEY, rev_msg.USER);
            msg.set(ut.ACT_KEY, rev_msg.ACT);
            msg.set(ut.LATEST_KEY, rev.get(ut.LATEST_KEY));
            send_queue.set(k, msg);
            rev_msg.USER = null;
            rev_msg.OP = null;
            rev_msg.ACT = null;
        }
    }

    let clearRevQ = (k) =>{
        if(receive_queue.has(k)) {
            receive_queue.get(k).set(ut.LATEST_KEY, -1);
        }
    }

    let updateRevQ = (k, msg) =>{
        if(receive_queue.has(k)){
            let pre_t = receive_queue.get(k).get(ut.LATEST_KEY);
            if(pre_t < msg.get(ut.LATEST_KEY)){
                receive_queue.set(k, msg);
            }
        }else{
            receive_queue.set(k, msg);
        }


    }
    this.updateRev = (e) =>{
        let user = e.get(ut.USER_KEY);
        if(!wu.isNull(sandbox._name) && sandbox._name===user){
            let who = e.get(ut.WHO_KEY);
            let k = who + "_" + e.get(ut.OP_KEY);
            let msg = new Map();
            msg.set(ut.USER_KEY, who);
            msg.set(ut.LATEST_KEY, e.get(ut.LATEST_KEY));
            if(e.has(ut.OP_KEY)){
                msg.set(ut.OP_KEY, e.get(ut.OP_KEY));
                updateRevQ(k, msg);
            }else{
                msg.set(ut.ACT_KEY, e.get(ut.ACT_KEY));
                updateRevQ(k + "_r", msg);
            }

        }

    }

    this.animate = (t, state) =>{
        let send_msg = state.SEND;
        if(!wu.isNull(send_msg.USER)&&!wu.isNull(send_msg.OP)&&wu.isNull(send_msg.ACT)){
            let k = send_msg.USER + "_" + send_msg.OP;
            if(send_queue.has(k)) {
                if (receive_queue.has(k)) {
                    let send = send_queue.get(k);
                    let rev = receive_queue.get(k + "_r");
                    if (rev.get(ut.LATEST_KEY) === send.get(ut.LATEST_KEY)) {
                        send_msg.ACT = rev.get(ut.ACT_KEY);
                        send_queue.set(ut.ACT_KEY, true);
                    }
                }
            }
        }
        return [false, state];
    }

    this.clearState = (t, state) =>{
        let send_msg = state.SEND;
        if(!wu.isNull(send_msg.USER)&&!wu.isNull(send_msg.OP)&&!wu.isNull(send_msg.ACT)){
            console.log("Invitation rev", send_msg.ACT);
            state.USER = null;
            state.OP = null;
            send_msg.ACT = null;
        }
        return state;
    }

}