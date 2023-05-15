import * as wu from "../sandbox/wei_utils.js"
import * as ut from "../sandbox/utils.js"

export function CreateMessageCollection(sandbox){
    let receive_queue = new Map();
    this.name = null;
    this.send_queue = new Map();
    this.solve_msg = new Map();
    this.latest = -1;

    this.sendInvitation = (state) => {
        let send_msg = state.SEND;
        let new_t = sandbox.timer.newTime();
        if(!wu.isNull(send_msg.USER)&&!wu.isNull(send_msg.OP)&&wu.isNull(send_msg.ACT)){
            let k = send_msg.USER + "_" + send_msg.OP;
            if(this.send_queue.has(k)){
                let send = this.send_queue.get(k);
                if(send.get(ut.ACT_KEY)){
                    send.set(ut.LATEST_KEY, new_t);
                    send.set(ut.ACT_KEY, false);
                    send.set(ut.INVITATION_KEY, true);
                }
            }else{
                let msg = new Map();
                msg.set(ut.USER_KEY, send_msg.USER);
                msg.set(ut.OP_KEY, send_msg.OP);
                msg.set(ut.LATEST_KEY, new_t);
                msg.set(ut.ACT_KEY, false);
                msg.set(ut.INVITATION_KEY, true);
                this.send_queue.set(k, msg);
            }
        }
        console.log("current", this.send_queue);


    }

    this.sendReply = (user, op, act) =>{
        let k = user + "_" + op;
        let rev = receive_queue.get(k);
        let msg = new Map();
        msg.set(ut.USER_KEY, user);
        msg.set(ut.ACT_KEY, act);
        msg.set(ut.OP_KEY, op);
        msg.set(ut.LATEST_KEY, rev.get(ut.LATEST_KEY));
        this.send_queue.set(k + "_r", msg);

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
        let when = e.get(ut.LATEST_KEY);
        if(wu.isNull(when) || when < this.latest)
            return;
        if(!wu.isNull(sandbox._name) && sandbox._name!==who){
            console.log("whole", e);
            for(let [key, info] of e){
                console.log("debug rev", key, info);
                if(key === ut.WHO_KEY || key === ut.LATEST_KEY)
                    continue;
                let user = info.get(ut.USER_KEY);
                if(user !== sandbox._name)
                    continue;

                let k = who + "_" + info.get(ut.OP_KEY);
                let msg = new Map();
                msg.set(ut.USER_KEY, who);
                msg.set(ut.LATEST_KEY, info.get(ut.LATEST_KEY));
                msg.set(ut.OP_KEY, info.get(ut.OP_KEY));

                if(info.has(ut.INVITATION_KEY)){
                    updateRevQ(k, msg);
                }else{
                    msg.set(ut.ACT_KEY, info.get(ut.ACT_KEY));
                    updateRevQ(k + "_r", msg);
                }
            }


        }

    }

    this.animate = (t, state) =>{
        let send_msg = state.SEND;
        let rev_msg = state.REV;
        this.latest = state.RESET;
        this.send_queue.set(ut.LATEST_KEY, sandbox.timer.newTime());
        if(!wu.isNull(send_msg.USER)&&!wu.isNull(send_msg.OP)&&wu.isNull(send_msg.ACT)){
            let k = send_msg.USER + "_" + send_msg.OP;

            if(this.send_queue.has(k)) {
                if (receive_queue.has(k + "_r")) {
                    //console.log("revvvvvvvvvvv");
                    //let send = this.send_queue.get(k);
                    let rev = receive_queue.get(k + "_r");
                    let check_key = k + "_r";
                    if(this.solve_msg.has(check_key) && rev.get(ut.LATEST_KEY) <= this.solve_msg.get(check_key)){
                        //console.log("reqqqqq", k, rev.get(ut.LATEST_KEY), this.solve_msg.get(check_key), this.send_queue.has(k), receive_queue.has(k + "_r"));
                    }else{

                        send_msg.ACT = rev.get(ut.ACT_KEY);
                        this.send_queue.get(k).set(ut.ACT_KEY, true);
                        this.solve_msg.set(check_key, rev.get(ut.LATEST_KEY));
                        console.log("response----------------------------");
                    }
                }
            }
        }
        if(wu.isNull(rev_msg.USER)&&wu.isNull(rev_msg.OP)&&wu.isNull(rev_msg.ACT)){
            for(let [key, info] of receive_queue){
                let check_key = key;
                if(this.solve_msg.has(check_key) &&  + info.get(ut.LATEST_KEY) <= this.solve_msg.get(check_key)){
                    continue;
                }
                if(info.has(ut.OP_KEY)){
                    rev_msg.USER = info.get(ut.USER_KEY);
                    rev_msg.OP = info.get(ut.OP_KEY);
                    this.solve_msg.set(check_key, info.get(ut.LATEST_KEY));
                    console.log("check", state.REV);
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
            if (send_msg.ACT) {
                state.PERSPECTIVE.ACTION.MSG = ut.POS_EXCHANGE_MSG;
                state.PERSPECTIVE.ACTION.USER = send_msg.USER;
                state.PERSPECTIVE.ACTION.INFO = state.PERSPECTIVE.PLAYER_INFO.get(send_msg.USER);
            }
            send_msg.USER = null;
            send_msg.OP = null;
            send_msg.ACT = null;
        }
        return state;
    }

}