import { g2 } from "../util/g2.js";
import * as bc from "../sandbox/baseController.js"
import { controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";
import { lcb, rcb } from '../handle_scenes.js';
import * as cg from "../render/core/cg.js";

export class CreateLoginMenuController {
    constructor() {

        this.logInMenu = null;
        // List of all user names supported
        this.userNamesAll = ["Lewei", "Rahul", "Zhiqi", "Namrata"];
        this.availableUserNames = [];
        this.userNameTilesObjectList = [];
        this.rt_prev = false;
        this.model = null;
    }

    init = (model) => {
        this.model = model;
        this.currentUserBanner = null;
        // already logged in users 
        // UPDATE this variable to get a list of all logged in users using state["PERSPECTIVE"]["PLAYER_INFO"]
        let loggedInUsers = ["Rahul", "Zhiqi"];
        
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

    animate = (model, state) =>{
        
        if(this.currentUserBanner != null){
            this.currentUserBanner.identity().hud().turnY(-0.4).move(0.77,0.43,0.0).scale(0.30,0.06,0.001);
        }

        // TODO :set state as required
        if(state.LOGIN.DISABLED){
            // TODO : Update return as required
            return [false, state];
        }

        this.logInMenu.identity().hud().move(0,0,0).scale(1,1,.0001);
        let rt = buttonState.right[0].pressed;
        let res = this.getBeamIntersectionWithBoxObjects(this.userNameTilesObjectList, 0.1, 0.02, rt, this.rt_prev, [0.2,0.2,1]);
        
        if(res > -1){
            let userName = this.availableUserNames[res];
            this.currentUserBanner = model.add('cube').texture('../media/textures/menu/png-small/menu-item-type-4.png').scale(0.1,0.1,0.001);
            let selectUserText = this.currentUserBanner.add('cube').texture(() => {
                g2.textHeightAndFont('',0.05,'Arial');
                g2.setColor('white');
                g2.fillText(" Hi ! " + userName, 0.5, 0.5 , 'center');
                g2.drawWidgets(selectUserText);
            }).scale(1.5,7.5,1).move(0,0,0.1);

            // TODO :set state as required - update list of users in sandbox
            state.LOGIN.NAME = userName;
            this.logInMenu.opacity(0.0001);
            state.LOGIN.DISABLED = true;

            // TODO : Update return as required
            return [false, state];
        }
        
        this.rt_prev = rt;
        // TODO : Update return as required
        return [false, state];
    }

    clearState = (state, sandbox) =>{
        if(state.LOGIN.NAME !== null){
            sandbox.setName(state.LOGIN.NAME)
        }
    }
    
}