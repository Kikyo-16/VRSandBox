import * as cg from "../render/core/cg.js";

export let MODES = ["Sandbox->View", "Room->Object"];
export let SANDBOX_MODES = ["Sandbox->View", "Sandbox->Edit", "Sandbox->Object"]
export let SANDBOX_OBJ = 2;
export let NON_ACTION = 0;
export let REQUIRE_NEW_OBJ = 1;
export let REQUIRE_WALL_PROP = 3;




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
