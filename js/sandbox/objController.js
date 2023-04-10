/*
object controller to select/move/resize/rotate/delete object
- resize: point both beams to the target obj and press both trigger and move your hands to resize
- move with ctr: point the beam to an object, press the trigger and move your hand;
- move along ctr beam: point the beam to an object, press the trigger, use right joystick to move along the beam
- rotate: point the beam to an object, press the trigger, use right joystick to rotate;
- place on ground: point the beam to an object, press the trigger, press A to place the obj on the floor;
- delete: point both beams to an object, press both side buttons to delete;
*/

import * as cg from "../render/core/cg.js";
import * as ut from '../sandbox/utils.js';
import {controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";
import {lcb, rcb} from '../handle_scenes.js';

function insideObj(obj, p) {
    // check if a point is inside an obj
    // manipulate only valid clays
    if (obj === undefined || obj._form === null) // TODO ? undefined ? null ?
        return false;
    
    let c = obj.getLoc();
    let scale = obj.getScale();
    
    let inside = false;
    if (obj._form === 'cube') {
        inside = p[0] >= c[0] - scale && p[0] <= c[0] + scale &&
                 p[1] >= c[1] - scale && p[1] <= c[1] + scale &&
                 p[2] >= c[2] - scale && p[2] <= c[2] + scale;
    } else if (obj._form === 'sphere') {
        inside = cg.norm(cg.subtract(c, p)) <= scale;
    } else if (obj._form === 'tubeX') {
        //TO DO
    }
    return inside;
}

function beamHitObj(obj, ctr, cb) {
    let center = obj.getLoc();
    let point = cb.projectOntoBeam(center);
    let dist = cg.norm(cg.subtract(ctr, point));
    return [insideObj(obj, point), dist, point];
}

export function CreateObjController(obj_model){
    this.active = true;

	this.m = controllerMatrix;
    this.bs = buttonState;
    this.js = joyStickState;
    
    // for resize
    let resize_lock = false;
    let resize_obj = null;
    let resize_obj_idx = -1;
    let norm_prev = -1;
    let norm_t = 0;
    let triggerPressedPrev = false;

    //
    let rotate_speed = 3.14/400;
    let move_speed = .025;

    //
    let trackChanges = null;

    // press both trigger to resize, both ctr select the same obj, ctr does not have to be inside obj
	this.isResize = (t, obj, idx) => {
        let press = this.bs.right[0].pressed && this.bs.left[0].pressed;
        let state = !triggerPressedPrev && press ? 'press':
                    !press & triggerPressedPrev ? 'release' : press ? 'drag' : 'move';
        triggerPressedPrev = press;
        if (state === 'press') {
            resize_lock = true;
            resize_obj = obj;
            resize_obj_idx = idx;
            resize_obj.setColor([1,1,0]); //for testing
            norm_prev = cg.norm(cg.subtract(this.m.left.slice(12, 15), this.m.right.slice(12, 15)));
            norm_t = t;
        }
        if (state === 'release') { //reset
            norm_prev = -1;
            norm_t = 0;
            resize_lock = false;
            resize_obj_idx = -1;
            resize_obj = null;
            resize_obj.setColor([0,1,1]); //for testing
        }
        return state === 'drag' || state === 'press';
    }

    // press either trigger to grab an obj, ctr has to intersect with the obj
    this.isLeftTriggerPressed = () => this.bs.left[0].pressed; 
    this.isRightTriggerPressed = () => this.bs.right[0].pressed;
    
    // press both thrumb buttons to delete
    this.isDelete = () => this.bs.left[1].pressed && this.bs.right[1].pressed;
    
    this.resizeObj = (t) => {
        if (norm_prev < 0 || resize_obj === null || t - norm_t < 0.15) {
            return;
        }
        let curNorm = cg.norm(cg.subtract(this.m.left.slice(12, 15), this.m.right.slice(12, 15)));
        let ratio = curNorm / norm_prev;
        if (ratio - 1 > 0.01 || ratio - 1 < -0.01){
            resize_obj.updateScale(ratio);
            norm_prev = cg.norm(cg.subtract(this.m.left.slice(12, 15), this.m.right.slice(12, 15)));
            norm_t = t;
        }
        return;
    }

    this.moveObj = (obj, p) => {
        // 0: left ctr grab, 1: right ctr grab
        obj.updateLoc(p);
    }

    this.moveObjAlongBeam = (obj, hand) => {
        let direction = cg.normalize(hand === 0 ? lcb.beamMatrix().slice(8,11) : rcb.beamMatrix().slice(8,11));
        this.moveObj(obj, cg.add(obj.getLoc(), cg.scale(direction, this.js.right.y*move_speed)));
    }

    this.rotateObj = (obj) => {
        // up down to rotate along X, left right to rotate along Y
        let thetaX = this.js.left.y*rotate_speed;
        let thetaY = this.js.left.x*rotate_speed;
        obj.rotate(thetaX, thetaY);
    }

    this.placeOnGround = (obj) => {
        let s = obj.getScale();
        let loc = obj.getLoc();
        obj.updateLoc([loc[0], s, loc[2]]);
    }

    this.deleteObj = (obj) => {
        obj.delete();
    }

    this.setMode = (mode) => {
        this.active = mode === 2;
    }

    // this.walk = () => {
    //     obj_model.move(-this.js.right.x*move_speed, -0, -this.js.right.y*move_speed);
    // }

    // this.moveObjWCtr = (obj, mode, p) => {
    //     // 0: left ctr grab, 1: right ctr grab
    //     let ml = this.m.left.slice(12, 15);
    //     let mr = this.m.right.slice(12, 15);
    //     let offset = [0, 0, -obj.getScale()/2];
    //     obj.updateLoc(cg.add(mode ? ml : mr, offset));
    // }

    // this.select = (obj, hand) => {
    //     // hand: 0 for left, 1 for right
    //     if (hand === 0 && this.bs.left[0].pressed) {
    //         for (let i = 0; i < obj.length; ++i) {
    //             if (insideObj(obj[i], this.m.left.slice(12, 15)))
    //                 return obj[i];
    //         }
    //     }
    //     if (hand === 1 && this.bs.right[0].pressed) {
    //         for (let i = 0; i < obj.length; ++i) {
    //             if (insideObj(obj[i], this.m.right.slice(12, 15)))
    //                 return obj[i];
    //         }
    //     }
    //     return null;
    // }

    this.hitByBeam = (objs, hand) => {
        // hand: 0 for left, 1 for right
        // return index of the closest hit obj, -1 if not hit any obj
        let minDist = 1000;
        let hitObjIdx = -1;
        let projectPoint = null;

        if (hand === 0) {
            for (let i = 0; i < objs.length; ++i) {
                let hit = beamHitObj(objs[i], this.m.left.slice(12, 15), lcb);
                if (hit[0] && hit[1] < minDist) {
                    hitObjIdx = i;
                    projectPoint = hit[2];
                    minDist = hit[1];
                }
            }
        }
        if (hand === 1) {
            for (let i = 0; i < objs.length; ++i) {
                let hit = beamHitObj(objs[i], this.m.right.slice(12, 15), rcb);
                if (hit[0] && hit[1] < minDist) {
                    hitObjIdx = i;
                    projectPoint = hit[2];
                    minDist = hit[1];
                }
            }
        }
        //for testing
        if (hitObjIdx > -1)
            objs[hitObjIdx].setColor(this.isLeftTriggerPressed() ? [1,0,0] : [0,1,0]);
        return [hitObjIdx, projectPoint];
    }

    this.getRefreshObjs = () => trackChanges; // return idxes of the left and/or right selected objs, null if no objs are selected

    this.operateSingleObj = (objs, objInfo, hand) => {
        // obj: [obj, project point on beam]
        // hand: 0 for left, 1 for right
        // place/rotate/place on ground

        let objIdx = objInfo[0];
        let p = objInfo[1];
        if (objIdx < -1) return;
        
        let obj = objs[objIdx];

        let triggerPressed = (hand === 0 && this.isLeftTriggerPressed()) || (hand === 1 && this.isRightTriggerPressed());
        if (obj !== null && triggerPressed) {
            
            obj.setColor(this.isLeftTriggerPressed() ? [1,0,0] : [0,1,0]);
            
            // press one left/right trigger to grab objects with ctr
            this.moveObj(obj, p); //

            // use right joystick to move along the beam
            this.moveObjAlongBeam(obj, hand);

            // use left joystick to rotate the object
            this.rotateObj(obj);
        }

        // press 'A' to place the object on ground
        if (obj !== null && this.bs.right[4].pressed)
            this.placeOnGround(obj);
    } 

    this.animate = (t, objs) => {
        // objs: obj_collection, list of objects
        if (!this.active)
            //obj_model.opacity(0.001);
            return;

        // select (grab) obj, press one left/right trigger to grab objects with ctr
        let resl = resize_lock ? [resize_obj_idx, null] : this.isLeftTriggerPressed() ? this.hitByBeam(objs, 0) : [-1, null]; //[obj idx, project point]
        let resr = resize_lock ? [resize_obj_idx, null] : this.isRightTriggerPressed() ? this.hitByBeam(objs, 1) : [-1, null];

        // left and right controller select the same obj
        if (resize_lock || (resl[0] > -1 && resr[0] > -1 && resl[0] == resr[0])){
            //press both trigger to resize obj
            if (this.isResize(t, resl[0] > -1 ? objs[resl[0]] : null, resl[0])) {
                this.resizeObj(t);
            }
        }

        if (!resize_lock) {
            this.operateSingleObj(objs, resl, 0);
            this.operateSingleObj(objs, resr, 1);

            // press both buttons to delect the Obj, both controller have to select the same object
            if (this.isDelete()) {
                resl = this.hitByBeam(objs, 0);
                resr = this.hitByBeam(objs, 1);
                if (resl[0] > -1 && resr[0] > -1 && resl[0] == resr[0]) {
                    objs[resl[0]].setColor([0,0,0]); // for test
                    this.deleteObj(objs[resl[0]], t);
                }
            } 
        }

        trackChanges = resl[0] === -1 && resr[0] === -1 ? Array(0) :
                       resl[0] === -1 ? [resr[0]] : resl[0] == resr[0] ? [resl[0]] : [resl[0], resr[0]];

        // TODO
        // this.walk();
    }
}