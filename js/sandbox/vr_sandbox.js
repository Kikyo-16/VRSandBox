import * as cg from "../render/core/cg.js";
import * as wu from "../sandbox/wei_utils.js"
import * as ut from "../sandbox/utils.js"
import {CreateTimer} from "../sandbox/timer.js"
import {CreateSandbox} from "../sandbox/sandbox.js"

let NAME_LIST = ["Mike"];

export function CreateVRSandbox(model){

    let mini_sandbox = new CreateSandbox(model);
    let room = new CreateSandbox(model);
    let effect = new CreateSandbox(model);
    let boxes = [mini_sandbox, room, effect];
    //let wrapped_model = new Object();
    //wrapped_model.vallinaInit(model)
    this.timer = new CreateTimer();


    this._name = NAME_LIST[0] + "_" + Math.round(Math.random() * 10000).toString();

    this.mini_sandbox = mini_sandbox;
    this.room = room;
    this.effect = effect;


    this.is_diving = false;
    this.diving_time = -1;
    this.div_pos = -1;
    this.active_floor = -1;
    this.is_collapse = true;
    this.in_room = false;

    this.numFloors = () =>{
        return mini_sandbox.boxes.length;
    }

    this.initialize = (p) =>{
        this.timer.register([ut.WALL_TIMER, ut.OBJ_TIMER,
            ut.FLOOR_TIMER, ut.N_OBJ_TIMER, ut.N_WALL_TIMER]);
        model.move(0, .8, -.4);
        this.addFloor(false);
        console.log("init", this.mini_sandbox.boxes.length)
        this.active_floor = 0;
        mini_sandbox.activeFloor(this.active_floor);
        room.activeFloor(this.active_floor);
        effect.activeFloor(this.active_floor);
        this.in_room = true;
        this.is_diving = false;
        this.leaveRoom();
        this.timer.reset();



    }

    let deleteTmpFocus = () =>{
        let floor = this.active_floor;
        if(floor < 0)
            return;
        boxes[0].boxes[floor].deleteTmpFocus();
        boxes[1].boxes[floor].deleteTmpFocus();
        boxes[2].boxes[floor].deleteTmpFocus();
    }


    this.select = (p1, p2, mode) =>{
        let floor = this.active_floor;
        if(floor < 0)
            return;
        let rp1 = boxes[mode].getMPosition(p1, floor);
        let rp2 = boxes[mode].getMPosition(p2, floor);
        let res_1 = boxes[mode].select(floor, rp1, rp2);
        let res_2 = boxes[1 - mode].select(floor, rp1, rp2);
        let res_3 = boxes[2].select(floor, rp1, rp2);
        let res = [res_1, res_2, res_3];
        if(res[0] === undefined || res[1]  === undefined)
            res[0] = res[1] = res[2] = undefined;
        return res;
    }

    this.focus = (res, clean, mode, tmp) => {
        let floor = this.active_floor;
        if(floor === -1)
            return
        if(res[mode] !== undefined){
            boxes[0].boxes[floor].focus(res[0][0], res[0][1], clean, tmp);
            boxes[1].boxes[floor].focus(res[1][0], res[1][1], clean, tmp);
            boxes[2].boxes[floor].focus(res[2][0], res[2][1], clean, tmp);
        }else{
            deleteTmpFocus();
        }
    }

    this.splitingFocus = (res, mode) => {
        let floor = this.active_floor;
        if(floor === -1)
            return
        let rp = res[mode][1];
        boxes[mode].boxes[floor].splitingFocus(res[mode][0], rp);
        boxes[1 - mode].boxes[floor].splitingFocus(res[1 - mode][0], rp);
        boxes[2].boxes[floor].splitingFocus(res[2][0], rp);
        boxes[mode].boxes[floor].spliting(rp);
        boxes[1 - mode].boxes[floor].spliting(rp);
        boxes[2].boxes[floor].spliting(rp);
    }
    this.clear = (mode) =>{
        let floor = this.active_floor;
        if(floor === -1)
            return
        boxes[0].boxes[floor].clear(mode);
        boxes[1].boxes[floor].clear(mode);
        boxes[2].boxes[floor].clear(mode);
    }
    this.spliting = (p, mode) => {
        let floor = this.active_floor;
        if(floor < 0)
            return;
        let rp = boxes[mode].getMPosition(p, floor);
        boxes[mode].boxes[floor].spliting(rp);
        boxes[1 - mode].boxes[floor].spliting(rp);
        boxes[2].boxes[floor].spliting(rp);
    }
    this.split = () => {

        let floor = this.active_floor;
        if(floor < 0)
            return;
        let uid = wu.newUniqueId();
        let time = this.timer.newTime();
        boxes[0].boxes[floor].split(uid, time);
        boxes[1].boxes[floor].split(uid, time);
        boxes[2].boxes[floor].split(uid, time);
        deleteTmpFocus();


    }

    this.reviseFocus = (args) =>{
        let floor = this.active_floor;
        if(floor < 0)
            return;
        let time = this.timer.newTime();
        boxes[0].boxes[floor].reviseFocus(args, time);
        boxes[1].boxes[floor].reviseFocus(args, time);
        boxes[2].boxes[floor].reviseFocus(args, time);

        deleteTmpFocus();
    }

    this.addFloor = (flag) =>{
        console.log("addFloor");
        let time;
        if(flag){
            time = this.timer.newTime();
        }
        else{
            time = -1;
        }
        boxes[0].addFloor(time);
        boxes[1].addFloor(time);
        boxes[2].addFloor(time);
    }
    this.removeFloor = () =>{
        if(this.numFloors()<= 1)
            return;
        let time = this.timer.newTime();
        boxes[0].removeFloor(time);
        boxes[1].removeFloor(time);
        boxes[2].removeFloor(time);
        if(this.active_floor >= mini_sandbox.boxes.length){
            this.active_floor = -1;
            room.reset(mini_sandbox);
            effect.reset(mini_sandbox);
        }
    }

    this.remove = () =>{
        boxes[0].remove();
        boxes[1].remove();
        boxes[2].remove();
    }
    this.expand = () =>{
        if(this.is_collapse){
            let floor = this.active_floor;
            boxes[0].expand(floor);
            boxes[1].expand(floor);
            boxes[2].expand(floor);
            this.is_collapse = false;
        }


    }
    this.collapse = () =>{
        if(!this.is_collapse){
            let floor = this.active_floor;
            boxes[0].collapse(floor);
            boxes[1].collapse(floor);
            boxes[2].collapse(floor);
            this.is_collapse = true;
        }
    }

    this.div = (p) =>{

        let floor = mini_sandbox.inWhichBox(p);

        if(!this.is_diving && floor !== undefined){
            this.is_diving = true;
            this.div_pos = mini_sandbox.getNodeMatrix(p);
            effect.comeBack();
            mini_sandbox.flyAway();
            room.flyAway();
            this.active_floor = floor;
            mini_sandbox.activeFloor(floor);
            mini_sandbox.activeFloor(floor);
            room.activeFloor(floor);
            effect.activeFloor(floor);
        }

    }

    this.getObjCollection = (mode) =>{
        let floor = this.active_floor;
        if(floor === -1 || mode < 0)
            return Array(0);
        return boxes[mode].boxes[floor].furniture_collection.getObjCollection();
    }


    this.getRPosition = (mode, p) =>{
        return boxes[mode].getMPosition(p, this.active_floor);
    }
    this.getRM = (mode, p) =>{
        return boxes[mode].getRM(p, this.active_floor);
    }
    this.addObj = (obj, floor) =>{
        boxes[0].newObj(floor, obj, obj._rm);
        boxes[1].newObj(floor, obj, obj._rm);
        boxes[2].newObj(floor, obj, obj._rm);
    }
    this.addNewObj = (mode, obj) =>{
        if(this.active_floor < 0)
            return
        let time = this.timer.newTime();
        obj._rm = wu.objMatrix(obj.getGlobalMatrix(), boxes[mode].boxes[this.active_floor].obj_model);
        obj._name = wu.newUniqueId();
        obj._revised = true;
        obj._latest = time;
        this.addObj(obj, this.active_floor);
    }

    this.removeObjOfName = (name, collection_mode) =>{
        let floor = this.active_floor;
        if(floor === -1 || collection_mode <0 || name === -1)
            return
        let time = this.timer.newTime();
        boxes[0].removeObjOfName(floor, name, time);
        boxes[1].removeObjOfName(floor, name, time);
        boxes[2].removeObjOfName(floor, name, time);

    }


    this.refreshObj = (objs) =>{
        let flag = false;
        let floor = this.active_floor;
        let time = this.timer.newTime();

        for(let i =0; i< objs.length; ++ i){
            let obj_state = {
                _name: objs[i]._name,
                _rm: objs[i].getMatrix(),
                _texture: objs[i].getTexture(),
                _color: objs[i].getColor(),
                _latest: time,
                _revised: true,
            }
            flag = flag || boxes[0].reviseObj(floor, obj_state) === 2;
            boxes[1].reviseObj(floor, obj_state);
            boxes[2].reviseObj(floor, obj_state);
        }
        return flag;

    }

    this.divAnimation = (state) =>{
        if(!this.is_diving){
            return [false, state];
        }
        let diving_limit = 50;
        let sc = 80;
        if(this.diving_time === -1){
            this.diving_time = 0;
        }else if(this.diving_time > diving_limit){
            room.comeBack();
            room.relocate(this.div_pos, this.active_floor, sc);
            effect.flyAway();
            this.is_diving = false;
            this.in_room = true;
            this.diving_time = -1;
            this.div_pos = -1;
            state.MODE["MODE"] = ut.ROOM_WITHOUT_BOX_MSG;
            return [false, state];
        }
        //console.log(this.diving_time)
        let ratio = this.diving_time / diving_limit;
        effect.relocate(this.div_pos, this.active_floor, ratio * (sc - 1) + 1);
        this.diving_time = this.diving_time + 1;
        return [false, state];
    }

    this.leaveRoom = () =>{
        if(!this.in_room || this.is_diving)
            return;
        this.in_room = false;
        mini_sandbox.comeBack();
        room.flyAway();
        effect.flyAway();
    }
    this.move = (pos) =>{
        let rp = cg.add(room.getWalkPosition(), pos);
        rp = room.getWalkMPosition(rp);
        mini_sandbox.walkAway(rp);
        room.walkAway(rp);
        effect.walkAway(rp);
    }
    this.animate = (t, state) =>{
        return this.divAnimation(state)
    }


    this.hasFocus = () =>{
        let floor = this.active_floor;
        if(floor < 0)
            return false;
        return mini_sandbox.boxes[floor].focus_walls.length > 0;
    }

    this.getScene = () => {
        let tags = [ut.FLOOR_TIMER, ut.N_OBJ_TIMER, ut.OBJ_TIMER, ut.N_WALL_TIMER, ut.WALL_TIMER];
        let scene = new Map();
        for(let i = 0; i < tags.length; ++ i){
            let time = this.timer.get(tags[i]);
            let v = this.mini_sandbox.getScene(tags[i], time);
            scene.set(tags[i], v);
        }
        return scene;

    }

    this.setScene = (args) =>{
        console.log("set Scene")
        this.mini_sandbox.setScene(args);
        this.room.setScene(args);
        this.effect.setScene(args);
        if(this.active_floor >= this.mini_sandbox.boxes.length){
            this.active_floor = 0;
        }
    }

    this.setName = (n) =>{
        this._name = n + "_" + Math.round(Math.random() * 10000).toString();
    }

}


let checkCollection = (collection_1, collection_2) =>{
    if(collection_2 === null)
        return collection_1;
    if(collection_1 === null)
        return null

    let collection_3 = Array(0);
    let flag = false;
    for(let i = 0; i < collection_1.length; ++ i){
        if(i < collection_2.length){
            let collc = new Map();
            for(const [name, v1] of collection_1[i]){
                if(!collection_2[i].has(name)){
                    collc.set(name, v1);
                    flag = true;
                    continue
                }
                let v2 = collection_2[i].get(name);
                if(v2 === undefined || v1.get(ut.LATEST_KEY) > v2.get(ut.LATEST_KEY)){
                    collc.set(name, v1);
                    flag = true;
                }
            }
            collection_3.push(collc)
        }else{
            collection_3.push(collection_1[i]);
            if(collection_1[i].size > 0){
                flag = true;
            }
        }
    }
    if(flag)
        return collection_3;
    return null;
}


export let diffData = (x1, x2) =>{

    let x3 = new Map();

    let scene_1 = x1.get(ut.FLOOR_TIMER);
    let scene_2 = x2.get(ut.FLOOR_TIMER);
    if(scene_1.get(ut.NUM_FLOORS_KEY) !== scene_2.get(ut.NUM_FLOORS_KEY)){
        x3.set(ut.FLOOR_TIMER, scene_1);
    }


    let tags = [ut.OBJ_TIMER, ut.N_OBJ_TIMER,
            ut.WALL_TIMER, ut.N_WALL_TIMER];
    for(let i = 0; i < tags.length; ++ i){
        scene_1 = x1.get(tags[i]);
        scene_2 = x2.get(tags[i]);
        let scene = checkCollection(scene_1, scene_2);
        if(scene !== null)
            x3.set(tags[i], scene);
    }

    if(x3.size === 0)
        x3 = null;
    return x3;


}