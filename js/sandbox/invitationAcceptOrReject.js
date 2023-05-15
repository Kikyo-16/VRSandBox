import { g2 } from "../util/g2.js";
import * as cg from "../render/core/cg.js";
import { controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";
import { lcb, rcb } from '../handle_scenes.js';
import { rotate } from "../third-party/gl-matrix/src/gl-matrix/mat2.js";
import * as ut from './utils.js'

export class CreateInvitationARController {

   constructor(){
      this.bannerPosition = [0,0,0];
      this.opacity = 0.0001;
      this.color = [1,1,1];
      this.infoBanner = null;
      this.fadeOutSpeed = 0.01;
      this.bannerARText = "";
   }

   init = (model, bannerPosition, fadeOutSpeed) => {
      this.infoBanner = model.add();
      this.bannerPosition = bannerPosition;
      this.fadeOutSpeed = this.fadeOutSpeed;
      let infoBannerBG = this.infoBanner.add('cube').scale(0.3,0.03,1).texture('../media/textures/menu/png-small/menu-item-type-6.png');
      let infoBannerText = this.infoBanner.add('cube').texture( () => {
         g2.textHeightAndFont('',0.042,'Arial');
         g2.setColor('white');
         g2.fillText( this.bannerARText, 0.5, 0.505 , 'center');
         g2.drawWidgets(infoBannerText);
      }).scale(0.3,0.3,1);
      this.infoBanner.move(bannerPosition)
   }
   
   animate = (state_msg) => {

      // Get value from state to show the current message or not
      let show = false;

      if(show && this.opacity == 0.0001){
         // set the state variable to reflect show as false in next frame
         this.opacity = 1;
      }
      
      let user = "<user>"; // Get user from the invitation
      // Get banner text based on the state
      // for example if your request was accepted..
      let accepted = true;
      if(accepted){
         this.bannerARText = user + " Accepted your invitation.";
         this.color = [0.3,   1, 0.3];
         
      } else {
         this.bannerARText = user + " Rejected your invitation.";;
         this.color = [  1, 0.3, 0.3];
      }
     

      if(this.opacity < 0.01){
         this.opacity = 0.0001;
      } else {
         this.opacity = this.opacity - this.fadeOutSpeed;
      }

      this.infoBanner.identity().hud().move(this.bannerPosition).scale(1,1,0.0001).color(this.color).opacity(this.opacity);
      
   }
}