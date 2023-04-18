import * as cg from "../render/core/cg.js";
import * as wu from "../sandbox/wei_utils.js"
import * as ut from "../sandbox/utils.js"
import {Object} from "../sandbox/objCollection.js"
import {MakeBottom, MakeWall, WallCollection} from "../sandbox/wall.js";

let COLORS = [
    [255/255, 153/255, 204/255],
    [255/255, 217/255, 102/255],
    [153/255, 255/255, 153/255],
    [102/255, 178/255, 255/255],

]


export function CreateBox(model, p1, p2, p3, p4, h, d, edge, level){
    let node_1 = model.add().move(0, (h*2 + .01)*level, 0);
    let node_2 = node_1.add();
    let box = node_2.add();
    let upper = box.add();
    let bottom = box.add();
    let obj_model = box.add();
    this.tmp_wall = new MakeWall(box, p1, p2, h, d, 0);
    this.tmp_wall.disappear();
    this.tmp_focus = undefined;
    this.wall_to_split = undefined;
    this.focus_walls = Array(0);
    this.obj_model = obj_model;


    this.objCollection = Array(0);
    if(level < COLORS.length){
        this.color = COLORS[level];
    }else{
        this.color = [255, 153, 153];
    }


    let wall_collection = new WallCollection(upper, level, h, d);
    wall_collection.createWall(p1, p2, d)
    wall_collection.createWall(p2, p3, d)
    wall_collection.createWall(p3, p4, d)
    wall_collection.createWall(p4, p1, d)
    MakeBottom(bottom, p1, p2, p3, d, edge);

    this.select = (p1, p2) =>{
        return wall_collection.select(p1, p2);
    }


    this.merge = (w1, w2) =>{
        wall_collection.merge(w1, w2);
    }
    this.delete = (w) =>{
        wall_collection.remove(w);
    }
    this.remove = () =>{
        model.remove(node_1);
        this.objCollection = Array(0);
    }
    this.resetPos = (active_floor) =>{
        node_2.identity().move(active_floor, y, z);
    }
    this.shift = (x, y, z) => {
        node_2.move(x, y, z);
    }
    this.isInbox = (p) =>{
        let pos = wu.objMatrix(cg.mTranslate(p), box).slice(12, 15);
        return !(pos[0] < p1[0] || pos[0] > p3[0] ||
            pos[1] < 0 || pos[1] > h * 2 ||
            pos[2] < p1[2] || pos[2] > p3[2]);
    }
    this.active = () =>{
        bottom.color(this.color);
        wall_collection.isOnActiveFloor(true);
    }
    this.deactive = () =>{
        bottom.color(1, 1, 1);
        wall_collection.isOnActiveFloor(false);
    }

    this.newObj = (obj, m) => {
        let n_obj = new Object();
        n_obj.init(obj_model, obj._form, [0, 0, 0], 1, 0);
        n_obj.setColor(obj._color);
        n_obj.setTexture(obj._texture);
        n_obj.setMatrix(m);
        n_obj.setName(obj._name);
        this.objCollection.push(n_obj);
        return n_obj;
    }
    this.getObjByName = (name) => {
        for(let i = 0; i < this.objCollection.length; ++ i){
            if(this.objCollection[i]._name === name){
                return this.objCollection[i];
            }
        }
        return null;
    }
    this.removeObjOfIdx = (idx) =>{
        let n_objCollection = Array(0);
        for(let i = 0; i < this.objCollection.length; ++ i){
            if(i !== idx){
                n_objCollection.push(this.objCollection[i]);
            }else{

                this.objCollection[idx].delete();
            }
        }
        this.objCollection = n_objCollection;
    }

    this.getMPosition = (p) =>{
        return wu.objMatrix(cg.mTranslate(p), box).slice(12, 15);
    }
    this.getGPosition = (p) =>{
        return wu.objGlobalMatrix(cg.mTranslate(p), box).slice(12, 15);
    }

    this.focus = (w, p, clean, tmp) => {

        if(clean){
            this.clear(3);
        }else{
            // multitple selection : reselect, then defocus
            if(!tmp && w.isFocus() === 1 ){
                this.removeFocus(w);
                return;
            }
        }
        if(w.isFocus() === 1 || w.isFocus() === 2)
            return;
        if(tmp){
            if(this.tmp_focus !== undefined && this.tmp_focus.isFocus() === 3)
                this.tmp_focus.defocus();
            this.tmp_focus = w;
            w.focus(p, 3);

        }else{

            w.focus(p, 1);
            this.focus_walls.push(w);
        }
    }
    this.removeFocus = (w) =>{
        let n_focus_walls = Array(0)
        for(let i = 0; i < this.focus_walls.length; ++i){
            if(this.focus_walls[i] === w){
                w.defocus();
            }else{
                n_focus_walls.push(w);
            }
        }
        this.focus_walls = n_focus_walls;
    }

    this.splitingFocus = (w, p) => {
        if(w.isFocus() === 1)
            return;
        this.clear(0);
        w.focus(p, 2);
        this.wall_to_split = w;
    }
    this.clear = (mode) =>{
        if(mode === 0 || mode >= 3) {
            if (this.wall_to_split !== undefined) {
                this.wall_to_split.defocus();
                this.wall_to_split = undefined;
            }
        }
        if(mode === 1 || mode >= 3){
            for(let i = 0; i < this.focus_walls.length; ++i){
                this.focus_walls[i].defocus()
            }
            this.focus_walls = Array(0);
        }
        if(mode >= 2){
            this.tmp_wall.disappear();
        }
    }

    this.spliting = (rp) => {
        let w = this.focus_walls[0];
        let poly = w.getPoly();
        let y = poly[0][1];

        let edge = w.focus_edge;
        let p1 = [edge[0], y, edge[2]];

        this.tmp_wall.replace(p1, rp);
        this.tmp_wall.active();

    }



    this.reviseFocus = (args) =>{
        let mode = args[0];
        args = args[1];
        for(let i = 0; i < this.focus_walls.length; ++ i){
            let w = this.focus_walls[i];
            if(mode === "delete"){
                this.delete(w);
            }else if(mode === "color"){
                //w.setColor(args)
            }else if(mode === "texture"){
                //w.setTexture(args)
                w.setTexture(args._texture);
                w.setColor(args._color);
            }

        }

        this.clear(3);
    }

    this.split = () => {
        if(this.focus_walls.length !== 1 || this.wall_to_split === undefined){
            return false
        }
        let w1 = this.focus_walls[0];
        let w2 = this.wall_to_split;
        let edge_1 = w1.focus_edge, edge_2 = w2.focus_edge;
        let p1 = [edge_1[0], edge_1[1], edge_1[2]];
        let p2 = [edge_2[0], edge_1[1], edge_2[2]];
        wall_collection.split(w1, p1);
        wall_collection.split(w2, p2);
        wall_collection.createWall(p1, p2, 0);
        this.clear(3);

    }

    this.deleteTmpFocus = () =>{
        if(this.tmp_focus !== undefined && this.tmp_focus.isFocus() === 3){
            this.tmp_focus.defocus();
            this.tmp_focus = undefined;
        }
    }
    this.getCollectionState = () =>{
        let collections = Array(0);
        for(let i = 0; i < this.objCollection; ++ i){
            collections.push({
                _color: this.objCollection[i].getColor(),
                _texture: this.objCollection[i].getTexture(),
                _rm: this.objCollection[i].getMatrix(),
                _name: this.objCollection[i].getName(),
            })
        }
        return collections
    }

}

export function CreateSandbox(model){
    let h = .05;
    let d = .01;
    let edge = .02;
    let root = model.add();
    let node = root.add();
    let robot = root.add();
    let walk = node.add();
    let box_model = walk.add();
    this.boxes = Array(0);
    let p1 = [0, 0, 0];
    let p2 = [0, 0, 1];
    let p3 = [1, 0, 1];
    let p4 = [1, 0, 0];


    this.getNodeMatrix = () =>{
        return node.getMatrix();
    }


    this.addFloor = () =>{
        let new_level = this.boxes.length;
        let e = 0;
        if(new_level === 0){
            e = edge;
        }
        this.boxes.push(new CreateBox(box_model, p1, p2, p3, p4, h, d, e, new_level));
    }

    this.removeFloor = () =>{
        if(this.boxes.length === 0)
            return false;
        this.boxes[this.boxes.length - 1].remove();
        this.boxes.pop();
        return true;
    }

    this.remove = () =>{
        while(this.boxes.length > 0){
            this.removeFloor();
        }
    }
    this.expand = (active_floor) =>{
        let dx = 0;
        if(active_floor >= 0){
            dx = - active_floor;
        }
        for(let i = 0; i < this.boxes.length; ++i){
            this.boxes[i].shift(dx, 0, 0);
            dx += 1;
        }


    }

    this.collapse = (active_floor) =>{
        let dx = 0;
        if(active_floor >= 0){
            dx = active_floor;
        }
        for(let i = 0; i < this.boxes.length; ++i){
            this.boxes[i].shift(dx, 0, 0);
            dx -= 1;
        }

    }

    this.select = (floor, rp1, rp2) =>{
        let p1 = this.getGPosition(rp1, floor);
        let p2 = this.getGPosition(rp2, floor);
        let res = this.boxes[floor].select(p1, p2);
        if(res !== undefined){
            return [res[0], this.getMPosition(res[1], floor)];
        }
        return res
    }

    this.inWhichBox = (p) =>{
        for(let i = 0; i < this.boxes.length; ++ i){
            if(this.boxes[i].isInbox(p))
                return i
        }
        return undefined
    }

    this.getMPosition = (p, floor) =>{
        return this.boxes[floor].getMPosition(p);

    }
    this.getGPosition = (p, floor) =>{
        return this.boxes[floor].getGPosition(p);
    }

    this.getNodeMatrix = (p) =>{
        return wu.objMatrix(cg.mTranslate(p), node).slice(12, 15);
    }
    this.getWalkMPosition = (p) =>{
        return wu.objMatrix(cg.mTranslate(p), walk).slice(12, 15);
    }

    this.getRobotMPosition = (p) =>{
        return wu.objMatrix(cg.mTranslate(p), robot).slice(12, 15);
    }

    this.getWalkPosition = (p) =>{
        return walk.getGlobalMatrix().slice(12, 15);
    }
    this.walkAway = (rp) =>{
        walk.identity().move(rp);
    }

    this.relocate = (p, floor, s) =>{
        let height = (h*2 + .01) * floor + 1.5 / 4 * 2 * h;
        let neg_p = [-p[0], -height, -p[2]];
        let pos_p = [p[0], height, p[2]];
        node.identity().move(pos_p).scale(s).move(neg_p);
    }
    this.reset = (m) =>{
        node.setMatrix(m.getNodeMatrix());
    }


    this.activeFloor = (floor) =>{
        for(let i =0; i < this.boxes.length; ++ i){
            if(i === floor)
                this.boxes[i].active();
            else
                this.boxes[i].deactive();
        }
    }

    this.getObj = (floor, idx) =>{
        return this.boxes[floor].objCollection[idx];
    }

    this.getObjByName  = (floor, name) =>{
        return this.boxes[floor].getObjByName(name);
    }

    this.reviseObj = (floor, obj_state) =>{
        let target = this.getObjByName(floor, obj_state._name);
        if(!wu.isNull(target)){
            target.setMatrix(obj_state._rm);
            target.setColor(obj_state._color);
            target.setTexture(obj_state._texture);
        }

    }

    this.newObj = (floor, obj, m) =>{
        return this.boxes[floor].newObj(obj, m);
    }
    this.removeObj = (floor, idx) =>{
        this.boxes[floor].removeObjOfIdx(idx);
    }

    this.flyAway = () =>{
        root.identity().move(0, -1000, 0);
    }
    this.comeBack = () =>{
        root.identity();
    }

    this.animation = (t) =>{

    }

    this.getScene = () => {
        let collections = Array(0);
        for(let i = 0; i < this.boxes.length; ++ i){
            collections.push(this.boxes[i].getCollectionState());
        }
        return {
            num_floors : this.boxes.length,
            collections : collections
        }
    }
    this.setScene = (args) =>{
        for(let i = 0; i < args.numFloors; ++ i){
            this.addFloor();
            for(let j = 0; j < args.collections[i].length; ++ j){
                this.newObj(i, args.collections[i][j], args.collections[i][j]._rm);
            }

        }

    }

}


export function CreateVRSandbox(model){

    let mini_sandbox = new CreateSandbox(model);
    let room = new CreateSandbox(model);
    let effect = new CreateSandbox(model);
    let boxes = [mini_sandbox, room, effect];
    let wrapped_model = new Object();

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

    this.numFloors = () =>{
        return mini_sandbox.boxes.length;
    }

    this.initialize = (p) =>{
        model.move(0, .8, -.4);
        this.addFloor();
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

    this.addFloor = () =>{
        boxes[0].addFloor();
        boxes[1].addFloor();
        boxes[2].addFloor();
    }
    this.removeFloor = () =>{
        if(this.numFloors()<= 1)
            return;
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

    this.getRPosition = (mode, m) =>{
        return wu.objMatrix(m, boxes[mode].boxes[this.active_floor].obj_model);
    }
    this.addObj = (obj, floor) =>{

        boxes[0].newObj(floor, obj, obj._rm);
        boxes[1].newObj(floor, obj, obj._rm);
        return boxes[2].newObj(floor, obj, obj._rm);
    }

    this.removeObj = (mode, idx) =>{
        let floor = this.active_floor;
        if(floor === -1 || mode <0 || idx < 0)
            return
        boxes[mode].removeObj(floor, idx);
        boxes[1 - mode].removeObj(floor, idx);
        boxes[2].removeObj(floor, idx);

    }

    this.wrapOP = (msg) => {
        if(wu.isNull(msg))
            return null;

        let code = msg.code;
        let args = msg.args;
        switch(code) {
            case ut.ADD_FLOOR_MSG:

                break;
            case ut.REMOVE_FLOOR_MSG:

                break;
            case ut.ADD_OBJ_MSG:
                args.floor = this.active_floor
                if(args.floor <0){
                    code = ut.NON_ACTION_MSG;
                }
                break;
            case ut.REMOVE_OBJ_MSG:
                if(args[1] === -1){
                    code = ut.NON_ACTION_MSG;
                }

                break;
            case ut.REVISE_OBJ_MSG:
                if(args[1] === -1 || args[1].length === 0 || this.active_floor === -1){
                    code = ut.NON_ACTION_MSG;
                }else{
                    let floor = this.active_floor;
                    let collection_mode = args[0];
                    let idx_lst = args[1].filter(wu.onlyUnique);
                    let obj_state = Array(0);
                    for(let i = 0; i < idx_lst.length; ++ i){
                        let obj = boxes[collection_mode].getObj(floor, idx_lst[i]);
                        obj_state.push({
                            _form: obj._form,
                            _color: obj._color,
                            _texture: obj._texture,
                            _name: obj._name,
                            _rm: obj.getMatrix(),
                        })
                    }
                    args = {
                        //idx_lst : idx_lst,
                        floor : this.active_floor,
                        obj_state: obj_state,
                    }
                }

                break;
            case ut.SPLIT_WALL_MSG:

                break;
            case ut.REVISE_WALL_MSG:

                break;
            case ut.REQURE_SCENE_MSG:

                break;
            case ut.SET_SCENE_MSG:

                break;
            case ut.NON_ACTION_MSG:

                break;
            default:
                let bug = "you got a bug here";
                console.log(bug);
        }

        if(code === ut.NON_ACTION_MSG)
            return null;
        console.log("send", code, args);
        return {
            code: code,
            args: args,

        }
    }

    this.executeOP = (msg) =>{
        if(wu.isNull(msg))
            return

        console.log("execute", msg);


        let code = msg.code;
        let args = msg.args;
        let send_msg = null;


        switch(code) {
            case ut.ADD_FLOOR_MSG:
                this.addFloor();
                break;
            case ut.REMOVE_FLOOR_MSG:
                this.removeFloor();
                break;
            case ut.ADD_OBJ_MSG:

                this.addObj(args, args.floor);
                break;
            case ut.REMOVE_OBJ_MSG:
                break;
            case ut.REVISE_OBJ_MSG:
                this.refreshObj(args.floor, args.obj_state)
                break;
            case ut.SPLIT_WALL_MSG:

                break;
            case ut.REVISE_WALL_MSG:
                break;

            case ut.REQURE_SCENE_MSG:
                send_msg = {
                    code: ut.SET_SCENE_MSG,
                    args : this.mini_sandbox.getScene(),
                    user_id : msg.user_id,
                    view_id : msg.view_id,
                }
                break;
            case ut.SET_SCENE_MSG:
                this.setScene(args);
                break;
            default:
                let bug = "you got a bug here";
                console.log(bug);
        }


        return send_msg;

    }

    this.refreshObj = (floor, obj_state) =>{

        for(let i =0; i< obj_state.length; ++ i){
            boxes[0].reviseObj(floor, obj_state[i]);
            boxes[1].reviseObj(floor, obj_state[i]);
            boxes[2].reviseObj(floor, obj_state[i]);
        }

    }


    this.divAnimation = () =>{
        if(!this.is_diving){
            return;
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
            return;
        }
        //console.log(this.diving_time)
        let ratio = this.diving_time / diving_limit;
        effect.relocate(this.div_pos, this.active_floor, ratio * (sc - 1) + 1);
        this.diving_time = this.diving_time + 1;
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
    this.animate = (t) =>{
        this.divAnimation();
    }
    this.setScene = (args) =>{
        this.mini_sandbox.remove();
        this.room.remove();
        this.effect.remove();
        this.mini_sandbox.setScene(args);
        this.room.setScene(args);
        this.effect.setScene(args);
    }




}