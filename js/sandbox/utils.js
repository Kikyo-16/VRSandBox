
import * as cg from "../render/core/cg.js";

export let isObj = (obj) => {
    return obj._form !== undefined && obj.status === 0;
}

export let ensemble = (parent, obj_list) =>{
    let node = parent.add();
    node.status = 0;
    for(let i = 0; i < obj_list.length(); ++i){
       obj_list[i]._parent = node;
       disableSelect(obj_list[i]);
    }
    return node;
}

export let disableSelect = (obj) => {
    for(let i = 0; i < obj.nChildren(); ++i){
       disableSelect(obj[i]);
    }
    obj.status = 1;
}

export let mCopy = (m) => {
    let a = Array(0);
    for(let i = 0; i < m.length; ++i){
        a.push(m[i])
    }
    return a;
}

export let transform = (mTr, obj) => {
    let mGA = obj.getGlobalMatrix();
    let mA  = obj.getMatrix();
    let tr  = cg.mMultiply(mA, cg.mInverse(mGA));
    tr      = cg.mMultiply(mTr, tr);
    return cg.mMultiply(tr, mA)
}