import { g2 } from "../util/g2.js";
import * as cg from "../render/core/cg.js";
import * as ut from "../sandbox/utils.js"
import * as wu from "../sandbox/wei_utils.js"
import { controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";
import { lcb, rcb } from '../handle_scenes.js';
import { rotate } from "../third-party/gl-matrix/src/gl-matrix/mat2.js";




export class CreateShareMenuController {

   constructor(){
      // Menu selection controls
      this.operationTypes = [ut.POS_EXCHANGE_MSG, ut.PERSP_SHARING_MSG];
      this.rt = false;
      this.rt_prev = false;

      this.openMenu = false;
      this.rotateYThreshold = 0.6;
      this.rotateYDelta = 0.06;
      
      this.moveXThreshold = 0.6;
      this.moveXDelta = 0.06;
      
      this.selectedPlayerIndex = -1;
      this.selectedOperationIndex = -1;
      
      this.moveX = 0.0;
      this.menuOpacity = 1;
      this.operationMenuOpacity = 0.001;
      this.rotateY = 0.0;
         
      this.playerTilesObjectList = [];
      this.operationTilesObjectList = [];
   
      this.sharingMenu = null;
      this.userListMenu = null;
      this.operationMenu = null;
      this.playerNames = null;


      this.init = (model) =>{
         this.model = model;
         this.sharingMenu = this.createSharingMenu(model, Array(0));

      }
   }
   


   createSharingMenu = (model, playerNames) => {

      this.selectedPlayerIndex = -1;
      this.selectedOperationIndex = -1;
      
      this.moveX = 0.0;
      this.rotateY = 0.0;
      this.menuOpacity = 1;
      this.operationMenuOpacity = 0.001;
         
      this.playerTilesObjectList = [];
      this.operationTilesObjectList = [];
   

      this.sharingMenu = model.add();
      this.playerTilesObjectList = [];
      this.operationTilesObjectList = [];

      this.playerNames = playerNames;
      
      this.userListMenu = this.createUserListMenu(this.sharingMenu);
      this.operationMenu = this.createOperationMenu(this.sharingMenu);

      return this.sharingMenu;

   };



   // Menu item selection/hover logic
   getBeamIntersectionWithBoxObjects =  (objectList, intersectionWidth, intersectionHeight, rt, rt_prev, hoverColorSet) => {
      for(let i=0;i<objectList.length;i++){
         let center = objectList[i].getGlobalMatrix().slice(12,15);
         let point = rcb.projectOntoBeam(center);
         let diff = cg.subtract(point, center);
         let hit = (Math.abs(diff[0]) < intersectionWidth) &&  (Math.abs(diff[1]) < intersectionHeight);//cg.norm(diff) < intersectionRadius;

         if(hit){
            if(i===0){
               objectList[i].color([0.9,0,0]);
            } else {
               objectList[i].color(hoverColorSet);
            }
            if(rt && !rt_prev){
               return i;
            }
         } else {
            if(i===0){
               objectList[i].color([0.9,0.3,0.3]);
            } else {
               objectList[i].color([1,1,1]);
            }
         }
      }
      return -1;
   }
   
   // Operation selection menu
   createOperationMenu = (sharingMenu) => {
      let operationMenu = sharingMenu.add();
      let operationMenuBG = operationMenu.add('cube').texture('../media/textures/menu/png-small/menu-bg.png').scale(0.3,0.5,0.001);
      let selectOperationBox = operationMenu.add('cube').scale(0.20,0.04,1).texture('../media/textures/menu/png-small/menu-item-type-3.png').move(0,9.5,0.1);
      let selectOperationText = selectOperationBox.add('cube').texture(() => {
         g2.textHeightAndFont('',0.05,'Arial');
         g2.setColor('#1a1aff');
         g2.fillText("SELECT OPERATION", 0.5, 0.5 , 'center');
         g2.drawWidgets(selectOperationText);
      }).scale(1.5,7.5,1).move(0,0,0.1);

      let operationMenuCancelButton = operationMenu.add('cube').scale(0.20,0.05,1).texture('../media/textures/menu/png-small/menu-item-type-1.png').move(0,-7.5,0.1).color(0.9,0.3,0.3);
      let operationMenuCancelButtonText = operationMenuCancelButton.add('cube').texture(() => {
         g2.textHeightAndFont('',0.05,'Arial');
         g2.setColor('white');
         g2.fillText("CANCEL", 0.5, 0.5 , 'center');
         g2.drawWidgets(operationMenuCancelButtonText);
      }).scale(2,8,1).move(0,0,0.15);

      let operationTiles = operationMenu.add();

      let operationTileText = operationTiles.add('cube').texture(() => {
            g2.textHeightAndFont('',0.05,'Arial');
            g2.setColor('white');
            for (let i = 0; i < this.operationTypes.length; i++) {
               g2.fillText(this.operationTypes[i], 0.5, 0.88 - i*0.157 , 'center');
            }
            g2.drawWidgets(operationTileText);
         }).scale(0.4,0.4,1).move(0,-0.1,0.15);
         
      this.operationTilesObjectList.push(operationMenuCancelButton);
      
      let yLocO = 5.2, yDeltaO = -2.5;
      for (let i = 0; i < this.operationTypes.length; i++) {
         let operationTileBG = operationTiles.add('cube').scale(0.20,0.05,1).texture('../media/textures/menu/png-small/menu-item-type-6.png').move(0,yLocO,0.1);
         this.operationTilesObjectList.push(operationTileBG);
         yLocO = yLocO + yDeltaO;
      }
      
      return operationMenu;
   };


   // Username selection menu
   createUserListMenu = (sharingMenu) => {
      let userListMenu = sharingMenu.add();
      let userListMenuBG = userListMenu.add('cube').texture('../media/textures/menu/png-small/menu-bg.png').scale(0.3,0.5,0.001);
      // User Select Text Box Heading
      let selectUserBox = userListMenu.add('cube').scale(0.20,0.04,1).texture('../media/textures/menu/png-small/menu-item-type-3.png').move(0,9.5,0.1);
      let selectUserText = selectUserBox.add('cube').texture(() => {
         g2.textHeightAndFont('',0.05,'Arial');
         g2.setColor('#1a1aff');
         g2.fillText("SELECT USER", 0.5, 0.5 , 'center');
         g2.drawWidgets(selectUserText);
      }).scale(1.5,7.5,1).move(0,0,0.1);
   
      // Cancel Button and Text
      let menuCancelButton = userListMenu.add('cube').scale(0.20,0.05,1).texture('../media/textures/menu/png-small/menu-item-type-1.png').move(0,-7.5,0.1).color(0.9,0.3,0.3);
      let menuCancelButtonText = menuCancelButton.add('cube').texture(() => {
         g2.textHeightAndFont('',0.05,'Arial');
         g2.setColor('white');
         g2.fillText("CANCEL", 0.5, 0.5 , 'center');
         g2.drawWidgets(menuCancelButtonText);
      }).scale(2,8,1).move(0,0,0.15);
      
      // User Name Text 
      let playerTiles = userListMenu.add();
      let playerTileText = playerTiles.add('cube').texture(() => {
            g2.textHeightAndFont('',0.05,'Arial');
            g2.setColor('white');
            for (let i = 0; i < this.playerNames.length; i++) {
               g2.fillText(this.playerNames[i], 0.5, 0.88 - i*0.157 , 'center');
            }
            g2.drawWidgets(playerTileText);
         }).scale(0.4,0.4,1).move(0,-0.1,0.15);

      this.playerTilesObjectList.push(menuCancelButton);
      // User Name Tiles
      let yLoc = 5.2, yDelta = -2.5;
      for (let i = 0; i < this.playerNames.length; i++) {
         let playerTileBG = playerTiles.add('cube').scale(0.20,0.05,1).texture('../media/textures/menu/png-small/menu-item-type-4.png').move(0,yLoc,0.1);
         this.playerTilesObjectList.push(playerTileBG);
         yLoc = yLoc + yDelta;
      }
      this.playerTiles = playerTiles;



      return userListMenu;
   }
   onChangeNameList(newPlayerNames){
      let playerNames = this.playerNames;
      if(newPlayerNames.length > playerNames.length){
         let yLoc = 5.2, yDelta = -2.5;
         for (let i = playerNames.length; i < newPlayerNames.length; i++) {
            yLoc = 5.2 + yDelta * i;
            let playerTileBG = this.playerTiles.add('cube').scale(0.20,0.05,1).texture('../media/textures/menu/png-small/menu-item-type-4.png').move(0,yLoc,0.1);
            this.playerTilesObjectList.push(playerTileBG);
         }
      }else if(newPlayerNames.length < playerNames.length){
         for(let i = newPlayerNames.length; i < playerNames.length; i++){
            this.playerTiles.remove(this.playerTilesObjectList[i + 1]);
            this.playerTilesObjectList.pop();
         }
      }
      this.playerNames = newPlayerNames;

   }

   closeMenu = () => {
      this.operationMenu.identity().hud().move(0.6 - this.moveX,0,0).scale(1,1,.0001).opacity(0.0001);
      this.userListMenu.identity().hud().move(-this.moveX,0,(this.menuOpacity-1)/6).scale(1,1,.0001).opacity(0.0001);
      this.moveX = 0.0;
      this.menuOpacity = 1;  
      this.operationMenuOpacity = 0.001;
      this.selectedPlayerIndex = -1;
      this.selectedOperationIndex = -1;
      this.openMenu = false;
   }

   returnObject = (user,op) => {
      return {user : user, op : op};
   }
   
   openUserMenu = () =>{
      this.openMenu = true;
      this.operationMenu.identity().hud().move(0.6 - this.moveX,0,0).scale(1,1,.0001).opacity(this.operationMenuOpacity);
      this.userListMenu.identity().hud().move(-this.moveX,0,(this.menuOpacity-1)/6).scale(1,1,.0001).opacity(1).color([this.menuOpacity,this.menuOpacity,this.menuOpacity]);
   }
   animate = (t, state_msg) => {
      if(state_msg.GLOBAL_MENU.INACTIVE){
         this.closeMenu();
         state_msg.GLOBAL_MENU.OPEN = this.openMenu;
         return [false, state_msg];
      }
      let model = this.model;
      let playerNames = Array(0);
      let selected = null;
      let flag = false;
      for(let [name, info] of state_msg["PERSPECTIVE"]["PLAYER_INFO"]){
         if(name !== state_msg["PERSPECTIVE"]["SELF"])
            playerNames.push(name);
      }
      this.onChangeNameList(playerNames);

      if( buttonState.right[5].pressed){
         console.log("????????????????????????????????????")
         this.openUserMenu();

      } else if(this.openMenu){
         let rt = buttonState.right[0].pressed;
         this.operationMenu.identity().hud().move(0.6 - this.moveX,0,0).scale(1,1,.0001).opacity(this.operationMenuOpacity);
         this.userListMenu.identity().hud().move(-this.moveX,0,(this.menuOpacity-1)/6).scale(1,1,.0001).color([this.menuOpacity,this.menuOpacity,this.menuOpacity]);

         if(this.selectedPlayerIndex === -1){
            this.selectedPlayerIndex = this.getBeamIntersectionWithBoxObjects(this.playerTilesObjectList, 0.1, 0.02, rt, this.rt_prev,[0.2,0.2,1]) ;
            // selectedPlayerIndex = playerTilesObjectList.length - 1;
         } else {
            // Cancel button pressed
            if(this.selectedPlayerIndex === 0){
               this.closeMenu();
               selected = this.returnObject(null,null);
               flag = true;
            }else {
               if (this.selectedOperationIndex === -1) {
                  if (this.moveX < this.moveXThreshold) {
                     this.moveX = this.moveX + this.moveXDelta;
                     this.rotateY = this.rotateY + this.rotateYDelta
                     this.menuOpacity = this.menuOpacity - 0.04;
                     this.operationMenuOpacity += 0.1;
                  } else {
                     this.selectedOperationIndex = this.getBeamIntersectionWithBoxObjects(this.operationTilesObjectList, 0.1, 0.02, rt, this.rt_prev, [0.2, 0.2, 1]);
                  }

               }

               if (this.selectedOperationIndex === 0) {
                  // Closing the operation menu
                  if (this.moveX > 0) {
                     this.moveX = this.moveX - this.moveXDelta;
                     this.rotateY = this.rotateY - this.rotateYDelta;
                     this.menuOpacity = this.menuOpacity + 0.04;
                     this.operationMenuOpacity -= 0.1;
                  } else {
                     this.selectedOperationIndex = -1;
                     this.selectedPlayerIndex = -1;
                  }
               }

               if (this.selectedPlayerIndex > 0 && this.selectedOperationIndex > 0 ) {
                  // close all open menus and return selected values - assign default values to variables
                  let user = this.playerNames[this.selectedPlayerIndex - 1];
                  let op = this.operationTypes[this.selectedOperationIndex - 1];
                  this.closeMenu(model);
                  selected = this.returnObject(user, op);
                  flag = true;
               }
            }

         }
         this.rt_prev = rt;
         if(flag){
            state_msg.GLOBAL_MENU.ACTION = selected;
         }

      }
      state_msg.GLOBAL_MENU.OPEN = this.openMenu;
      return [false, state_msg];
   }

   clearState = (t, state, msg_collection) =>{
      if(!wu.isNull(state.GLOBAL_MENU.ACTION.op)){
         if(state.GLOBAL_MENU.ACTION.op === ut.PERSP_SHARING_MSG){
            state["MODE"]["TMP_MODE"] = ut.PERSP_SHARING_MSG;
            state.PERSPECTIVE.ACTION.MSG = ut.PERSP_SHARING_MSG;
            state.PERSPECTIVE.ACTION.USER = state.GLOBAL_MENU.ACTION.user;
         }else if(state.GLOBAL_MENU.ACTION.op === ut.POS_EXCHANGE_MSG){
            state.SEND.USER = state.GLOBAL_MENU.ACTION.user;
            state.SEND.OP = state.GLOBAL_MENU.ACTION.op;
            state.SEND.ACT = null;
            console.log("click", state.SEND);
            msg_collection.sendInvitation(state);
            state.PERSPECTIVE.ACTION.MSG = ut.POS_EXCHANGE_MSG;
            state.PERSPECTIVE.ACTION.INFO = state.PERSPECTIVE.PLAYER_INFO.get(state.SEND.USER);
         }
         state.GLOBAL_MENU.ACTION.op = null;
      }

      return state;
   }

}