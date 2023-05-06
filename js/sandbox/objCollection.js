import * as cg from "../render/core/cg.js";
import * as ut from '../sandbox/utils.js';

export class Object{
    constructor() {
        this.name = 'obj';
        this._form = null;
        this.lock = false;
        this.dead = false;
        this.parent = null;
        this.obj_node = null;
        this.time = null;
        this.rid = null;

    }

    init(model, form, loc, scale, time){
    	this._form = form;
        this._name = Math.round(Math.random() * 10000).toString();
    	this.parent = model;
        this.obj_node = this.parent.add(form);
        this.time = time;
        this.rid = time.toString() + "_" + Math.round(Math.random() * 10000).toString();
        this.scale = 1;
        this.updateScale(scale);
        this.loc = loc; 
        this.updateLoc(loc);
        this._color = this.obj_node._color;
        this._texture = this.obj_node._texture;
        this._latest = -1;
    }

    vallinaInit(obj){
        this.parent = obj._parent;
        this.obj_node = obj;
        this._form = obj._form;
    }

    getGlobalMatrix() {
    	return this.obj_node !== null ? this.obj_node.getGlobalMatrix() : undefined;
    }

    getMatrix() {
    	return this.obj_node !== null ? this.obj_node.getMatrix() : undefined;
    }

    setName(n){
        this._name = n;
    }
    getName() {
    	return this._name;
    }

    setMatrix(m) {
     	if (this.obj_node !== null)
     		this.obj_node.setMatrix(m);
     }

    getLoc(){ // return global location
    	return this.obj_node !== null ? this.obj_node.getGlobalMatrix().slice(12, 15) : [0,0,0];
    }

    updateScale(scale){
    	if (this.obj_node !== null) {
    		this.obj_node.scale(scale);
    	}
    }

    updateLoc(loc){ //move to global location loc
    	if (this.obj_node !== null) {
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

    getForm(){
        return this._form;

    }

    setColor(c) {
    	if (this.obj_node !== null && c !== null && c !== undefined) {
    		this.obj_node.color(c);
            this._color = c;
    	}
    }

    setTexture(v) {
    	if (this.obj_node !== null && v !== null && v !== undefined) {
    		this.obj_node.texture(v);
            this._texture = v;
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

    copy() {
        if (this.obj_node !== null) {
            let obj = new Object();
            obj._form = this.obj_node._form;
            obj.parent = this.parent;
            obj.obj_node = obj.parent.add(obj._form);
            let t = new Date();
            obj.time = t.getTime();
            obj.rid = obj.time.toString() + "_" + Math.round(Math.random() * 10000).toString();
            obj.obj_node.setMatrix(this.getMatrix());
            obj.obj_node.move(.25,.25,0);
            obj.setTexture(this.getTexture());
            obj.setColor(this.getColor());
            return obj;
        }
    }

    inside(p) {
        if (this.obj_node === null || this._form === null)
            return false;

        let mGA = this.obj_node.getGlobalMatrix();
        let m = cg.mTransform(cg.mInverse(mGA), p);
        let inside = false;
        if (this._form === 'cube') {
            inside = m[0] > - 1 && m[0] < 1 &&
                     m[1] > - 1 && m[1] < 1 &&
                     m[2] > - 1 && m[2] < 1;
        } else if (this._form === 'sphere') {
            inside = cg.norm(m) < 1;
        } else if (this._form === 'donut') {
            inside = Math.abs(m[2]) < .25 && cg.norm([m[0], m[1]]) < 1;
        }
        return inside;
    }

    delete() {
    	if (this.obj_node !== null) {
    		this.parent.remove(this.obj_node);
    	}
    	this.dead = true;
    }
}