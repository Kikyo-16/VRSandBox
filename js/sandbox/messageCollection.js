import * as wu from "../sandbox/wei_utils.js"
import * as ut from "../sandbox/utils.js"

export function CreateMessageCollection(sandbox){
    let receive_queue = new Map();
    this.name = null;
    this.send_queue = new Map();
    this.solve_msg = new Map();

    this.sendInvitation = (state) => {
        let send_msg = state.SEND;
        let new_t = sandbox.timer.newTime();
        if(!wu.isNull(send_msg.USER)&&!wu.isNull(send_msg.OP)&&wu.isNull(send_msg.ACT)){
            let k = send_msg.USER + "_" + send_msg.OP;
            if(this.send_queue.has(k)){
                let send = this.send_queue.get(k);
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
                this.send_queue.set(k, msg);
            }
        }
        console.log("current", this.send_queue);


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
            this.send_queue.set(k, msg);
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
        let who = e.get(ut.WHO_KEY);
        if(!wu.isNull(sandbox._name) && sandbox._name!==who){

            for(let [key, info] of e){
                if(key === ut.WHO_KEY)
                    continue;
                let user = info.get(ut.USER_KEY);
                if(user !== sandbox._name)
                    continue;

                let k = who + "_" + info.get(ut.OP_KEY);
                let msg = new Map();
                msg.set(ut.USER_KEY, who);
                msg.set(ut.LATEST_KEY, info.get(ut.LATEST_KEY));

                if(info.has(ut.OP_KEY)){
                    msg.set(ut.OP_KEY, info.get(ut.OP_KEY));
                    updateRevQ(k, msg);
                }else{
                    msg.set(ut.ACT_KEY, info.get(ut.ACT_KEY));
                    updateRevQ(k + "_r", msg);
                }

                console.log("rev", msg, info);
            }


        }

    }

    this.animate = (t, state) =>{
        let send_msg = state.SEND;
        let rev_msg = state.REV;
        if(!wu.isNull(send_msg.USER)&&!wu.isNull(send_msg.OP)&&wu.isNull(send_msg.ACT)){
            let k = send_msg.USER + "_" + send_msg.OP;
            if(this.send_queue.has(k)) {
                if (receive_queue.has(k)) {
                    let send = this.send_queue.get(k);
                    let rev = receive_queue.get(k + "_r");
                    if (rev.get(ut.LATEST_KEY) === send.get(ut.LATEST_KEY)) {
                        send_msg.ACT = rev.get(ut.ACT_KEY);
                        this.send_queue.set(ut.ACT_KEY, true);
                    }
                }
            }
        }
        if(wu.isNull(rev_msg.USER)&&wu.isNull(rev_msg.OP)&&wu.isNull(rev_msg.ACT)){
            for(let [key, info] of receive_queue){
                let check_key = key + info.get(ut.LATEST_KEY);
                if(this.solve_msg.has(check_key)){
                    continue;
                }
                if(info.has(ut.OP_KEY)){
                    rev_msg.USER = info.get(ut.USER_KEY);
                    rev_msg.OP = info.get(ut.OP_KEY);
                    this.solve_msg.set(check_key, info.get(ut.LATEST_KEY));
                    console.log("check", state.REV);
                    break
                }else if(info.has(ut.ACT_KEY)) {
                    let res = info.get(ut.ACT_KEY);
                    this.solve_msg.set(check_key, info.get(ut.LATEST_KEY));
                    console.log("check", res);
                    break
                }
            }
        }

        return [false, state];
    }

    this.reset = () =>{
        this.send_queue = new Map();
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