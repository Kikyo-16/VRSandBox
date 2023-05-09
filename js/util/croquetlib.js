
// YOUR APPLICATION SHOULD REDEFINE THESE FUNCTIONS:

import { updateScene,  updatePlayer} from "../scenes/demoSandbox.js";
import { diffData } from "../sandbox/vr_sandbox.js";
import {diffPlayer} from "../sandbox/multiplayerController.js"
import { controllerMatrix,  buttonState, joyStickState} from "../render/core/controllerInput.js";
import { initAvatar } from "../primitive/avatar.js";
import * as ut from "../sandbox/utils.js";
import * as global from "../global.js";

// YOU SHOULD OBTAIN YOUR OWN apiKey FROM: croquet.io/keys

let apiKey = '16JKtOOpBuJsmaqgLzMCFyLPg9mqtNhxtObIsoj4b';
let preRightTrigger = {pressed: false, touched: false, value: 0};
window.color = [Math.random(), Math.random(), Math.random()]
/////////////////////////////////////////////////////////////////
let initScene = () => {

}
let initPlayer = () => {

}

export class Model extends Croquet.Model {
   init() {
      this.subscribe("scene", "initScene"   , this.initSettings );
      this.subscribe("scene", "updateScene" , this.updateScene );
      this.subscribe("scene", "updatePlayer" , this.updatePlayer );
      this.initSettings();
   }

   initSettings() {
      window.croquetModel = this;
      initScene();
      initPlayer();

   }
   updateScene(e) {
      if (window.croquetModel)
         updateScene(e);
      else {
         window.croquetModel = this;
         initScene();
      }
   }
   updatePlayer(e) {
      if (window.croquetModel)
         updatePlayer(e);
      else {
         window.croquetModel = this;
         initPlayer();
      }
   }
}

export class View extends Croquet.View {
   constructor(croquetModel) {
      super(croquetModel);
      this.croquetModel = croquetModel;
      this.pre_scene = null;
      this.pre_player = null;
      this.future(50).sceneEvent();
      this.future(50).playerEvent();
   }
   updateScene(info) { this.publish("scene", "updateScene", info); }
   updatePlayer(info) { this.publish("scene", "updatePlayer", info); }

   sceneEvent() {
       let scene = window.clay.model.multi_controller.scene;
       let name = window.clay.model.multi_controller.name;

       if(name !== null){
           let diff_scene = null;
           if(scene !== null && this.pre_scene === null) {
               diff_scene = scene;
           }else if(scene !== null){
               diff_scene = diffData(scene, this.pre_scene);
           }
           this.pre_scene = scene;
           if(diff_scene !== null){
               let sent = new Map();
               sent.set(ut.WHO_KEY, name);
               sent.set(ut.SCENE_KEY, diff_scene);
               this.updateScene(sent);
           }

       }
       this.future(50).sceneEvent();

   }
   playerEvent(){
       let name = window.clay.model.multi_controller.name;
       let player = window.clay.model.multi_controller.player;

       if(name !== null){
           let diff_player = null;
           if(player !== null && this.pre_player === null) {
               diff_player = player;
           }else if(player !== null){
               diff_player = diffPlayer(player, this.pre_player);
           }
           this.pre_player = player;
           if(diff_player !== null){
               let sent = new Map();
               sent.set(ut.WHO_KEY, name);
               sent.set(ut.PLAYER_KEY, diff_player);

               this.updatePlayer(sent);
           }

       }
       this.future(50).playerEvent();

   }

}


export let register = name => {
   Model.register("RootModel");
   Croquet.Session.join({
      apiKey  : apiKey,
      appId   : 'edu.nyu.frl.' + name,
      name    : name,
      password: 'secret',
      model   : Model,
      view    : View,
      tps     : 1000 / 500,
   });
}

