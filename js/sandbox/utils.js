import * as cg from "../render/core/cg.js";



/*
* Menu CODE
* */

export let MENU_ADD_OBJ = 1;
export let MENU_REVISE_WALL = 2;
export let MENU_REVISE_OBJ = 3;
export let MENU_REVISE_BOX = 4;
export let MENU_DISABLED = 4;


export let MENU_OPEN = 1;
export let MENU_CANCEL = 2;
export let MENU_CLOSE = 3;


export let WALKING_FORWARD = 1;
export let WALKING_BACKWARD = 2;
export let WALKING_LEFT = 3;
export let WALKING_RIGHT = 4;

/*
* STATUS CODE
* */
//Room MODE
export let ROOM_GLOBAL = 1;
export let ROOM_WITHOUT_BOX = 2;
export let ROOM_WALKING = 3;
export let ROOM_WITH_BOX = 4;



//Sandbox MODE
export let BOX_GLOBAL = 11;
export let BOX_VIEW = 12;
export let BOX_EDIT = 13;
export let BOX_OBJ = 14;
export let IS_DIVING = 15;


export let TEXT_ROOM_WITH_BOX = "Click to hidden Sandbox";
export let TEXT_ROOM_WITHOUT_BOX = "Click to show Sandbox";
export let TEXT_BOX_VIEW = "Sandbox->View";
export let TEXT_BOX_EDIT = "Sandbox->Edit";
export let TEXT_BOX_OBJ = "Sandbox->Object";
export let TEXT_IS_DIVING = "Diving to Room...";
export let TEXT_ROOM_WALKING = "Walking in the Room...";


export let COLOR_ROOM_WITH_BOX = [153/255, 204/255, 255/255];
export let COLOR_ROOM_WITHOUT_BOX = [153/255, 1, 153/255];
export let COLOR_ROOM_WALKING = [255/255, 204/255, 102/255];
export let COLOR_BOX_VIEW = [255/255, 153/255, 204/255];
export let COLOR_BOX_EDIT = [153/255, 204/255, 255/255];
export let COLOR_BOX_OBJ = [153/255, 1, 153/255];
export let COLOR_IS_DIVING = [201/255, 176/255, 255/255];


export let isObj = (obj) => {
    return obj._form !== undefined && obj.status === 0;
}


export let disableSelect = (obj) => {
    for(let i = 0; i < obj.nChildren(); ++i){
       disableSelect(obj[i]);
    }
    obj.status = 1;
}


export let transform = (mTr, obj) => {
    let mGA = obj.getGlobalMatrix();
    let mA  = obj.getMatrix();
    let tr  = cg.mMultiply(mA, cg.mInverse(mGA));
    mGA      = cg.mMultiply(mTr, mGA);
    return cg.mMultiply(tr, mGA)
}

export let copy = (parent, obj) => {
    let obj_copy = parent.add();
    obj_copy._form = obj._form
    obj_copy.color = obj.color;
    obj_copy.capacity = obj.capacity;
    obj_copy.setMatrix(obj.getMax())
    for(let i = 0; i < obj.nChildren(); ++i){
       copy(obj_copy, obj[i]);
    }
}



export let distance = (a, b) =>{
    let d = 0;
    for(let i =0; i < a.length; ++ i){
        d += (a[i] - b[i])**2
    }
    return Math.sqrt(d);
}
