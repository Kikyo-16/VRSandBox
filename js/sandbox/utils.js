import * as cg from "../render/core/cg.js";



export let FLOOR_TIMER = "A"
export let OBJ_TIMER = "B"
export let N_OBJ_TIMER = "C"
export let WALL_TIMER = "D"
export let N_WALL_TIMER = "E"

export let LATEST_KEY = "F"
export let TAG_KEY = "G"
export let NUM_FLOORS_KEY = "H"
export let COLLECTION_KEY = "I"

export let SCENE_KEY = "J"
export let PLAYER_KEY = "K"

export let COLOR_KEY = "L"
export let TEXTURE_KEY = "M"
export let RM_KEY = "N"
export let FORM_KEY = "O"
export let P_KEY = "P"

export let WHO_KEY = "Q"
export let WHAT_KEY = "R"
export let WHOLE_KEY = "S"


export let PERSPECTIVE_SHARE_MSG = "perspective-share"
export let PERSPECTIVE_EXCHANGE_MSG = "perspective-exchange"


/*
* STATUS CODE
* */

export let BOX_VIEW_MSG = "box-view"
export let BOX_EDIT_MSG = "box-edit"
export let BOX_OBJ_MSG = "box-obj"
export let ROOM_WITH_BOX_MSG = "room-with-box"
export let ROOM_WITHOUT_BOX_MSG = "room-without-box"
export let ROOM_WALKING_MSG = "room-walking"
export let DIVING_MSG = "diving"


export let NON_ACTION_MSG = "non-action"
export let ADD_FLOOR_MSG = "add-floor"
export let REMOVE_FLOOR_MSG = "remove-floor"
export let EXPAND_FLOOR_MSG = "expand-floor"
export let COLLAPSE_FLOOR_MSG = "collapse-floor"
export let PICK_LOCATION_MSG = "pick-a-location"


export let SPLIT_WALL_MSG = "split-wall"
export let REVISE_WALL_MSG = "revise-wall"
export let DELETE_WALL_MSG = "delete-wall"
export let FOCUS_WALL_MSG = "focus-wall"
export let SPLITTING_FOCUS_WALL_MSG = "splitting-focus-wall"
export let SPLITTING_WALL_MSG = "splitting-wall"
export let MULTI_FOCUS_WALL_MSG = "multi-focus-wall"

/*
* Menu CODE
* */
export let MENU_DISABLED = 4;



export let WALKING_FORWARD = 1;
export let WALKING_BACKWARD = 2;





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
