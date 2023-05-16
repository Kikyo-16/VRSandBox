import {MakeBottom, MakeWall, WallCollection} from "../sandbox/wallCollection.js";
import {FurnitureCollection} from "../sandbox/furnitureCollection.js";
import * as cg from "../render/core/cg.js";
import * as wu from "../sandbox/wei_utils.js"
import * as ut from "../sandbox/utils.js"

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
    let robot = box.add();
    let upper = box.add();
    let bottom = box.add();
    let obj_model = box.add();

    this.tmp_wall = new MakeWall(box, p1, p2, h, d, 0, "");
    this.tmp_wall.disappear();
    this.tmp_focus = undefined;
    this.wall_to_split = undefined;
    this.focus_walls = Array(0);
    this.obj_model = obj_model;


    this.robot = robot;



    if(level < COLORS.length){
        this.color = COLORS[level];
    }else{
        this.color = [255, 153, 153];
    }

    this.furniture_collection = new FurnitureCollection(obj_model);

    let wall_collection = new WallCollection(upper, level, h, d);
    wall_collection.createWall(p1, p2, d, "1")
    wall_collection.createWall(p2, p3, d, "2")
    wall_collection.createWall(p3, p4, d, "3")
    wall_collection.createWall(p4, p1, d, "4")
    wall_collection.formatName(level)
    MakeBottom(bottom, p1, p2, p3, d, edge);
    this.wall_collection = wall_collection;

    this.select = (p1, p2) =>{
        return wall_collection.select(p1, p2);
    }



    this.deleteWall = (w, time) =>{
        this.wall_collection.remove(w._name, time);
    }

    this.remove = () =>{
        if(this.furniture_collection.numCollection() === 0){
            model.remove(node_1);
            return true;
        }
        return false;

    }

    this.resetPos = (active_floor) =>{
        node_2.identity().move(active_floor, y, z);
    }
    this.shift = (x, y, z) => {
        node_2.identity().move(x, y, z);
    }
    this.isInbox = (p) =>{
        let pos = wu.objMatrix(cg.mTranslate(p), box).slice(12, 15);
        return !(pos[0] < p1[0] || pos[0] > p3[0] ||
            pos[1] < 0 || pos[1] > h * 2 ||
            pos[2] < p1[2] || pos[2] > p3[2]);
    }


    this.isRemovedObj = (obj) =>{
        return this.furniture_collection.isRemoved(obj);

    }
    this.newObj = (obj, m) =>{
        return this.furniture_collection.newObj(obj, m);
    }
    this.reviseObj = (obj, revised) =>{
        return this.furniture_collection.reviseObj(obj, revised);
    }
    this.copyObjByName = (name, time) =>{
        return this.furniture_collection.copyObjByName(name, time);
    }

    this.getObjByName = (name) => {
        return this.furniture_collection.getObjByName(name);
    }


    this.removeObjOfName = (idx, time) =>{
        return this.furniture_collection.removeObjOfName(idx, time);
    }

    this.getObjCollectionState = (time, revised) =>{
        return this.furniture_collection.getCollectionState(time, revised);
    }
    this.getWallCollectionState = (time, revised) =>{
        return this.wall_collection.getCollectionState(time, revised);
    }
    this.getRemovedObjTags = (time) =>{
        return this.furniture_collection.getRemovedTags();
    }
    this.getRemovedWallTags = (time) =>{
        return this.wall_collection.getRemovedTags();
    }

    this.setObjCollection = (collection, revised) =>{
        this.furniture_collection.setObjScene(collection, revised);
    }

    this.setWallCollection = (collection, revised) =>{
        this.wall_collection.setWallScene(collection, revised);
    }
    this.setNobjScene = (obj_tags, revised) =>{
        this.furniture_collection.setNobjScene(obj_tags, revised);

    }
    this.setNwallScene = (wall_tags, revised) =>{
        this.wall_collection.setNwallScene(wall_tags, revised);
    }
    this.removeWallCollection = (wall_tags) =>{

    }







    this.getRM = (p) =>{
        return wu.objMatrix(cg.mTranslate(p), box);
    }
    this.getMPosition = (p) =>{
        return wu.objMatrix(cg.mTranslate(p), box).slice(12, 15);
    }
    this.getGPosition = (p) =>{
        return wu.objGlobalMatrix(cg.mTranslate(p), box).slice(12, 15);
    }







    this.active = () =>{
        bottom.color(this.color);
        this.wall_collection.isOnActiveFloor(true);
    }
    this.deactive = () =>{
        bottom.color(1, 1, 1);
        this.wall_collection.isOnActiveFloor(false);
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
        if(mode >= 4){
            this.deleteTmpFocus();
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

    this.reviseFocus = (args, time) =>{
        let mode = args[0];
        args = args[1];
        for(let i = 0; i < this.focus_walls.length; ++ i){
            let w = this.focus_walls[i];
            if(mode === "delete"){
                this.deleteWall(w, time);
            }else if(mode === "revise"){
                //w.setTexture(args)
                w.setTexture(args._texture);
                w.setColor(args._color);
                w._revised = true;
                w._latest = time;

            }

        }

        this.clear(3);
    }

    this.split = (uid, time) => {
        if(this.focus_walls.length !== 1 || this.wall_to_split === undefined){
            return false
        }
        let w1 = this.focus_walls[0];
        let w2 = this.wall_to_split;
        let edge_1 = w1.focus_edge, edge_2 = w2.focus_edge;
        let p1 = [edge_1[0], edge_1[1], edge_1[2]];
        let p2 = [edge_2[0], edge_1[1], edge_2[2]];
        wall_collection.split(w1, p1, uid + "_1", time);
        wall_collection.split(w2, p2, uid + "_2", time);
        let w = wall_collection.createWall(p1, p2, 0, uid);
        w._revised = true;
        w._latest = time;
        this.clear(3);

    }

    this.deleteTmpFocus = () =>{
        if(!wu.isNull(this.tmp_focus) && this.tmp_focus.isFocus() === 3){
            this.tmp_focus.defocus();
            this.tmp_focus = undefined;
        }

    }



}
