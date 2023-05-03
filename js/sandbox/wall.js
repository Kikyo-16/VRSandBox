import * as cg from "../render/core/cg.js";
import * as wu from "../sandbox/wei_utils.js";

let distanceXZ = (p1, p2) =>{
    return Math.sqrt((p1[0] - p2[0])**2 + (p1[2] - p2[2])**2);
}

export function MakeWall(model, p1, p2, h, d, ddt, level){
    let op = .8;

    let wall = model.add("cube").opacity(op);
    let inner = wall.add();
    this.wall = wall;
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
    return bottom
}

export
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
        let interp = cg.add(rp1, wu.mulScaler(rn, t));
        if(wu.pointInSquare(interp, [[-1, 1, 0], [-1, -1, 0], [1, -1, 0], [1, 1, 0]])){
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


