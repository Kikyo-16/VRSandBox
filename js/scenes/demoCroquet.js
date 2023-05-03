import * as croquet from "../util/croquetlib.js";


export let updateModel = e => {
    if(window.demoDemoCroquetState) { // use window.demo[your-demo-name]State to see if the demo is active. Only update the croquet interaction when the demo is active.
        window.clay.model.msg += 1;
    }
}

export const init = async model => {
    model.msg = 0
    croquet.register('croquetDemo_1.0');
    model.animate(() => {
        console.log("here", model.msg)
    });
 }