
// YOUR APPLICATION SHOULD REDEFINE THESE FUNCTIONS:

import { updateModelScene,  updateModelPlayer, updateModelWholeScene} from "../scenes/demoSandbox.js";
import { diffData } from "../sandbox/vr_sandbox.js";
import {diffPlayer} from "../sandbox/multiplayerController.js"
import { controllerMatrix,  buttonState, joyStickState} from "../render/core/controllerInput.js";
import { initAvatar } from "../primitive/avatar.js";
import * as ut from "../sandbox/utils.js";
import * as global from "../global.js";

// YOU SHOULD OBTAIN YOUR OWN apiKey FROM: croquet.io/keys

 /* Copy this into a file named apiKey.js */
const apiKey = '1zMbeaMBGMs10zxhv3u4JqDOsGC3G4N770Gpq72yf';
const appId = 'edu.nyu.ll4270.microverse';

let preRightTrigger = {pressed: false, touched: false, value: 0};
window.color = [Math.random(), Math.random(), Math.random()]
/////////////////////////////////////////////////////////////////
let initScene = () => {

}
let initPlayer = () => {

}

export class Model extends Croquet.Model {
   init() {
      this.subscribe("scene", "updateWholeScene"   , this.updateWholeScene );
      this.subscribe("scene", "updateScene" , this.updateScene );
      this.subscribe("scene", "updatePlayer" , this.updatePlayer );

      this.initSettings();
   }
   initSettings(){
       window.croquetModel = this;
   }
   updateWholeScene(e) {
      if (window.croquetModel)
         updateModelWholeScene(e);
      else {
         window.croquetModel = this;
      }
   }
   updateScene(e) {
      if (window.croquetModel)
         updateModelScene(e);
      else {
         window.croquetModel = this;
      }
   }
   updatePlayer(e) {
      if (window.croquetModel)
         updateModelPlayer(e);
      else {
         window.croquetModel = this;
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
      this.future(5000).wholeSceneEvent();
   }
   updateScene(info) { this.publish("scene", "updateScene", info); }
   updatePlayer(info) { this.publish("scene", "updatePlayer", info); }
   updateWholeScene(info) { this.publish("scene", "updateWholeScene", info); }

   wholeSceneEvent(){
       let scene = window.clay.model.multi_controller.wholeScene;
       let name = window.clay.model.multi_controller.name;
       if(scene !== null && name !== null){

           let sent = new Map();
           sent.set(ut.WHO_KEY, name);
           sent.set(ut.WHOLE_KEY, scene);
           this.updateWholeScene(sent);

       }

       this.future(10000).wholeSceneEvent();
   }

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

