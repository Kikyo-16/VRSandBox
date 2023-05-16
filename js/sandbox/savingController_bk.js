import * as bc from "../sandbox/baseController.js"
import {g2} from "../util/g2.js";

export function CreateSavingController(model){

    let PRESS = 4;
    let CD = .5;
    this.pre = -1;
    this.msg = ["NULL"];
    this.is_saving = false;





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

    this.animate = (t, state) =>{
        let flag = saving(t);
        if(flag)
            state.LOGIN.SAVE = true;
        return [false, state];
    }

    this.clearState = (t, state, sandbox) =>{
        if(state.LOGIN.SAVE){
            let jsonData = JSON.stringify(sandbox.getScene(false));
            //const fs = require("fs");
            //"../media/scenes/" +
            let file_name = state.LOGIN.NAME.toString() + "_" + sandbox.timer.newTime();
            //fs.writeFile(file_name, jsonData);
            const a = document.createElement("a");
            const file = new Blob([jsonData], {type: 'text/plain'});
            a.href = URL.createObjectURL(file);
            a.download = file_name;
            a.click();
            state.LOGIN.SAVE = false;
        }
        return state;
    }


}