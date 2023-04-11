import {buttonState} from "../render/core/controllerInput.js";

export let isLBt1 = () =>{
        return buttonState.left[0].pressed;
    }
    export let isLBt2 = () =>{
        return buttonState.left[1].pressed;
    }
    export let isRBt1 = () =>{
        return buttonState.right[0].pressed;
    }
    export let isRBt2 = () =>{
        return buttonState.right[1].pressed;
    }
    export let isLY = () =>{
        return buttonState.left[5].pressed;
    }
    export let isLX = () =>{
        return buttonState.left[4].pressed;
    }
    export let isRB = () =>{
        return buttonState.right[5].pressed;
    }
    export let isRA = () =>{
        return buttonState.right[4].pressed;
    }