import * as bc from "../sandbox/baseController.js"
import * as wu from "../sandbox/wei_utils.js"
import {g2} from "../util/g2.js";
import * as cg from "../render/core/cg.js";
import { lcb, rcb } from '../handle_scenes.js';
import * as ut from "../sandbox/utils.js"

export function CreateSavingController(model, sandbox){

    let menu = model.add();
    let userNamesAll = [ut.LOAD_MSG, ut.SAVE_MSG, ut.LOGOUT_MSG, ut.CANCEL_MSG];

    this.availableUserNames = [];
    this.userNameTilesObjectList = [];
    this.rt_prev = false;
    this.is_open = false;


    this.pre = -1;
    this.msg = ["NULL"];
    this.is_saving = false;

    let file_input = document.getElementById('fileInput');
    file_input.addEventListener('change', function selectedFileChanged() {
        console.log("click", file_input.files);
        if(file_input.files.length === 0)
            return;
        const reader = new FileReader();
        reader.onload = function fileReadCompleted() {
            console.log("result......");
            sandbox.setScene(reader.result);

        };
        reader.readAsText(this.files[0]);
    });

    this.currentUserBanner = null;
    for(let i=0;i< userNamesAll.length;i++){
        this.availableUserNames.push(userNamesAll[i]);
    }


    // User Select Text Box Heading
    let userLogInMenuBG = menu.add('cube').texture('../media/textures/menu/png-small/menu-bg.png').scale(0.3,0.5,0.001);

    let selectUserBox = menu.add('cube').scale(0.20,0.04,1).texture('../media/textures/menu/png-small/menu-item-type-3.png').move(0,9.5,0.1);
    let selectUserText = selectUserBox.add('cube').texture(() => {
            g2.textHeightAndFont('',0.05,'Arial');
            g2.setColor('#1a1aff');
            g2.fillText("SELECT", 0.5, 0.5 , 'center');
            g2.drawWidgets(selectUserText);
    }).scale(1.5,7.5,1).move(0,0,0.1);

    // User Name Text
    let userNameTiles = menu.add();
    let userNameTileText = userNameTiles.add('cube').scale(0.4,0.4,1).move(0,-0.1,0.15);

    // User Name Tiles
    let yLoc = 5.2, yDelta = -2.5;
    for (let i = 0; i < this.availableUserNames.length; i++) {
        let userNameTileBG = userNameTiles.add('cube').scale(0.20,0.05,1).texture('../media/textures/menu/png-small/menu-item-type-4.png').move(0,yLoc,0.1);
        this.userNameTilesObjectList.push(userNameTileBG);
        yLoc = yLoc + yDelta;
    }

    let textureNull = () =>{

    }
    let textureFn = () => {
        g2.textHeightAndFont('',0.05,'Arial');
        g2.setColor('white');
        for (let i = 0; i < this.availableUserNames.length; i++) {
            g2.fillText(this.availableUserNames[i], 0.5, 0.88 - i*0.157 , 'center');
        }
        g2.drawWidgets(userNameTileText);
    }

    let closeMenu = () =>{
        menu.opacity(.0001);
        this.is_open = false;
        userNameTileText.texture(textureNull);
    }
    let openMenu = () =>{
        menu.opacity(1.);
        this.is_open = true;
        userNameTileText.texture(textureFn);
    }

    closeMenu();
    // Menu item selection/hover logic
    let getBeamIntersectionWithBoxObjects = (objectList, intersectionWidth, intersectionHeight, rt, rt_prev, hoverColorSet) => {
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

    let parseState = (e) =>{
        if(wu.isNull(e)){
            return e;
        }
        if(e.constructor===Array){
            let export_json = Array(0);
            for(let i = 0; i < e.length; ++ i){
                export_json.push(parseState(e[i]));
            }
            return export_json;
        }else if(e.constructor===Map){
            let export_json = {};
            for(let [key, info] of e){
                export_json[key] = parseState(info)
            }
            return export_json;
        }else{
            return e;
        }

    }


    let exportState = (state) =>{
        let v = sandbox.getScene(false);
        let json_data = parseState(v);
        const jsonFromMap = JSON.stringify(json_data);
        let file_name = state.LOGIN.NAME.toString() + "_" + sandbox.timer.newTime();
        const a = document.createElement("a");
        const file = new Blob([jsonFromMap], {type: 'text/plain'});
        a.href = URL.createObjectURL(file);
        a.download = file_name;
        a.click();
    }

    this.animate = (model, state) =>{

        if(this.currentUserBanner != null){
            this.currentUserBanner.identity().hud().turnY(-0.4).move(0.77,0.43,0.0).scale(0.30,0.06,0.001);
        }

        if(state.SAVING.INACTIVE){
            closeMenu();
            state.SAVING.OPEN = this.is_open;
            return [false, state];
        }
        if(!this.is_open && bc.isLBt1()&&bc.isLBt2()){
            openMenu();
        }
        if(!this.is_open){
            state.SAVING.OPEN = this.is_open;
            return [false, state];
        }

        menu.identity().hud().move(0,0,0).scale(1,1,.0001);

        let rt = bc.isRBt1();
        let res = getBeamIntersectionWithBoxObjects(this.userNameTilesObjectList, 0.1, 0.02, rt, this.rt_prev, [0.2,0.2,1]);

        if(res > -1){
            let op = this.availableUserNames[res];
            switch (op) {
                case ut.LOAD_MSG:
                    file_input.click();
                    break;
                case ut.SAVE_MSG:
                    exportState(state);
                    break;
                case ut.CANCEL_MSG:
                    break;
                case ut.LOGOUT_MSG:
                    state.LOGIN.OUT = true;
                    break;
                default:

            }
            closeMenu();
            state.SAVING.OPEN = this.is_open;
            return [false, state];
        }

        this.rt_prev = rt;
        state.SAVING.OPEN = this.is_open;
        return [false, state];
    }

    this.clearState = (t, state, multi_player) =>{
        if(state.LOGIN.OUT){
            state.LOGIN.OUT = false;
            state.LOGIN.INACTIVE = false;
            state.LOGIN.CD = 10;

            sandbox.setName(null);
            multi_player.reset();
        }
        return state
    }

}