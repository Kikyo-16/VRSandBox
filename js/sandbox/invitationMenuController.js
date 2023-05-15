import { g2 } from "../util/g2.js";
import * as cg from "../render/core/cg.js";
import * as wu from "../sandbox/wei_utils.js"
import * as ut from "../sandbox/utils.js"
import { controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";
import { lcb, rcb } from '../handle_scenes.js';
import { rotate } from "../third-party/gl-matrix/src/gl-matrix/mat2.js";
import {RECEIVE_MSG} from "../sandbox/utils.js";


export class CreateInvitationMenuController {

   constructor(){
      this.rt_prev = false;
      this.invitationMenu = null;
      this.yesButton = null;
      this.noButton = null;
   }

   init = (model) =>{
      this.invitationMenu = this.createInvitationMenu(model);
      this.model = model;
   }
   
   createInvitationMenu = (model) => {
      this.invitationMenu = model.add();

      //let invitationMenuBGFull = this.invitationMenu.add('cube').scale(0.5,0.15,1);
      let invitationMenuBG = this.invitationMenu.add('cube').scale(0.35,0.05,1).texture('../media/textures/menu/png-small/menu-item-type-6.png');
      let invitationMenuText = invitationMenuBG.add('cube').scale(1,7,1).move(0,0,0.1);

      this.yesButton = this.invitationMenu.add('cube').scale(0.135,0.045,1).texture('../media/textures/menu/png-small/menu-item-type-1.png').move(-1.3,-2.2,0.1).color(0.1,0.6,0.1);
      let yesButtonText = this.yesButton.add('cube').texture(() => {
            g2.textHeightAndFont('',0.12,'Arial');
            g2.setColor('white');
            g2.fillText("ACCEPT", 0.5, 0.49 , 'center');
            g2.drawWidgets(yesButtonText);
         }).scale(0.8,2.4,1).move(0,0,0.1);
      this.noButton = this.invitationMenu.add('cube').scale(0.135,0.045,1).texture('../media/textures/menu/png-small/menu-item-type-1.png').move(1.3,-2.2,0.1).color(0.6,0.1,0.1);
      let noButtonText = this.noButton.add('cube').texture(() => {
         g2.textHeightAndFont('',0.12,'Arial');
         g2.setColor('white');
         g2.fillText("REJECT", 0.5, 0.49 , 'center');
         g2.drawWidgets(noButtonText);
      }).scale(0.8,2.4,1).move(0,0,0.1);
      this.invitationMenuText = invitationMenuText;
      
      return this.invitationMenu;
   };

   textureFn = () =>{
      g2.textHeightAndFont('',0.042,'Arial');
      //g2.setColor('#1a1aff');
      g2.setColor('white');
      g2.fillText( this.invitationMenuText.text, 0.5, 0.505 , 'center');
      g2.drawWidgets(this.invitationMenuText);
   }

   openInvitationMenu = (fromUser, operation) =>{
      this.invitationMenuText.text = fromUser + ' is inviting you to ' + operation + '.';
      this.invitationMenuText.texture(this.textureFn);
      this.invitationMenu.opacity(1);
      this.invitationMenu.identity().hud().move(0,0,0.6).scale(1,1,.0001);
   }
   closeInvitationMenu = () => {
      this.invitationMenu.opacity(0.001);
      this.rt_prev = false;
   };

   checkOptionAndSelection = (optionObject, intersectionWidth, intersectionHeight, rt, rt_prev, hoverColorSet, defaultColor) => {
      let center = optionObject.getGlobalMatrix().slice(12,15);
      let point = rcb.projectOntoBeam(center);
      let diff = cg.subtract(point, center);
      let hit = (Math.abs(diff[0]) < intersectionWidth) &&  (Math.abs(diff[1]) < intersectionHeight);//cg.norm(diff) < intersectionRadius;

      if(hit){
         optionObject.color(hoverColorSet);
         if(rt && !rt_prev){
            return true;
         }
      } else {
         optionObject.color(defaultColor);
      }
      return false;
   }

   animate = (t, state) => {
      let rt = buttonState.right[0].pressed;
      let msg = state.REV;
      let fromUser = msg.USER;
      let operation = msg.OP;
      if(!wu.isNull(operation) && wu.isNull(msg.ACT)){
         state["MODE"]["TMP_MODE"] = ut.RECEIVE_MSG;
         this.openInvitationMenu(fromUser, operation);
         let isYes = this.checkOptionAndSelection(this.yesButton, 0.07, 0.03, rt, this.rt_prev, [0,1,0],[0,0.5,0]);
            // Check if selected NO
         let isNo = this.checkOptionAndSelection(this.noButton, 0.07, 0.03, rt, this.rt_prev, [1,0,0],[0.5,0,0]);

         if(isYes || isNo){
            this.closeInvitationMenu();
            msg.ACT = isYes;
            state.REV = msg;

            return [true, state];
         }
      }else{
         this.closeInvitationMenu();
      }
      
      this.rt_prev = rt;
      return [false, state];
   }
   clearState = (t, state, msg_collection) =>{
      let msg = state.REV;
      if(!wu.isNull(msg.USER) && !wu.isNull(msg.OP) && !wu.isNull(msg.ACT)){
         console.log("clear", msg.USER, msg.OP, msg.ACT);
         state["MODE"]["TMP_MODE"] = null;
         let user = msg.USER, op = msg.OP, act = msg.ACT;
         msg.USER = null;
         msg.OP = null;
         msg.ACT = null;
         state.PERSPECTIVE.ACTION.MSG = ut.POS_EXCHANGE_MSG;
         state.PERSPECTIVE.ACTION.USER = user;
         state.PERSPECTIVE.ACTION.INFO = state.PERSPECTIVE.PLAYER_INFO.get(user);
         msg_collection.sendReply(user, op, act);
      }
      return state;
   }
}