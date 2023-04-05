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
