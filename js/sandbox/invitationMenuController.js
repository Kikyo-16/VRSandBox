import { g2 } from "../util/g2.js";
import * as cg from "../render/core/cg.js";
import { controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";
import { lcb, rcb } from '../handle_scenes.js';
import { rotate } from "../third-party/gl-matrix/src/gl-matrix/mat2.js";




export class CreateInvitationMenuController {

   constructor(){
      this.rt_prev = false;
      this.invitationMenu = null;
      this.yesButton = null;
      this.noButton = null;
   }
   
   createInvitationMenu = (model, fromUser, operation) => {
      this.invitationMenu = model.add();

      //let invitationMenuBGFull = this.invitationMenu.add('cube').scale(0.5,0.15,1);
      let invitationMenuBG = this.invitationMenu.add('cube').scale(0.35,0.05,1).texture('../media/textures/menu/png-small/menu-item-type-6.png');
      let invitationMenuText = invitationMenuBG.add('cube').texture( () => {
         g2.textHeightAndFont('',0.042,'Arial');
         //g2.setColor('#1a1aff');
         g2.setColor('white');
         g2.fillText( fromUser + ' is inviting you to ' + operation + '.', 0.5, 0.505 , 'center');
         g2.drawWidgets(invitationMenuText);
      }).scale(1,7,1).move(0,0,0.1);

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
      
      return this.invitationMenu;
   };

   closeInvitationMenu = (model) => {
      model.remove(this.invitationMenu);
      this.rt_prev = false;
      this.invitationMenu = null;
      this.yesButton = null;
      this.noButton = null;
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

   animate = (model, fromUser, operation ,isInviteForMe) => {
      let rt = buttonState.right[0].pressed;
      if(isInviteForMe){
         if(this.invitationMenu==null){
            this.invitationMenu = this.createInvitationMenu(model, fromUser, operation);
            this.invitationMenu.identity().hud().move(0,0,0).scale(1,1,.0001);
         } else {
            this.invitationMenu.identity().hud().move(0,0,0).scale(1,1,.0001);

            // Check if selected YES
            let isYes = this.checkOptionAndSelection(this.yesButton, 0.1, 0.1, rt, this.rt_prev, [0.1,1,0.1],[0.1,0.6,0.1]);
            
            // Check if selected NO
            let isNo = this.checkOptionAndSelection(this.noButton, 0.1, 0.1, rt, this.rt_prev, [1,0.1,0.1],[0.6,0.1,0.1]);

            if(isYes || isNo){
               this.closeInvitationMenu(model);
               return isYes;
            } 
         }
      } 
      
      this.rt_prev = rt;
      return null;
   }
}