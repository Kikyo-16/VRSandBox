import * as cg from "../render/core/cg.js";
import * as ut from '../sandbox/utils.js';

export class Object{
    constructor() {
        this.name = null;
        this._form = null;
        this.lock = false;
        this.dead = false;
        this.scale = 1;
        this.loc = [0, 0, 0]; //global location
    }

    init(model, form, loc, scale, time){
    	this._form = form;
    	console.log("init??????")
    	this.model = model;
        this.obj_node = model.add(form);
        this.time = time;
        this.rid = time.toString() + "_" + Math.round(Math.random() * 10000).toString();

        this.updateScale(scale);
        this.loc = loc; 
        this.updateLoc(loc);
    }

    vallinaInit(obj){
        this.model = obj._parent;
        this.obj_node = obj;
        this._form = obj._form;
    }
    getGlobalMatrix() {
    	return this.obj_node !== null ? this.obj_node.getGlobalMatrix() : undefined;
    }

    getMatrix() {
    	return this.obj_node !== null ? this.obj_node.getMatrix() : undefined;
    }

    setMatrix(m) {
     	if (this.obj_node !== null)
     		this.obj_node.setMatrix(m);
     }

    getLoc(){ // return global location
    	return this.obj_node !== null ? this.obj_node.getGlobalMatrix().slice(12, 15) : [0,0,0];
    }

    getScale(){
    	return this.scale;
    }

    updateScale(scale){
    	if (this.obj_node !== null) {
    		this.scale *= scale;
    		this.obj_node.scale(scale);
    	}
    }

    updateLoc(loc){ //move to global location loc
    	if (this.obj_node !== null) {
    		this.loc = loc;
	    	let mTr = cg.mTranslate(cg.subtract(loc, this.getLoc()));
	    	this.obj_node.setMatrix(ut.transform(mTr, this.obj_node));
	    }
    }

    rotate(thetaX, thetaY) {
    	if (this.obj_node !== null) {
    		this.obj_node.turnX(thetaX).turnY(thetaY);
    	}
    }

    move(x, y, z) {
    	if (this.obj_node !== null) {
    		this.obj_node.move(x, y, z);
    	}
    }

    setColor(c) {

    	if (this.obj_node !== null && c !== null && c !== undefined) {
    		this.obj_node.color(c);
    	}
    }
    setTexture(v) {
    	if (this.obj_node !== null && v !== null && v !== undefined) {
    		this.obj_node.texture(v);
    	}
    }
    getColor() {

    	if (this.obj_node !== null) {
    		return this.obj_node._color;
    	}
    }
    getTexture() {
    	if (this.obj_node !== null) {
    		return this.obj_node._texture;
    	}
    }

    transform(m) {
    	if (this.obj_node !== null) {
    		this.obj_node.setMatrix(ut.transform(m, this.obj_node));
    	}
    }

    delete() {
    	if (this.obj_node !== null) {
    		this.model.remove(this.obj_node);
    	}
    	this.dead = true;
    }

    animate(time){

    }
}

// export function ObjectCollection{

// }