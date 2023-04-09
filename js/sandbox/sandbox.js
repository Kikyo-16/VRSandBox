import * as cg from "../render/core/cg.js";
import * as ut from "../sandbox/utils.js"

let distanceXZ = (p1, p2) =>{
    return Math.sqrt((p1[0] - p2[0])**2 + (p1[2] - p2[2])**2);
}

function MakeWall(model, p1, p2, h, d, ddt, level){
    let op = .8;

    let wall = model.add("cube").opacity(op);
    this.wall = wall;
    this.level = level;
    this.focus_edge = null;
    this.color = [1, 1, 1];
    this.wall.color(this.color);
    this.focus_flag = false;
    p1[1] = h * 2;
    p2[1] = h * 2;
    this.p1 = p1;
    this.p2 = p2;

    let setPosition = (debug)=>{
        wall.setMatrix(cg.mIdentity());
        let m_sp1 = this.p1, m_sp2 = this.p2;
        let dis = distanceXZ(m_sp1, m_sp2);

        let mid_pos = cg.mix(m_sp1, m_sp2, .5, .5);
        mid_pos[1] = h;
        if(debug){
            model.add("sphere").move(m_sp1).scale(.05).color(1, 0, 1);
            model.add("sphere").move(m_sp2).scale(.05).color(1, 0, 1);
            model.add("sphere").move(dis).scale(.05).color(1, 0, 0);
        }
        let theta = Math.atan((m_sp1[2] - m_sp2[2])/(m_sp1[0] - m_sp2[0]) );
        wall.move(mid_pos).turnY(-theta).scale(dis/2 + ddt, h , d);
    }

    setPosition(false);

    this.isFocus = () => {
        return this.focus_flag;
    }
    this.focus = (edge) =>{
        this.wall.opacity(1);
        this.focus_edge = edge;
        this.wall.color(.5, 0, 0)
        this.focus_flag = true;
    }
    this.defocus = () =>{
        this.wall.opacity(op);
        this.focus_edge = null;
        this.wall.color(this.color);
        this.focus_flag = false;
    }
    this.hidden = () =>{
        this.wall.opacity(0.1);
    }
    this.disappear = () =>{
        this.wall.scale(0.00001, 1, 0.00001);
        this.wall.opacity(0.00001);
    }
    this.replace = (sp1, sp2) =>{
        this.p1 = sp1;
        this.p2 = sp2;

        setPosition(false);
    }
    this.active = () =>{
        this.wall.color(1, 0, 0);
        this.wall.opacity(.4);
    }

    this.getPoly = () =>{
        let p3 = ut.copyVec(p1), p4 = ut.copyVec(p2);
        p3[1] = 0;
        p4[1] = 0;
        return [p1, p3, p4, p2];
    }
}

let MakeBottom = (model, p1, p2, p3, d, edge) => {
    let bottom = model.add("cube");
    let m_p1 = p1;
    let m_p2 = p2;
    let m_p3 = p3;
    let mid_pos = cg.mix(m_p1, m_p3, .5)
    mid_pos[1] = 0;
    let dx = distanceXZ(m_p2, m_p3) / 2;
    let dz = distanceXZ(m_p1, m_p2) / 2;
    bottom.move(mid_pos).scale(dx + edge, d, dz + edge);
    return bottom
}





function WallCollection(model, level, h, d){
    this.walls = Array(0);
    let opacityCanSelect = .2;


    let isInWall = (w, p, n) =>{
        let poly = w.getPoly();
        let p0 = p;
        let nw = cg.cross(cg.subtract(poly[0], poly[1]), cg.subtract(poly[1], poly[2]));
        if (cg.dot(n, nw) === 0){
            return undefined;
        }

        let t = cg.dot(cg.subtract(p0, poly[0]), nw) / cg.dot(n, nw);
        //console.log(p, poly, t)
        if(t >=0){
            return undefined;
        }
        let intersect = cg.mix(p0, n, 1, -t);
        if(ut.pointInSquare(intersect, poly)){
            return [intersect, poly[2][1]];
        }
        return undefined;

    }


    let add = (w) =>{
        this.walls.push(w);
    }
    this.remove = (w) =>{
        let walls = Array(0);
        for(let i = 0 ; i < this.walls.length; ++ i){
            if (this.walls[i] !== w){
                walls.push(this.walls[i])
            }
        }
        this.walls = walls;
        model.remove(w.wall);
    }
    this.merge = (w1, w2) =>{
        let poly_1 = w1.getPoly();
        let poly_2 = w2.getPoly();
        let p = [poly_1[0], poly_1[3], poly_2[0], poly_2[3]];
        let dis = 233333., idx = [-1, -1];
        for(let i = 0; i < p.length; ++ i){
            for(let j = i + 1; j < p.length; ++ j){
                let t = cg.distance(p[i], p[j]);
                if(t < dis){
                    dis = t;
                    idx = [i, j];
                }
            }
        }
        let res = Array(0);
        for(let i = 0; i < p.length; ++ i){
            if(i !== idx[0] && i !== idx[1])
                res.push(p[i]);
        }

        this.createWall(res[0], res[1], 0);
        this.remove(w1);
        this.remove(w2);
    }
    this.createWall = (p1, p2, ddt) =>{
        let wall = new MakeWall(model, p1, p2, h, d, ddt, level);
        add(wall);
        return wall;
    }
    this.split = (w, p) =>{
        let poly = w.getPoly();
        this.createWall(poly[0], p, 0);
        this.createWall(p, poly[3], 0);
        this.remove(w);
    }
    this.select = (p, n) =>{
        let min_dis = -1, idx = -1, intp = -1;
        for(let i = 0; i < this.walls.length; ++ i){

            if(this.walls[i].wall._opacity <= opacityCanSelect) {
                continue;
            }
            let intersection = isInWall(this.walls[i], p, n);

            if(intersection !== undefined){
                let dis = cg.distance(p, intersection[0]);
                if(min_dis < 0 || min_dis > dis){
                    min_dis = dis;
                    idx = i;
                    intp = intersection;
                }
            }
        }
        if(idx > -1){
            return [this.walls[idx], intp];
        }
        return undefined;

    }
}

export function CreateBox(model, p1, p2, p3, p4, h, d, edge, level){
    let node_1 = model.add();
    let node_2 = node_1.move(0, (h*2 + .01)*level, 0).add();
    let box = node_2.add();
    let upper = box.add();
    let bottom = box.add();
    this.objCollection = Array(0);

    let wall_collection = new WallCollection(upper, level, h, d);
    wall_collection.createWall(p1, p2, d)
    wall_collection.createWall(p2, p3, d)
    wall_collection.createWall(p3, p4, d)
    wall_collection.createWall(p4, p1, d)
    MakeBottom(bottom, p1, p2, p3, d, edge);

    this.select = (p, n) =>{
        return wall_collection.select(p, n);
    }

    this.split = (w1, w2) =>{
        let edge_1 = w1.focus_edge, edge_2 = w2.focus_edge;
        let p1 = [edge_1[0], edge_1[1], edge_1[2]];
        let p2 = [edge_2[0], edge_1[1], edge_2[2]];
        wall_collection.split(w1, p1);
        wall_collection.split(w2, p2);
        wall_collection.createWall(p1, p2, 0);
    }
    this.merge = (w1, w2) =>{
        wall_collection.merge(w1, w2);
    }
    this.delete = (w) =>{
        wall_collection.remove(w);
    }
    this.remove = () =>{
        model.remove(node_1);
    }
    this.resetPos = () =>{
        node_2.setMatrix(cg.mIdentity());
    }
    this.move = (x, y, z) => {
        node_2.identity().move(x, y, z);
    }
    this.isInbox = (p) =>{
        let pos = ut.objMatrix(cg.mTranslate(p), box).slice(12, 15);
        //box.add("sphere").move(p1).scale(.1).color(1, 0, 0);
        //console.log("isinbox", p, pos, p1, p2, p3);
        //console.log("isinbox", pos[0], p1[0], p3[0]);
        //console.log("isinbox", pos[1], 0, h*2);
        //console.log("isinbox", pos[2], p1[2], p3[2]);
        return !(pos[0] < p1[0] || pos[0] > p3[0] ||
            pos[1] < 0 || pos[1] > h * 2 ||
            pos[2] < p1[2] || pos[2] > p3[2]);


    }
    this.active = () =>{
        console.log("here")
        bottom.color(255/255, 217/255, 102/255);
    }
    this.deactive = () =>{
        bottom.color(1, 1, 1);
    }

    this.addObj = (obj) => {
        box.add(obj);
        this.objCollection.push(obj);
    }
    this.removeObjOfIdx = (idx) =>{
        let obj = this.objCollection[idx];
        this.removeObj(obj);
    }
    this.removeObj = (obj) => {
        let hit = -1;
        let n_objCollection = Array(0);
        for(let i = 0; i < this.objCollection.length; ++ i){
            if(obj !== this.objCollection[i]){
                n_objCollection.push(this.objCollection[i]);
            }else{
                hit = i;
            }
        }
        if(hit > -1)
            box.remove(obj);
        this.objCollection = n_objCollection;
        return hit;
    }


}

export function CreateSandbox(model){
    let h = .1;
    let d = .01;
    let edge = .02;
    let box_model = model.add();
    this.boxes = Array(0);
    let p1 = [0, 0, 0];
    let p2 = [0, 0, 1];
    let p3 = [1, 0, 1];
    let p4 = [1, 0, 0];
    //this.boxes.push(new CreateBox(box_model, p1, p2, p3, p4, h, d, edge, 0));

    this.wall_to_split = undefined;
    this.focus_walls = Array(0);
    this.tmp_wall = new MakeWall(box_model, p1, p2, h, d, 0);
    this.tmp_wall.disappear();

    this.select = (p, n) =>{
        for(let i =0; i < this.boxes.length; i ++){
            let res = this.boxes[i].select(p, n);
            if(res !== undefined){
                return res;
            }
        }
        return undefined;
    }


    this.focus = (w, p, clean) => {
        if(clean || (this.focus_walls.length > 0 && this.focus_walls[0].level !== w.level)){
            this.clear(3);
        }
        if(w !== undefined && !w.isFocus()){

            w.focus(p);
            this.focus_walls.push(w);
        }
        this.clear(0);
    }
    this.splitingFocus = (w, p) => {
        if(w.isFocus())
            return;
        this.clear(0);
        w.focus(p);
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

    this.spliting = (p) => {
        let w = this.focus_walls[0];
        let poly = w.getPoly();
        let y = poly[0][1];
        let edge = w.focus_edge;
        let p1 = [edge[0], y, edge[2]];
        p[1] = y;
        this.tmp_wall.replace(p1, p);
        this.tmp_wall.active();
        return [p1, p]
    }

    this.split = () => {

        if(this.focus_walls.length !== 1 || this.wall_to_split === undefined){
            return false
        }
        let w1 = this.focus_walls[0];
        let w2 = this.wall_to_split;
        this.boxes[w1.level].split(w1, w2);
        this.clear(3);

    }

    this.merge = () => {
        if(this.focus_walls.length !== 2){
            return false
        }
        let w1 = this.focus_walls[0];
        let w2 = this.focus_walls[1];
        this.boxes[w1.level].merge(w1, w2);
        this.clear(3);
    }
    this.deleteFocus = () =>{
        for(let i = 0; i < this.focus_walls.length; ++ i){
            let w = this.focus_walls[i];
            this.delete(w);
        }
        this.focus_walls = Array(0);
    }
    this.delete = (w) =>{
        this.clear(3);
        this.boxes[w.level].delete(w);
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
        let new_boxes = Array(0);
        for(let i = 0; i < this.boxes.length - 1; ++i)
            new_boxes.push(this.boxes[i]);
        this.boxes = new_boxes;
        return true;
    }

    this.remove = () =>{
        while(this.boxes.length > 0){
            this.removeFloor();
        }
    }
    this.expand = () =>{
        let dx = 0;
        for(let i = 0; i < this.boxes.length; ++i){
            this.boxes[i].move(dx, 0, 0);
            dx += 1;
        }

    }
    this.gather = () =>{
        for(let i = 0; i < this.boxes.length; ++i)
            this.boxes[i].resetPos();
    }


    this.inWhichBox = (p) =>{
        for(let i = 0; i < this.boxes.length; ++ i){
            if(this.boxes[i].isInbox(p))
                return i
        }
        return undefined
    }

    this.getMPosition = (p) =>{
        return ut.objMatrix(cg.mTranslate(p), box_model).slice(12, 15);

    }
    this.getGPosition = (p) =>{
        return ut.objGlobalMatrix(cg.mTranslate(p), box_model).slice(12, 15);
    }
    this.scale = (s) =>{
        box_model.identity();
    }
    this.relocate = (p, s) =>{
        let neg_p = [-p[0], -p[1], -p[2]]
        box_model.identity().move(p).scale(s).move(neg_p);
    }

    this.activeFloor = (floor) =>{
        for(let i =0; i < this.boxes.length; ++ i){
            if(i === floor)
                this.boxes[i].active();
            else
                this.boxes[i].deactive();
        }
    }
    this.addFurniture = (obj, p) => {
        for(let i =0; i < this.boxes.length; ++ i) {
            if(this.addFurnitureToBox(obj, p, i))
                return i;
        }
        return -1;
    }
    this.addFurnitureToBox = (obj, p, idx) => {
        if(this.boxes[idx].isInbox(p)){
            this.boxes[idx].addObj(obj);
            return true;
        }
        return false;

    }
    this.removeFurniture = (obj) => {
        for(let i =0; i < this.boxes.length; ++ i) {
            let idx = this.removeFurnitureOfIdx(obj, i);
            if(idx > -1)
                return [i, idx];
        }
        return undefined;

    }
    this.removeFurnitureOfIdx = (obj, idx) => {
        return this.boxes[idx].removeObj(obj);

    }
    this.animation = (t) =>{

    }

}


export function CreateVRSandbox(model){
    let mini_sandbox = new CreateSandbox(model);
    let room = new CreateSandbox(model);
    let effect = new CreateSandbox(model);
    let boxes = [mini_sandbox, room, effect];
    this.is_diving = false;
    this.diving_time = -1;
    this.div_pos = -1;
    this.active_floor = -1;

    this.numFloors = () =>{
        return mini_sandbox.boxes.length;
    }




    this.select = (p, n, mode) =>{
        let rp = boxes[mode].getMPosition(p);
        let rn = boxes[mode].getMPosition(cg.add(p, n));
        rn = cg.subtract(rn, rp);
        let res_1 = boxes[mode].select(rp, rn);
        let res_2 = boxes[1 - mode].select(rp, rn);
        let res_3 = boxes[2].select(rp, rn);
        return [res_1, res_2, res_3];
    }
    this.focus = (res, clean, mode) => {
        let rp = res[mode][1][0];
        boxes[mode].focus(res[mode][0], rp, clean);
        boxes[1 - mode].focus(res[1 - mode][0], rp, clean);
        boxes[2].focus(res[2][0], rp, clean);
    }
    this.splitingFocus = (res, mode) => {
        let rp = res[mode][1][0];
        boxes[mode].splitingFocus(res[mode][0], rp);
        boxes[1 - mode].splitingFocus(res[1 - mode][0], rp);
        boxes[2].splitingFocus(res[2][0], rp);
    }
    this.clear = (mode) =>{
        boxes[0].clear(mode);
        boxes[1].clear(mode);
        boxes[2].clear(mode);
    }
    this.spliting = (p, mode) => {
        let rp = boxes[mode].getMPosition(p);
        boxes[mode].spliting(rp);
        boxes[1 - mode].spliting(rp);
    }
    this.split = () => {
        boxes[0].split();
        boxes[1].split();
        boxes[2].split();

    }
    this.merge = () => {
        boxes[0].merge();
        boxes[1].merge();
        boxes[2].merge();
    }
    this.deleteFocus = () =>{
        boxes[0].deleteFocus();
        boxes[1].deleteFocus();
        boxes[2].deleteFocus();
    }
    this.deleteFocus = () =>{
        boxes[0].deleteFocus();
        boxes[1].deleteFocus();
        boxes[2].deleteFocus();
    }
    this.addFloor = () =>{
        boxes[0].addFloor();
        boxes[1].addFloor();
        boxes[2].addFloor();
    }
    this.removeFloor = () =>{
        boxes[0].removeFloor();
        boxes[1].removeFloor();
        boxes[2].removeFloor();
        if(this.active_floor >= mini_sandbox.boxes.length){
            this.active_floor = -1;
        }
    }

    this.remove = () =>{
        boxes[0].remove();
        boxes[1].remove();
        boxes[2].remove();
    }
    this.expand = () =>{
        boxes[0].expand();
        boxes[1].expand();
        boxes[2].expand();

    }
    this.gather = () =>{
        boxes[0].gather();
        boxes[1].gather();
        boxes[2].gather();
    }
    this.div = (p) =>{

        let floor = mini_sandbox.inWhichBox(p);

        if(floor !== undefined){
            this.div_pos = mini_sandbox.getMPosition(p);
            this.is_diving = true;
            this.active_floor = floor;
            mini_sandbox.activeFloor(floor);
            room.activeFloor(floor);
            effect.activeFloor(floor);
        }

    }
    this.divAnimation = () =>{
        if(!this.is_diving){
            return;
        }
        let diving_limit = 50;
        let sc = 2;
        if(this.diving_time === -1){
            this.diving_time = 0;
        }else if(this.diving_time > diving_limit){
            room.relocate(this.div_pos, sc);
            this.is_diving = false;
            this.diving_time = -1;
            this.div_pos = -1;
            return;
        }
        //console.log(this.diving_time)
        let ratio = this.diving_time / diving_limit;
        effect.relocate(this.div_pos, ratio * (sc - 1) + 1);
        this.diving_time = this.diving_time + 1;
    }


    this.addFurnitureToBox = (obj) =>{
        let p = obj.getGlobalMatrix().slice(12, 15);
        let pos = ut.objMatrix(cg.mTranslate(p), mini_sandbox).slice(12, 15);
        let floor = mini_sandbox.addFurniture(obj, pos);
        if(floor !== undefined){
            room.addFurnitureToBox(obj, pos, floor);
            effect.addFurnitureToBox(obj, pos, floor);
            return true
        }
        return false;
    }
    this.addFurnitureToRoom = (obj) =>{
        let p = obj.getGlobalMatrix().slice(12, 15);
        let floor = this.active_floor;
        if(floor >=0){
            let pos = ut.objMatrix(cg.mTranslate(p), room).slice(12, 15);
            if(room.addFurnitureToBox(obj, pos, floor)){
                mini_sandbox.addFurnitureToBox(obj, pos, floor);
                effect.addFurnitureToBox(obj, pos, floor);
                return true
            }
        }
        return false;
    }
    this.removeFurnitureFromBox = (obj) =>{
        let res = mini_sandbox.removeFurniture(obj);
        if(res !== undefined) {
            mini_sandbox.removeFurnitureOfIdx(res);
            effect.removeFurnitureOfIdx(res);
            return true;
        }
        return false;
    }

    this.removeFurnitureFromRoom = (obj) =>{
        if(this.active_floor < 0)
            return false;
        let floor = this.active_floor;
        let idx = room[floor].removeObj(obj);
        if(idx === -1)
            return false;
        mini_sandbox[floor].removeObjOfIdx(idx);
        effect[floor].removeObjOfIdx(idx);
        return true
    }

    this.hitFurnitureInBox = (p, n) =>{
        //return mini_sandbox.hitFurniture(p, n);
    }
    this.hitFurnitureInRoom = (p) =>{
        //
    }
}