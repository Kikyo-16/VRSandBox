import {isObj} from '../sandbox/utils.js'


let checkInside = (obj, mode) => {
    //mode : String = {"left" | "right"}
    //manipulate only valid clays
    if(!isObj(obj._form))
        return false;

    //TODO
    return false
}
let isInObj = (obj, mode) => {
    let res = undefined;
    for(let i = 0; i < obj.nChildren(); ++i){
        res = isInObj(obj.child(i), mode);
        if (res !== undefined){
            return res;
        }
    }
    if (checkInside(obj, mode))
        return obj;
    return undefined;
}

let deleteObj = (obj) =>{
    for(let i = 0; i < obj.nChildren(); ++i){
       deleteObj(obj[i]);
    }
    if (obj._parent !== undefined)
        obj._parent.remove(obj);
}
export let unselectAll = (obj) =>{
    for(let i = 0; i < obj.nChildren(); ++i){
       unselectAll(obj[i]);
    }
    obj.capacity(1);
}
let select = (obj) => {
    if(obj !== undefined)
        obj.capacity(.5);
}

export let getSelectedObj = (model) => {
    let l_obj = isInObj(model, "left");
    let r_obj = isInObj(model, "right");
    select(l_obj);
    select(r_obj);
    return [l_obj, r_obj];
}
