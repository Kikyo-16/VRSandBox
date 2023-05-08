import * as cg from "../render/core/cg.js";
import * as wu from "../sandbox/wei_utils.js"
import * as ut from "../sandbox/utils.js"
import {Object} from "../sandbox/objCollection.js"
import {CreateSandbox} from "../sandbox/sandbox.js"

let NAME_LIST = ["Mike"];

export function CreateVRSandbox(model){

    let mini_sandbox = new CreateSandbox(model);
    let room = new CreateSandbox(model);
    let effect = new CreateSandbox(model);
    let boxes = [mini_sandbox, room, effect];
    let wrapped_model = new Object();
    this.latest = -1;
    this._name = NAME_LIST[0] + "_" + Math.round(Math.random() * 10000).toString();

    this.mini_sandbox = mini_sandbox;
    this.room = room;
    this.effect = effect;

    wrapped_model.vallinaInit(model)
    this.is_diving = false;
    this.diving_time = -1;
    this.div_pos = -1;
    this.active_floor = -1;
    this.is_collapse = true;
    this.in_room = false;

    let sc = 80;

    this.numFloors = () =>{
        return mini_sandbox.boxes.length;
    }

    this.initialize = (p) =>{
        model.move(0, .8, -.4);
        this.addFloor(false);
        this.active_floor = 0;
        mini_sandbox.activeFloor(this.active_floor);
        room.activeFloor(this.active_floor);
        effect.activeFloor(this.active_floor);
        this.in_room = true;
        this.is_diving = false;
        this.leaveRoom();
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
        boxes[0].boxes[floor].split();
        boxes[1].boxes[floor].split();
        boxes[2].boxes[floor].split();
        deleteTmpFocus();


    }

    this.reviseFocus = (args) =>{
        let floor = this.active_floor;
        if(floor < 0)
            return;
        boxes[0].boxes[floor].reviseFocus(args);
        boxes[1].boxes[floor].reviseFocus(args);
        boxes[2].boxes[floor].reviseFocus(args);
        deleteTmpFocus();
    }
    let update = () =>{
        this.latest = (new Date()).getTime();
        return this.latest;
    }
    this.addFloor = (flag) =>{
        console.log("addFloor");
        if(flag)
            update();
        boxes[0].addFloor(flag);
        boxes[1].addFloor(flag);
        boxes[2].addFloor(flag);
    }
    this.removeFloor = () =>{
        if(this.numFloors()<= 1)
            return;
        update();
        boxes[0].removeFloor();
        boxes[1].removeFloor();
        boxes[2].removeFloor();
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
            this.div_mode = this.is_collapse ? "collapse" : "expand";
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
        if(mode === -2){
            return wrapped_model
        }
        return boxes[mode].boxes[floor].objCollection;
    }

    this.getRPosition = (mode, p) =>{
        return boxes[mode].getMPosition(p, this.active_floor);
    }

    this.getRobotPosition = (mode, p) =>{
        return boxes[mode].getRobotMPosition(p);
    }

    this.getGPosition = (mode, p) =>{
        return boxes[mode].getGPosition(p, this.active_floor);
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
        update();
        obj._rm = wu.objMatrix(obj.getGlobalMatrix(), boxes[mode].boxes[this.active_floor].obj_model);
        obj._name = (new Date()).getTime().toString() + "_" + Math.round(Math.random() * 10000).toString();
        obj._revised = true;
        this.addObj(obj, this.active_floor);
    }

    this.removeObj = (mode, idx) =>{
        let floor = this.active_floor;
        if(floor === -1 || mode <0 || idx < 0)
            return
        boxes[mode].removeObj(floor, idx);
        boxes[1 - mode].removeObj(floor, idx);
        boxes[2].removeObj(floor, idx);

    }

    this.refreshObjByIdx = (idx_lst, collection_mode) =>{
        let floor = this.active_floor;
        if(floor < 0 || idx_lst.length === 0)
            return
        let obj_state = Array(0);
        let latest = null;
        for(let i = 0; i < idx_lst.length; ++ i){
            let obj = boxes[collection_mode].getObj(floor, idx_lst[i]);
            if(latest === null){
                latest = update();
            }
            obj_state.push({
                _form: obj._form,
                _color: obj._color,
                _texture: obj._texture,
                _name: obj._name,
                _rm: obj.getMatrix(),
                _latest: latest,
                _revised: true,
            })
        }
        this.refreshObj(floor, obj_state);


    }



    this.refreshObj = (floor, obj_state) =>{
        let flag = false;
        for(let i =0; i< obj_state.length; ++ i){
            flag = flag || boxes[0].reviseObj(floor, obj_state[i]) === 2;
            boxes[1].reviseObj(floor, obj_state[i]);
            boxes[2].reviseObj(floor, obj_state[i]);
        }
        return flag;

    }

    this.changePerspective = (rp) => {
        // move to relative loc rp
        if (cg.norm(rp) <= 0.05) {
            return
        }

        room.walk(rp);
    }

    this.changeView = (vm) => {
        mini_sandbox.relocate_view(vm);
        room.relocate_view(vm);
    }

    this.resetView = () => {
        mini_sandbox.reset_view();
        room.reset_view();
    }

    this.divAnimation = (state) =>{
        if(!this.is_diving){
            return [false, state];
        }
        let diving_limit = 50;
        
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
    this.setScene = (args) =>{
        this.latest = args.latest;
        this.mini_sandbox.setScene(args);
        this.room.setScene(args);
        this.effect.setScene(args);
        if(this.active_floor >= this.mini_sandbox.boxes.length){
            this.active_floor = 0;
        }

        console.log("set scene")
        /*this.mini_sandbox.remove();
        this.room.remove();
        this.effect.remove();
        this.mini_sandbox.setScene(args);

        this.active_floor = 0;
        mini_sandbox.activeFloor(this.active_floor);
        room.activeFloor(this.active_floor);
        effect.activeFloor(this.active_floor);
        this.in_room = true;
        this.is_diving = false;
        this.leaveRoom();*/
    }

    this.hasFocus = () =>{
        let floor = this.active_floor;
        if(floor < 0)
            return false;
        return mini_sandbox.boxes[floor].focus_walls.length > 0;
    }

    this.getScene = () => {
        let scene = this.mini_sandbox.getScene();
        scene.latest = this.latest;
        scene._name = this._name;
        //console.log("---", this.latest);
        return scene;
    }

    this.setName = (n) =>{
        this._name = n + "_" + Math.round(Math.random() * 10000).toString();
    }




}