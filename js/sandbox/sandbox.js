import * as cg from "../render/core/cg.js";
import * as wu from "../sandbox/wei_utils.js"
import {CreateBox} from "../sandbox/box.js"
import {CreateTimer} from "../sandbox/timer.js";
import * as ut from "../sandbox/utils.js";

export function CreateSandbox(model){
    let h = .05;
    let d = .01;
    let edge = .02;
    let root = model.add();
    let view_node = root.add();
    let node = view_node.add();
    let walk = node.add();
    let box_model = walk.add();
    let robot = box_model;
    this.robot = robot;
    this.boxes = Array(0);
    let p1 = [0, 0, 0];
    let p2 = [0, 0, 1];
    let p3 = [1, 0, 1];
    let p4 = [1, 0, 0];
    this.timer = new CreateTimer();
    this.timer.register([ut.WALL_TIMER, ut.OBJ_TIMER,
            ut.FLOOR_TIMER, ut.N_OBJ_TIMER, ut.N_WALL_TIMER]);

    let robot_model = box_model.add();
    this.robot_model = robot_model;

    this.getNodeMatrix = () =>{
        return node.getMatrix();
    }


    this.addFloor = (time) =>{
        this.timer.set(ut.FLOOR_TIMER, time);
        let new_level = this.boxes.length;
        let e = 0;
        if(new_level === 0){
            e = edge;
        }
        this.boxes.push(new CreateBox(box_model, p1, p2, p3, p4, h, d, e, new_level));
    }

    this.removeFloor = (time) =>{
        if(this.boxes.length === 0)
            return false;
        this.timer.set(ut.FLOOR_TIMER, time);
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

    this.getRM = (p, floor) =>{
        return this.boxes[floor].getRM(p);
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

    this.walk = (rp) =>{
        walk.move(rp);
    }

    this.clear_view = () => {
        view_node.identity();
        walk.identity();
    }

    this.relocate_view = (vm) => {
        view_node.identity();
        view_node.setMatrix(cg.mMultiply(view_node.getMatrix(), cg.mInverse(vm)));
    }

    this.reset_view = () => {
        view_node.identity();
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

    this.getObjByName  = (floor, name) =>{
        return this.boxes[floor].getObjByName(name);
    }

    this.reviseObj = (floor, obj_state) =>{

        let flag = this.boxes[floor].reviseObj(obj_state, true);
        if(flag)
            this.timer.set(ut.OBJ_TIMER, obj_state._latest);
        return flag;
    }

    this.newObj = (floor, obj, m) =>{
        this.timer.set(ut.OBJ_TIMER, obj._latest);
        return this.boxes[floor].newObj(obj, m);
    }
    this.removeObjOfName = (floor, name, time) =>{
        this.timer.set(ut.N_OBJ_TIMER, time);
        this.boxes[floor].removeObjOfName(name, time);
    }

    this.flyAway = () =>{
        this.clear_view();
        root.identity().move(0, -1000, 0);
    }

    this.comeBack = () =>{
        this.clear_view();
        root.identity();
    }

    this.getScene = (tag, time, revised) => {
        let flag = false;
        switch (tag) {
            case ut.FLOOR_TIMER:
                let floor_scene = new Map();
                floor_scene.set(ut.NUM_FLOORS_KEY, this.boxes.length);
                floor_scene.set(ut.LATEST_KEY, this.timer.get(ut.FLOOR_TIMER));
                return floor_scene
            case ut.OBJ_TIMER:
                let obj_collection = Array(0);
                for(let i = 0; i < this.boxes.length; ++ i) {
                    let obj = this.boxes[i].getObjCollectionState(time, revised);

                    obj_collection.push(obj);
                    if(obj.size > 0)
                        flag = true
                }
                if(flag){
                    return obj_collection
                }
                return null;

            case ut.N_OBJ_TIMER:
                let removed_obj_collection = Array(0);
                for(let i = 0; i < this.boxes.length; ++ i) {
                    removed_obj_collection.push(this.boxes[i].getRemovedObjTags(time));
                }
                return removed_obj_collection
            case ut.WALL_TIMER:
                let wall_collection = Array(0);
                for(let i = 0; i < this.boxes.length; ++ i) {
                    let wall = this.boxes[i].getWallCollectionState(time, revised);
                    wall_collection.push(wall);
                    if(wall.size > 0)
                        flag = true
                }
                if(flag){
                    return wall_collection;
                }
                return null;
            case ut.N_WALL_TIMER:
                let removed_wall_collection = Array(0);
                for(let i = 0; i < this.boxes.length; ++ i) {
                    removed_wall_collection.push(this.boxes[i].getRemovedWallTags(time));
                }
                return removed_wall_collection;
            default:
        }
        return null

    }
    this.setScene = (args, revised) =>{
        //console.log("updaaaaaaaaaate", args)
        for(let [tag, scene] of args) {
            if(scene === null || scene === undefined)
                continue;
            //console.log("????", scene);
            switch (tag) {
                case ut.FLOOR_TIMER:
                    let time = scene.get(ut.LATEST_KEY);
                    if (time <= this.timer.get(ut.FLOOR_TIMER))
                        break;
                    while (scene.get(ut.NUM_FLOORS_KEY) < this.boxes.length) {
                        this.removeFloor(time);
                        console.log("revmo")
                    }
                    while (scene.get(ut.NUM_FLOORS_KEY) > this.boxes.length) {
                        this.addFloor(time);
                        console.log("addFloor", ut.NUM_FLOORS_KEY, this.boxes.length)
                    }
                    this.timer.set(ut.FLOOR_TIMER, time);
                    break
                case ut.OBJ_TIMER:
                    for (let i = 0; i < this.boxes.length; ++i) {
                        this.boxes[i].setObjCollection(scene[i], revised);
                    }
                    break
                case ut.N_OBJ_TIMER:
                    for (let i = 0; i < this.boxes.length; ++i) {
                        this.boxes[i].setNobjScene(scene[i], revised);
                    }
                    break
                case ut.WALL_TIMER:
                    for (let i = 0; i < this.boxes.length; ++i) {
                        this.boxes[i].setWallCollection(scene[i], revised);
                    }
                    return scene
                case ut.N_WALL_TIMER:
                    for (let i = 0; i < this.boxes.length; ++i) {
                        this.boxes[i].setNwallScene(scene[i], revised);
                    }
                    break
                default:
            }
        }

    }

}