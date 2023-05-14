import { g2 } from "../util/g2.js";
import * as bc from "../sandbox/baseController.js"
import { controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";
import { lcb, rcb } from '../handle_scenes.js';
import * as cg from "../render/core/cg.js";

export class CreateLoginMenuController {
    constructor() {

        this.logInMenu = null;
        // List of all user names supported
        this.userNamesAll = ["Liwei", "Rahul", "Zhiqi", "Namrata"];
        this.availableUserNames = [];
        this.userNameTilesObjectList = [];
        this.rt_prev = false;
        this.model = null;
        this.name = "";
    }

    init = (model, loggedInUsers) => {
        this.model = model;
        this.currentUserBanner = null;
        // already logged in users 
        // UPDATE this variable to get a list of all logged in users using state["PERSPECTIVE"]["PLAYER_INFO"]

        
        for(let i=0;i<this.userNamesAll.length;i++){
            if(!loggedInUsers.includes(this.userNamesAll[i])){
                this.availableUserNames.push(this.userNamesAll[i]);
            }
        }


        this.logInMenu = this.model.add();
        // User Select Text Box Heading
        let userLogInMenuBG = this.logInMenu.add('cube').texture('../media/textures/menu/png-small/menu-bg.png').scale(0.3,0.5,0.001);

        let selectUserBox = this.logInMenu.add('cube').scale(0.20,0.04,1).texture('../media/textures/menu/png-small/menu-item-type-3.png').move(0,9.5,0.1);
        let selectUserText = selectUserBox.add('cube').texture(() => {
            g2.textHeightAndFont('',0.05,'Arial');
            g2.setColor('#1a1aff');
            g2.fillText("SELECT YOUR NAME", 0.5, 0.5 , 'center');
            g2.drawWidgets(selectUserText);
        }).scale(1.5,7.5,1).move(0,0,0.1);

        // User Name Text 
        let userNameTiles = this.logInMenu.add();
        let userNameTileText = userNameTiles.add('cube').texture(() => {
                g2.textHeightAndFont('',0.05,'Arial');
                g2.setColor('white');
                for (let i = 0; i < this.availableUserNames.length; i++) {
                g2.fillText(this.availableUserNames[i], 0.5, 0.88 - i*0.157 , 'center');
                }
                g2.drawWidgets(userNameTileText);
            }).scale(0.4,0.4,1).move(0,-0.1,0.15);
        
        // User Name Tiles
        let yLoc = 5.2, yDelta = -2.5;
        for (let i = 0; i < this.availableUserNames.length; i++) {
            let userNameTileBG = userNameTiles.add('cube').scale(0.20,0.05,1).texture('../media/textures/menu/png-small/menu-item-type-4.png').move(0,yLoc,0.1);
            this.userNameTilesObjectList.push(userNameTileBG);
            yLoc = yLoc + yDelta;
        }



        this.currentUserBanner = this.model.add('cube').texture('../media/textures/menu/png-small/menu-item-type-4.png').scale(0.1,0.1,0.001);
        this.selectUserText = this.currentUserBanner.add('cube').scale(1.5,7.5,1).move(0,0,0.1);
        this.currentUserBanner.opacity(0.0001);
        
    }


    textureFn = (userName) =>{
        g2.textHeightAndFont('',0.05,'Arial');
        g2.setColor('white');
        g2.fillText(" Hi ! " + this.name, 0.5, 0.5 , 'center');
        g2.drawWidgets(this.selectUserText);
    }

    // Menu item selection/hover logic
    getBeamIntersectionWithBoxObjects = (objectList, intersectionWidth, intersectionHeight, rt, rt_prev, hoverColorSet) => {
        for(let i=0;i<objectList.length;i++){
            let center = objectList[i].getGlobalMatrix().slice(12,15);
            let point = rcb.projectOntoBeam(center);
            let diff = cg.subtract(point, center);
            let hit = (Math.abs(diff[0]) < intersectionWidth) &&  (Math.abs(diff[1]) < intersectionHeight);

            if(hit){
                objectList[i].color(hoverColorSet);
                if(rt && !rt_prev){
                    return i;
                }
            } else {
                    objectList[i].color([1,1,1]);
            }
        }
        return -1;
    }

    animate = (model, state, sandbox) =>{

        if(this.currentUserBanner != null){
            this.currentUserBanner.identity().hud().turnY(-0.4).move(0.77,0.43,0.0).scale(0.30,0.06,0.001);
        }

        // TODO :set state as required
        if(state.LOGIN.INACTIVE){
            // TODO : Update return as required
            this.logInMenu.opacity(0.0001);
            this.currentUserBanner.opacity(1);
            return [false, state];
        }

        this.logInMenu.opacity(1);
        this.currentUserBanner.opacity(0.0001);
        this.logInMenu.identity().hud().move(0,0,0).scale(1,1,.0001);


        if(state.LOGIN.CD > 0){
            state.LOGIN.CD = state.LOGIN.CD -1;
            return [false, state];
        }
        let rt = buttonState.right[0].pressed;
        let res = this.getBeamIntersectionWithBoxObjects(this.userNameTilesObjectList, 0.1, 0.02, rt, this.rt_prev, [0.2,0.2,1]);
        
        if(res > -1){
            let userName = this.availableUserNames[res];
            this.name = userName;
            this.selectUserText.texture(this.textureFn);
            // TODO :set state as required
            state.LOGIN.NAME = userName;
            sandbox.setName(userName);
            state.LOGIN.INACTIVE = true;

            // TODO : Update return as required
            return [false, state];
        }
        
        this.rt_prev = rt;
        // TODO : Update return as required
        return [false, state];
    }


    
}