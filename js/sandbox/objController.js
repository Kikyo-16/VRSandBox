import * as cg from "../render/core/cg.js";
import * as ut from '../sandbox/utils.js';
import {controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";

let insideObj = (obj, ctrM) => {
    //check if ctr is inside an obj
    //manipulate only valid clays
    // TO DO change to endpoint of ctr
    if (obj._form == undefined)
        return false;

    let objC = obj.getLoc();
    let scale = obj.getScale();
	let ctrC = ctrM.slice(12, 15);

	let hit = false;
	if (obj._form == 'cube') {
		hit = ctrC[0] >= objC[0] - scale && ctrC[0] <= objC[0] + scale &&
              ctrC[1] >= objC[1] - scale && ctrC[1] <= objC[1] + scale &&
              ctrC[2] >= objC[2] - scale && ctrC[2] <= objC[2] + scale;
	} else if (obj._form == 'sphere') {
		hit = cg.norm(cg.subtract(objC, ctrC)) < scale;
	} else if (obj._form == 'tubeX') {
		//TO DO
	}
    return hit;
}

export function CreateObjController(model){
	this.m = controllerMatrix;
    this.bs = buttonState;
    this.js = joyStickState;
    
    // for resize
    this.norm_prev = -1;
    this.norm_t = 0;
    this.triggerPressedPrev = false;

    let rotateSpeed = 3.14/400;
    let moveSpeed = .025;

    // press both trigger to resize, both ctr select the same obj, ctr does not have to be inside obj
	this.isResize = (t) => {
        let press = this.bs.right[0].pressed && this.bs.left[0].pressed;
        let state = !this.triggerPressedPrev && press ? 'press':
                    !press & this.triggerPressedPrev ? 'release' : press ? 'drag' : 'move';
        this.triggerPressedPrev = press;
        if (state === 'press') {
            this.norm_prev = cg.norm(cg.subtract(this.m.left.slice(12, 15), this.m.right.slice(12, 15)));
            this.norm_t = t;
        }
        if (state == 'release') { //reset
            this.norm_prev = -1;
            this.norm_t = 0;
        }
        return state === 'drag';
    }

    // press either trigger to grab an obj, ctr has to intersect with the obj
    this.isLeftGrab = () => this.bs.left[0].pressed; 
    this.isRightGrab = () => this.bs.right[0].pressed;
    // -1: not grab; 0: grab by left ctr; 1: grab by right ctr; 2: grab both
    this.isGrab = () => this.isLeftGrab() && this.isRightGrab() ? 2 : (this.isLeftGrab() ? 0 : (this.isRightGrab() ? 1 : -1)); 
    
    // press both thrumb buttons to delete
    this.isDelete = () => this.bs.left[1].pressed && this.bs.right[1].pressed;
    
    // left joystick to rotate the obj, can be removed 
    this.isRotate = () => this.js.left.x != 0 || this.js.left.y != 0;

    // right joystick to move the obj left/right/forward/backward
    this.isMove = () => this.js.right.x != 0 || this.js.right.y != 0;

    this.resize = (obj, t) => {
        if (this.norm_prev < 0 || t - this.norm_t < 0.15) {
            return;
        }
        let curNorm = cg.norm(cg.subtract(this.m.left.slice(12, 15), this.m.right.slice(12, 15)));
        let ratio = curNorm / this.norm_prev;
        if (ratio - 1 > 0.01 || ratio - 1 < -0.01){
            obj.updateScale(ratio);
            this.norm_prev = cg.norm(cg.subtract(this.m.left.slice(12, 15), this.m.right.slice(12, 15)));
            this.norm_t = t;
        }
        return;
    }

    this.hitObj = (obj) => {
        // -1: not hit; 0: hit by left controller; 1: hit by right controller; 2: hit by both
        let hitLeft = insideObj(obj, this.m.left);
        let hitRight = insideObj(obj, this.m.right);
        if (hitLeft && hitRight)
            return 2;
        if (hitRight)
            return 1;
        if (hitLeft)
            return 0;
        return -1;
    }

    this.moveObjWCtr = (obj, mode, t) => {
        // 0: left ctr grab, 1: right ctr grab
        let ml = this.m.left.slice(12, 15);
        let mr = this.m.right.slice(12, 15);
        let offset = [0, 0, -obj.getScale()/2];
        obj.updateLoc(cg.add(mode ? ml : mr, offset));
    }

    this.rotate = (obj, t) => {
        // up down to rotate along X, left right to rotate along Y
        let thetaX = this.js.left.y*rotateSpeed;
        let thetaY = this.js.left.x*rotateSpeed;
        obj.rotate(thetaX, thetaY);
    }

    this.move = (obj, t) => {
        //let mT = cg.mTranslate([this.js.right.x*moveSpeed, 0, this.js.right.y*moveSpeed]);
        //obj.transform(mT);
        obj.move(this.js.right.x*moveSpeed, 0, this.js.right.y*moveSpeed)
    }

    this.placeOnGround = (obj, t) => {
        let s = obj.getScale();
        let loc = obj.getLoc();
        obj.updateLoc([loc[0], s, loc[2]]);
    }

    this.delete = (obj) => {
        obj.delete();
    }

    this.animate = (obj, t) =>{
        //obj[0]: obj selected by the left controller (undefined for unselected)
        //obj[1]: obj selected by the right controller (undefined for unselected)
        
        // resize when obj[0] == obj[1]
        // grab/delete/rotate/place on ground obj selected by right trigger

        // left and right controller select the same obj
        if (obj[0] !== undefined && obj[1] !== undefined && obj[0].rid == obj[1].rid){
            //press both trigger to resize obj
    		if (this.isResize(t)) {
    			this.resize(obj[0], t);
            }
        } 

        
        let targetObj = obj[1];
        if (targetObj !== undefined) {
            let hit = this.hitObj(targetObj);
            let isGrab = this.isGrab();

            // press one left/right trigger to grab objects with ctr
            if (hit > -1 && isGrab > -1) {
                targetObj.setColor(this.isLeftGrab() ? [1,0,0] : [0,1,0]);
                this.moveObjWCtr(targetObj, this.isLeftGrab(), t);
            }

            // TODO: select an object if two different objects are passed in

            // use left joystick to rotate the object
            if (this.isRotate()) {
                this.rotate(targetObj, t);
            }

            // use right joystick to move the object
            if (this.isMove()) {
                this.move(targetObj, t);
            }

            // press 'A' to place the object on ground
            if (this.bs.right[4].pressed) {
                this.placeOnGround(targetObj, t);
            }

            // press both buttons to delect the targetObj
            if (hit == 2 && this.isDelete()) {
                targetObj.setColor([0,0,0]);
                this.delete(targetObj, t);
            }
        }      
    }    

}