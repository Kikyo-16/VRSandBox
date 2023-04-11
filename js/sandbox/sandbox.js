import * as cg from "../render/core/cg.js";
import * as ut from "../sandbox/wei_utils.js"
import {Object} from "../sandbox/objCollection.js"

let COLORS = [
    [255/255, 153/255, 204/255],
    [255/255, 217/255, 102/255],
    [153/255, 255/255, 153/255],
    [102/255, 178/255, 255/255],

]

let distanceXZ = (p1, p2) =>{
    return Math.sqrt((p1[0] - p2[0])**2 + (p1[2] - p2[2])**2);
}

function MakeWall(model, p1, p2, h, d, ddt, level){
    let op = .8;

    let wall = model.add("cube").opacity(op);
    let inner = wall.add();
    this.wall = wall;
    this.level = level;
    this.focus_edge = null;
    this.color = [1, 1, 1];
    this.texture = undefined;
    this.wall.color(this.color);
    this.focus_flag = 0;
    this.in_active_floor = false;
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
    this.focus = (edge, flag) =>{
        if(flag === 3)
            this.wall.opacity(.8);
        else
            this.wall.opacity(.95);
        this.focus_edge = edge;
        this.wall.color(236/255, 108/255, 108/255)
        this.focus_flag = flag;
    }
    this.defocus = () =>{
        this.focus_edge = null;
        this.wall.color(this.color);
        this.focus_flag = 0;
        this.isOnActiveFloor(this.in_active_floor);
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
    this.isOnActiveFloor = (flag) =>{
        if(flag){
            this.wall.opacity(1);
        }else{
            this.wall.opacity(op);
        }
        this.in_active_floor = flag;
    }

    this.getPoly = () =>{
        let p3 = ut.copyVec(p1), p4 = ut.copyVec(p2);
        p3[1] = 0;
        p4[1] = 0;
        return [p1, p3, p4, p2];
    }

    this.getMPosition = (p) =>{
        return ut.objMatrix(cg.mTranslate(p), inner).slice(12, 15);
    }
    this.getGPosition = (p) =>{
        return ut.objGlobalMatrix(cg.mTranslate(p), inner).slice(12, 15);
    }
    this.setColor = (c) =>{
        if(c !== undefined && c !== null){
            this.wall.color(c);
            this.color = c;
        }

    }

    this.setTexture = (v) =>{
        if(v !== undefined && v !== null){
            this.wall.texture(v);
            this.texture = v;
        }

    }
    this.getWallGPosition = (p) =>{
        return ut.objGlobalMatrix(cg.mTranslate(p), this.wall).slice(12, 15);
    }
    this.getWallMPosition = (p) =>{
        return ut.objMatrix(cg.mTranslate(p), this.wall).slice(12, 15);
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


    let isInWall = (w, p1, p2) =>{
        let rp1 = w.getMPosition(p1);
        let rp2 = w.getMPosition(p2);

        let rn = cg.subtract(rp2, rp1);
        if(Math.abs(rn[2]) <= 1e-5)
            return undefined
        let t = -rp1[2] / rn[2];
        if(t <=0)
            return undefined
        let interp = cg.add(rp1, ut.mulScaler(rn, t));
        if(ut.pointInSquare(interp, [[-1, 1, 0], [-1, -1, 0], [1, -1, 0], [1, 1, 0]])){
            return w.getGPosition(interp);
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
        let wall_1 = this.createWall(poly[0], p, 0);
        let wall_2 = this.createWall(p, poly[3], 0);
        wall_1.setTexture(w.texture);
        wall_2.setTexture(w.texture);
        wall_1.setColor(w.color);
        wall_2.setColor(w.color);

        this.remove(w);
    }
    this.select = (p1, p2) =>{
        let min_dis = -1, idx = -1, intp = -1;
        for(let i = 0; i < this.walls.length; ++ i){

            if(this.walls[i].wall._opacity <= opacityCanSelect) {
                continue;
            }
            let intersection = isInWall(this.walls[i], p1, p2);

            if(intersection !== undefined){
                let dis = cg.distance(p2, intersection);
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
    this.isOnActiveFloor = (flag) =>{
        for(let i =0; i < this.walls.length; ++ i){
            this.walls[i].isOnActiveFloor(flag);
        }

    }
}

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
    }
    this.resetPos = (active_floor) =>{
        node_2.identity().move(active_floor, y, z);
    }
    this.shift = (x, y, z) => {
        node_2.move(x, y, z);
    }
    this.isInbox = (p) =>{
        let pos = ut.objMatrix(cg.mTranslate(p), box).slice(12, 15);
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
        this.objCollection.push(n_obj);
        return n_obj;
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
        return ut.objMatrix(cg.mTranslate(p), box).slice(12, 15);
    }
    this.getGPosition = (p) =>{
        return ut.objGlobalMatrix(cg.mTranslate(p), box).slice(12, 15);
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


}

export function CreateSandbox(model){
    let h = .1;
    let d = .01;
    let edge = .02;
    let root = model.add();
    let node = root.add();
    let box_model = node.add();
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
        return ut.objMatrix(cg.mTranslate(p), node).slice(12, 15);
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

    this.reviseObj = (floor, idx, obj) =>{
        let target = this.getObj(floor, idx);
        target.setMatrix(obj.getMatrix());
        target.setColor(obj.getColor());
        target.setTexture(obj.getTexture());
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

    this.callSandbox = () =>{
        mini_sandbox.comeBack();
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
        if(floor === -1 || mode === -1)
            return Array(0);
        if(mode === -2){
            return wrapped_model
        }
        return boxes[mode].boxes[floor].objCollection;
    }

    this.addObj = (obj, mode) =>{
        let floor = this.active_floor;
        if(floor === -1 || mode < 0)
            return
        let m = obj.getGlobalMatrix();
        let rm = ut.objMatrix(m, boxes[mode].boxes[floor].obj_model);

        boxes[1 - mode].newObj(floor, obj, rm);
        boxes[2].newObj(floor, obj, rm);
        return boxes[mode].newObj(floor, obj, rm);
    }

    this.removeObj = (mode, idx) =>{
        let floor = this.active_floor;
        if(floor === -1 || mode <0 || idx < 0)
            return
        boxes[mode].removeObj(floor, idx);
        boxes[1 - mode].removeObj(floor, idx);
        boxes[2].removeObj(floor, idx);
        return this.getObjCollection(mode);

    }

    this.refreshObj = (mode, idx_lst) =>{
        let floor = this.active_floor;
        if(floor === -1 || mode < 0 || idx_lst.length === 0)
            return
        for(let i =0; i< idx_lst.length; ++ i){
            let obj = boxes[mode].getObj(floor, idx_lst[i]);
            boxes[1 - mode].reviseObj(floor, idx_lst[i], obj);
            boxes[2].reviseObj(floor, idx_lst[i], obj);
        }

    }


    this.divAnimation = () =>{
        if(!this.is_diving){
            return;
        }
        let diving_limit = 50;
        let sc = 20;
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
    this.animate = (t) =>{
        this.divAnimation();
    }


}