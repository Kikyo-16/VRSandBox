import * as bc from "../sandbox/baseController.js"
import * as wu from "../sandbox/wei_utils.js"
import {g2} from "../util/g2.js";

export function CreateSavingController(model, sandbox){

    let PRESS = 2;
    let CD = .5;
    this.pre = -1;
    this.msg = ["NULL"];
    this.is_saving = false;


    this.invitationMenu = model.add();
    let invitationMenuBG = this.invitationMenu.add('cube').scale(0.35,0.05,1).texture('../media/textures/menu/png-small/menu-item-type-6.png');
    let invitationMenuText = invitationMenuBG.add('cube').texture( () => {
        g2.textHeightAndFont('',0.042,'Arial');
            //g2.setColor('#1a1aff');
        g2.setColor('white');
        g2.fillText( this.msg[0], 0.5, 0.505 , 'center');
        g2.drawWidgets(invitationMenuText);
    }).scale(1,7,1).move(0,0,0.1);
    this.invitationMenu.identity().hud().move(0,0,0).scale(1,1,.0001);
    this.invitationMenu.opacity(0.00001);

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



    let showMsg = (text, ratio) =>{
        this.msg[0] = text;
        console.log(ratio)
        this.invitationMenu.opacity(ratio);

    }



    let saving = (t) =>{
        if((!bc.isLBt2()||!bc.isLBt1()) && !this.is_saving){
            this.pre = -1;
            return false;
        }
        let flag = false;
        if(this.pre === -1){
            this.pre = t
        }else if(t - this.pre > PRESS){
            if(!this.is_saving){
                flag = true;
            }
            this.is_saving = true;
            if(t - this.pre > PRESS + 4 * CD){
                this.pre = t;
                this.is_saving = false;
            }else{
                let dt = (t - this.pre - PRESS) / CD;
                if(dt > 1 && dt < 3)
                    dt = 1
                else if(dt > 3)
                    dt = (4 - dt) - .1;
                if(dt < 0)
                    dt = 0.00001
                showMsg("Saved successfully!",  dt);
            }

            return flag;
        }


    }

    let load = () =>{
        let input = document.createElement('input');
        input.type = 'file';
        input.onchange = _ => {
            let files =   Array.from(input.files);
            console.log(files);
        };
        input.click();

    }

    let parseState = (e) =>{
        if(wu.isNull(e)){
            return e;
        }
        console.log("jiji", e.constructor);
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


    let exportState = (e) =>{
        let json_data = parseState(e);
        return JSON.stringify(json_data);
    }



    let importState = (state) =>{
        state.LOGIN.SAVE = false;
        file_input.click();
        return state;

    }

    this.animate = (t, state) =>{
        let flag = saving(t);
        if(flag)
            state.LOGIN.SAVE = true;
        return [false, state];
    }

    this.clearState = (t, state, sandbox) =>{
        if(state.LOGIN.SAVE){
            return importState(state);
            let v = sandbox.getScene(false);
            const jsonFromMap = exportState(v);
            let file_name = state.LOGIN.NAME.toString() + "_" + sandbox.timer.newTime();
            console.log("ashere", v, jsonFromMap);
            const a = document.createElement("a");
            const file = new Blob([jsonFromMap], {type: 'text/plain'});
            a.href = URL.createObjectURL(file);
            a.download = file_name;
            a.click();
            state.LOGIN.SAVE = false;
        }
        return state;
    }


}