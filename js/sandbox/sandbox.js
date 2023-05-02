import * as cg from "../render/core/cg.js";
import * as wu from "../sandbox/wei_utils.js"
import {CreateBox} from "../sandbox/box.js"

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

    this.latest = -1;


    this.getNodeMatrix = () =>{
        return node.getMatrix();
    }

    let update = () =>{
        this.latest = (new Date()).getTime();
    }

    this.addFloor = (flag) =>{
        if(flag)
            update();
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
        this.latest = (new Date).getTime();
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
        if(target === null)
            return 0;
        if(target._latest >= obj_state._latest){
            return 1;
        }
        if(!wu.isNull(target)){
            target.setMatrix(obj_state._rm);
            target.setColor(obj_state._color);
            target.setTexture(obj_state._texture);
            target._latest = (new Date).getTime();
            target._revised = obj_state._revised;
            return 2;
        }
        return 1;

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
            numFloors : this.boxes.length,
            collections : collections,
            latest: this.latest,
        }
    }
    this.setScene = (args) =>{
        let i = 0;
        this.latest = args.latest;
        while(this.boxes.length < args.numFloors) {
            this.addFloor();
            i += 1;
        }
        while(this.boxes.length > args.numFloors) {
            this.removeFloor();
            i -= 1;
        }


        for(let i = 0; i < args.numFloors; ++ i){
            for(let j = 0; j < args.collections[i].length; ++ j){
               let obj = args.collections[i][j];
               obj._revised = false;
               let res = this.reviseObj(i, obj);
               if(res === 0){
                    this.newObj(i, obj, obj._rm);
               }

            }


        }
    }

}
