import { g2 } from "../util/g2.js";
import * as cg from "../render/core/cg.js";
import { controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";
import { lcb, rcb } from '../handle_scenes.js';
import { rotate } from "../third-party/gl-matrix/src/gl-matrix/mat2.js";
import * as ut from '../sandbox/utils.js'

export class CreateInfoBannerController {

   constructor(){
      this.infoBanner = null;
      this.bannerText = "";
      this.bannerPosition = [0,0,0];
   }

   init = (model, bannerPosition) => {
      this.infoBanner = model.add();
      this.bannerPosition = bannerPosition;
      let infoBannerBG = this.infoBanner.add('cube').scale(0.3,0.03,1).texture('../media/textures/menu/png-small/menu-item-type-6.png');
      let infoBannerText = this.infoBanner.add('cube').texture( () => {
         g2.textHeightAndFont('',0.042,'Arial');
         g2.setColor('white');
         g2.fillText( this.bannerText, 0.5, 0.505 , 'center');
         g2.drawWidgets(infoBannerText);
      }).scale(0.3,0.3,1);
      this.infoBanner.move(bannerPosition)
   }
   
   animate = (state_msg) => {
      // Get value from state to show the current message or not
      let show = false;

      // Get banner text based on the state
      // for example if you are viewing some user's view.
      this.bannerText = "You are viewing " + "<user>" +"'s view.";

      // or 
      //this.bannerText = "You are sharing your view.";

      if(show){
         this.infoBanner.identity().hud().move(this.bannerPosition).scale(1,1,0.0001).opacity(1);
      } else {
         this.infoBanner.identity().hud().move(this.bannerPosition).scale(1,1,0.0001).opacity(0.0001);
      }


   }
}