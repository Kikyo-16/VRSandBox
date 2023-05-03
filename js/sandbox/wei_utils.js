import * as cg from "../render/core/cg.js";

export let isNull = (x) => {
    return x === null || x === undefined;
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


export let objMatrix = (mTr, obj) => {
    let mGA = obj.getGlobalMatrix();
    let mA = obj.getMatrix();
    let tr = cg.mMultiply(mA, cg.mInverse(mGA));
    return cg.mMultiply(tr, mTr);
}


export let objGlobalMatrix = (mTr, obj) => {
    let mGA = obj.getGlobalMatrix();
    let mA = obj.getMatrix();
    let tr = cg.mMultiply(mGA, cg.mInverse(mA));
    return cg.mMultiply(tr, mTr);
}

export let mulScaler = (a, c) => {
    let b = Array(0);
    for(let i = 0; i < 3; ++i){
        b.push(a[i] * c);
    }
    return b;

}

export let onlyUnique = (value, index, array) =>{
    return array.indexOf(value) === index;
}

export let copyVec = (v) =>{
    let nv = Array(0);
    for(let i =0 ; i < v.length; ++i){
        nv.push(v[i]);
    }
    return nv
}
export let distance = (a, b) =>{
    let d = 0;
    for(let i =0; i < a.length; ++ i){
        d += (a[i] - b[i])**2
    }
    return Math.sqrt(d);
}

export let pointInSquare = (p, poly) => {
    let dt = 1e-4;
    let min_x = Math.min(poly[0][0], poly[1][0], poly[2][0], poly[3][0]);
    let min_y = Math.min(poly[0][1], poly[1][1], poly[2][1], poly[3][1]);
    let min_z = Math.min(poly[0][2], poly[1][2], poly[2][2], poly[3][2]);

    let max_x = Math.max(poly[0][0], poly[1][0], poly[2][0], poly[3][0]);
    let max_y = Math.max(poly[0][1], poly[1][1], poly[2][1], poly[3][1]);
    let max_z = Math.max(poly[0][2], poly[1][2], poly[2][2], poly[3][2]);

    return p[0] >= min_x - dt && p[0] <= max_x + dt &&
        p[1] >= min_y - dt && p[1] <= max_y + dt &&
        p[2] >= min_z - dt && p[2] <= max_z + dt
}
