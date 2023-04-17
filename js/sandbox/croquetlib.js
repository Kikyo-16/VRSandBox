import {Status} from "../sandbox/status.js"

let status = new Status();
export let getOPs = status.getOPs;
export let sendOPs = status.sendOPs;
export let refreshScene = status.refreshScene;

let apiKey = '1yvF8Ott320yzAlpl4z99Mgtimi54jKMpH0H2yHBz';

export class SandboxModel extends Croquet.Model {
    init(options={})  {
        this.num_users = 0;
        this.subscribe("init", 'scene', this.requireScene);
        this.subscribe("ops", 'center', this.setOPs);

    }


    requireScene(viewId){
        this.num_users ++;
        if(this.num_users > 1){
            this.publish("scene", 'require', viewId);
        }
    }

    setOPs(msg) {

        this.publish("ops", 'distribution', msg);

    }
}


class View extends Croquet.View {

    constructor(model) {
        super(model);
        this.model = model;
        this.publish("init", "scene", this.viewId);
        this.subscribe("scene", 'require', this.sendScene)
        this.subscribe("ops", 'distribution', this.setOPsDistribution);
        this.checkOPs();


    }
    setOPsDistribution(msg) {
        status.setOPs(msg);

    }
    sendScene(viewId){
        if(this.viewId === viewId)
            return
        status.requireScene(viewId);
    }

    checkOPs() {
        let msg = status.checkOPs();
        if(msg !== null && msg !== undefined){
            msg.viewId = this.viewId;
            console.log("opscenter", msg)
            this.publish("ops", 'center', msg);
        }
        this.future(30).checkOPs();
    }


}

export  let register = (name, global_model) => {
   SandboxModel.register("SandboxModel");
   Croquet.Session.join({
      apiKey  : apiKey,
      appId   : 'edu.nyu.frl.' + name,
      name    : name,
      password: 'secret',
      model   : SandboxModel,
      view    : View,
      tps     : 1000 / 500,
   });
}