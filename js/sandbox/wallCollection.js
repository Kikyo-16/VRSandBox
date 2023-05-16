import * as cg from "../render/core/cg.js";
import * as wu from "../sandbox/wei_utils.js";
import * as ut from "../sandbox/utils.js";

let distanceXZ = (p1, p2) =>{
    return Math.sqrt((p1[0] - p2[0])**2 + (p1[2] - p2[2])**2);
}

export function MakeWall(model, p1, p2, h, d, ddt, uid){
    let op = .95;

    let wall = model.add("cube").opacity(op);
    let inner = wall.add();
    this.wall = wall;
    this.focus_edge = null;
    this._color = [1, 1, 1];
    this._texture = undefined;
    this.wall.color(this._color);
    this.focus_flag = 0;
    this.in_active_floor = false;
    this._name = uid;
    this._revised = false;
    this._latest = -1;



    p1[1] = h * 2;
    p2[1] = h * 2;
    this.p1 = p1;
    this.p2 = p2;

    this.getRM = () =>{
        return wall.getMatrix();
    }

    this.reviseName = (n) =>{
        this._name = n;
    }
    this.reviseStatus = (r) =>{
        this._revised = r;
    }

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


    this.update = () =>{
        this._latest = (new Date).getTime();
    }
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
        this.wall.color(this._color);
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
        let p3 = wu.copyVec(p1), p4 = wu.copyVec(p2);
        p3[1] = 0;
        p4[1] = 0;
        return [p1, p3, p4, p2];
    }

    this.getMPosition = (p) =>{
        return wu.objMatrix(cg.mTranslate(p), inner).slice(12, 15);
    }
    this.getGPosition = (p) =>{
        return wu.objGlobalMatrix(cg.mTranslate(p), inner).slice(12, 15);
    }
    this.setColor = (c) =>{
        if(c !== undefined && c !== null){
            this.wall.color(c);
            this._color = c;
        }

    }

    this.setTexture = (v) =>{
        if(v !== undefined && v !== null){
            this.wall.texture(v);
            this._texture = v;
        }

    }
    this.delete = () =>{
        this.wall.remove(inner);
        model.remove(this.wall);
    }

    this.getWallGPosition = (p) =>{
        return wu.objGlobalMatrix(cg.mTranslate(p), this.wall).slice(12, 15);
    }
    this.getWallMPosition = (p) =>{
        return wu.objMatrix(cg.mTranslate(p), this.wall).slice(12, 15);
    }
}

export  let MakeBottom = (model, p1, p2, p3, d, edge) => {
    let bottom = model.add("cube");
    let m_p1 = p1;
    let m_p2 = p2;
    let m_p3 = p3;
    let mid_pos = cg.mix(m_p1, m_p3, .5)
    mid_pos[1] = 0;
    let dx = distanceXZ(m_p2, m_p3) / 2;
    let dz = distanceXZ(m_p1, m_p2) / 2;
    bottom.move(mid_pos).scale(dx + edge, d, dz + edge);
    bottom.texture("../media/textures/sandbox/concrete.png")
    return bottom
}

export function WallCollection(model, level, h, d){
    this.walls = new Map();
    this.removedTags = new Map();
    let opacityCanSelect = .2;
    this.focus_walls = Array(0);

    let isInWall = (w, p1, p2) =>{
        let rp1 = w.getMPosition(p1);
        let rp2 = w.getMPosition(p2);

        let rn = cg.subtract(rp2, rp1);
        if(Math.abs(rn[2]) <= 1e-5)
            return undefined
        let t = -rp1[2] / rn[2];
        if(t <=0)
            return undefined
        let interp = cg.add(rp1, wu.mulScaler(rn, t));
        if(wu.pointInSquare(interp, [[-1, 1, 0], [-1, -1, 0], [1, -1, 0], [1, 1, 0]])){
            return w.getGPosition(interp);
        }

        return undefined;

    }

    this.formatName = (level) =>{
        for(let i = 0; i < this.walls.length; ++ i){
            this.walls[i].reviseName("base" + i.toString() + "_" + level.toString());
            this.walls[i].reviseStatus(false);
        }
    }
    this.remove = (name, time) =>{
        if(this.walls.has(name)){
            let target = this.walls.get(name);
            target.delete();
            this.walls.delete(name);
        }
        let v = new Map();
        v.set(ut.LATEST_KEY, time);
        this.removedTags.set(name, v);
    }

    this.isRemoved = (name) =>{
        if(this.removedTags.has(name))
            return true
        if(this.removedTags.size > 60){

        }
        return false;
    }

    this.createWall = (p1, p2, ddt, uid) =>{
        let wall = new MakeWall(model, p1, p2, h, d, ddt, uid);
        this.walls.set(uid, wall);
        return wall;
    }
    this.reviseWall = (w, revised) =>{
        if(this.walls.has(w._name)){
            let target = this.walls.get(w._name);
            if(w._latest > target._latest){
                target.setColor(w._color);
                target.setTexture(w._texture);
                target._latest = w._latest;
                target._revised = w._revised;
                return 2;
            }
            return 1;

        }
        return 0
    }
    this.split = (w, p, name, time) =>{
        let poly = w.getPoly();
        let wall_1 = this.createWall(poly[0], p, 0, name + "_1");
        let wall_2 = this.createWall(p, poly[3], 0, name + "_2");
        this.remove(w._name, time);
        wall_1.setTexture(w.texture);
        wall_2.setTexture(w.texture);
        wall_1.setColor(w._color);
        wall_2.setColor(w._color);
        wall_1._revised = true;
        wall_2._revised = true;
        wall_1._latest = time;
        wall_2._latest = time;

    }
    this.select = (p1, p2) =>{
        let min_dis = -1, idx = -1, intp = -1, target = null;
        for(let [name, wall] of this.walls){

            if(wall.wall._opacity <= opacityCanSelect) {
                continue;
            }
            let intersection = isInWall(wall, p1, p2);

            if(intersection !== undefined){
                let dis = cg.distance(p2, intersection);
                if(min_dis < 0 || min_dis > dis){
                    min_dis = dis;
                    intp = intersection;
                    target = wall;
                }
            }
        }
        if(target !== null){
            return [target, intp];
        }
        return undefined;

    }
    this.isOnActiveFloor = (flag) =>{
        for(let i =0; i < this.walls.length; ++ i){
            this.walls[i].isOnActiveFloor(flag);
        }

    }
    this.getRemovedTags = () =>{
        let collections = new Map();
        for(const [name, obj] of this.removedTags) {
            collections.set(name, obj);
        }
        return collections;
    }

    this.getCollectionState = (time, revised) =>{
        let collections = new Map();
        for(let [name, w] of this.walls){
            if(w._revised || !revised){
                let v = new Map();
                v.set(ut.COLOR_KEY, w._color);
                v.set(ut.TEXTURE_KEY, w._texture);
                v.set(ut.P_KEY, [w.p1, w.p2]);
                v.set(ut.LATEST_KEY, w._latest);
                collections.set(w._name, v);
            }
        }
        return collections
    }

    this.setWallScene = (collection, revised) => {
        for(let [name, w_map] of collection){
            if(this.isRemoved(name))
                continue;
            let w = {
                _color: w_map.get(ut.COLOR_KEY),
                _texture: w_map.get(ut.TEXTURE_KEY),
                _latest: w_map.get(ut.LATEST_KEY),
                _p: w_map.get(ut.P_KEY),
                _name: name
            };
            w._revised = false;
            let res = this.reviseWall(w, revised);
            if(res === 0){
                this.createWall(w._p[0], w._p[1], d, name);
            }

        }

    }
    this.setNwallScene = (collection) =>{
        if(wu.isNull(collection))
            return;
        for(let [name, obj_map] of collection) {
            this.remove(name, obj_map.get(ut.LATEST_KEY));
        }
    }

}


