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
import * as wu from '../sandbox/wei_utils.js';

import {controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";
import {lcb, rcb} from '../handle_scenes.js';

function beamHitObj(obj, ctr, cb) {
    let center = obj.getLoc();
    let point = cb.projectOntoBeam(center);
    let dist = cg.norm(cg.subtract(ctr, point));
    return [obj.inside(point), dist, point];
}

export function CreateObjController(obj_model){
    //let copied_obj = null;

    this.m = controllerMatrix;
    this.bs = buttonState;
    this.js = joyStickState;
    this.prev_lm = null;
    this.prev_obj_m = null;
    this.cold_down = 0;
    let CD = 10;
    
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

    let copy_t = 0;
    //
    this.debug = false;

    // press either trigger to grab an obj, ctr has to intersect with the obj
    this.isLeftTriggerPressed = () => this.bs.left[0].pressed; 
    this.isRightTriggerPressed = () => this.bs.right[0].pressed;
    this.isLeftYTriggerPressed = () => this.bs.left[5].pressed;

    this.rotateObj = (obj, p) =>{
        return false
        let m = cg.mMultiply(this.m.left, cg.mIdentity());
        m[12] = p[0];
        m[13] = p[1];
        m[14] = p[2];

        return
        if(wu.isNull(obj)){
            this.prev_lm = null;
            this.prev_obj_m = null;
            return
        }
        if(this.isLeftTriggerPressed()){

            if(wu.isNull(this.prev_lm) || wu.isNull(this.prev_obj_m)) {
                let m = cg.mMultiply(this.m.left, cg.mIdentity());
                m[12] = p[0];
                m[13] = p[1];
                m[14] = p[2];
                this.prev_lm = cg.mInverse(this.m.left);
                this.prev_obj_m = obj.getMatrix();
            }else{
                //let m = cg.mMultiply(cg.mMultiply(this.m.left,  this.prev_lm), this.prev_obj_m);
                obj.setMatrix(this.prev_obj_m);
            }
        }else{
            this.prev_lm = null;
            this.prev_obj_m = null;
        }
    }
    
    // press both side triggers to delete
    this.isDelete = () => this.bs.left[1].pressed && this.bs.right[1].pressed;

    // this.isCopy = () =>  !this.bs.left[0].pressed && this.bs.right[0].pressed && this.bs.right[4].pressed;

    // // press A to merge two objs
    // this.isMerge = () => this.bs.left[0].pressed && this.bs.right[0].pressed && this.bs.right[4].pressed;

    // press both trigger to resize, both ctr select the same obj, ctr does not have to be inside obj while resizing
    this.isResize = (t, obj, idx) => {
        if (!this.bs.right[1].pressed && !this.bs.left[1].pressed) {
            let press = this.bs.right[0].pressed && this.bs.left[0].pressed;
            let state = !triggerPressedPrev && press ? 'press':
                        !press & triggerPressedPrev ? 'release' : press ? 'drag' : 'move';
            triggerPressedPrev = press;
            if (state === 'press') {
                resize_lock = true;
                resize_obj = obj;
                resize_obj_idx = idx;
                norm_prev = cg.norm(cg.subtract(this.m.left.slice(12, 15), this.m.right.slice(12, 15)));
                norm_t = t;
                if (this.debug)
                    resize_obj.setColor([1,1,0]); //for testing
            }
            if (state === 'release') { //reset
                if (this.debug)
                    resize_obj.setColor([0,1,1]);
                norm_prev = -1;
                norm_t = 0;
                resize_lock = false;
                resize_obj_idx = -1;
                resize_obj = null;
            }
            return state === 'drag' || state === 'press';
        }
        return false;
    }

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
        obj.updateLoc(p);
    }

    this.moveObjAlongBeam = (obj, hand) => {
        let direction = cg.normalize(hand === 0 ? lcb.beamMatrix().slice(8,11) : rcb.beamMatrix().slice(8,11));
        obj.updateLoc(cg.add(obj.getLoc(), cg.scale(direction, this.js.right.y*move_speed)));
    }

    /*this.rotateObj = (obj) => {
        // up down to rotate along X, left right to rotate along Y
        //let thetaX = this.js.left.y*rotate_speed;
        //let thetaY = this.js.left.x*rotate_speed;
        //obj.rotate(thetaX, thetaY);

    }*/

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
        } else {
            for (let i = 0; i < objs.length; ++i) {
                let hit = beamHitObj(objs[i], this.m.right.slice(12, 15), rcb);
                if (hit[0] && hit[1] < minDist) {
                    hitObjIdx = i;
                    projectPoint = hit[2];
                    minDist = hit[1];
                }
            }
        }

        if (this.debug && hitObjIdx > -1)
            objs[hitObjIdx].setColor(this.isLeftTriggerPressed() ? [1,0,0] : [0,1,0]);
        return [hitObjIdx, projectPoint];
    }

    this.operateSingleObj = (objs, objInfo, hand) => {
        // obj: [obj, project point on beam]
        // hand: 0 for left, 1 for right
        // place/rotate/place on ground
        if (objs.length === 0 || objInfo[1] < 0) return 
        let objIdx = objInfo[0];
        let p = objInfo[1];
        let obj = objs[objIdx];
        if (!wu.isNull(obj) && this.isRightTriggerPressed()&& hand === 1) {

            // press one left/right trigger to grab objects with ctr
            this.moveObj(obj, p); //

            // use right joystick to move along the beam
            this.moveObjAlongBeam(obj, 1);

            // use left joystick to rotate the object
            //this.rotateObj(obj);
        }
        if(!wu.isNull(obj) && this.isLeftTriggerPressed() && hand === 0){
            this.rotateObj(obj, p);
        }

    } 

    this.copyObj = (objs, objInfo) => {
        if (objs.length === 0 || objInfo[1] < 0) return
        let objIdx = objInfo[0];
        //let p = objInfo[1];
        let obj = objs[objIdx];
        if(this.cold_down > 0){
            this.cold_down -= 1;
            return -1;
        }
        console.log("wei ", !wu.isNull(obj), this.isLeftYTriggerPressed());
        if(!wu.isNull(obj) && this.isLeftYTriggerPressed()){
            this.cold_down = CD;
            console.log("wei copy obj...")
            return objIdx;
        }
        return -1;
    }



    this.animate = (t, objs, state) => {
        // objs: obj_collection, list of objects
        //return obj index to delete || -1

        if(state.OBJ.INACTIVE || objs.length === 0)
            return [false, state]


        let delete_obj_idx = -1;
        let selected_obj_idx = Array(0);
        let copy_idx = -1;
        //let copied_obj = null;

        // select (grab) obj, press one left/right trigger to grab objects with ctr
        let resl = resize_lock ? [resize_obj_idx, null] : this.isLeftTriggerPressed() ? this.hitByBeam(objs, 0) : [-1, null]; //[obj idx, project point]
        let resr = resize_lock ? [resize_obj_idx, null] : this.isRightTriggerPressed() ? this.hitByBeam(objs, 1) : [-1, null];
        
        selected_obj_idx = resl[0] === -1 && resr[0] === -1 ? Array(0) :
                       resl[0] === -1 ? [resr[0]] : resl[0] === resr[0] ? [resl[0]] : [resl[0], resr[0]];

        // begin/during resize, left and right controller select the same obj, press both trigger to resize obj
        if (resize_lock || (resl[0] > -1 && resr[0] > -1 && resl[0] === resr[0])){
            if (this.isResize(t, resl[0] > -1 ? objs[resl[0]] : null, resl[0]))
                this.resizeObj(t);
        // press both buttons to delect the Obj, both controller have to select the same object
        } else if (!resize_lock && this.isDelete()) {
            resl = this.hitByBeam(objs, 0);
            resr = this.hitByBeam(objs, 1);
            if (resl[0] > -1 && resr[0] > -1 && resl[0] === resr[0]) {
                if (this.debug)
                    objs[resl[0]].setColor([0,0,0]); // for test
                delete_obj_idx = resl[0];
            }
        } else {
            // // merge right hand obj to left hand, and delete left hand obj
            // if (resl[0] > -1 && resr[0] > -1 && resl[0] !== resr[0] && this.isMerge()) {
            //     // this.merge(objs[res[0]], objs[res[1]]);
            // } else {
                // if (this.isCopy() && resr[0] > -1) {
                //     copied_obj = this.copyObj(objs[resr[0]], t);
                //     if (this.debug && copied_obj !== null) {
                //         copied_obj.setColor([.3,0,.3]);
                //     }
                // }
            this.operateSingleObj(objs, resl, 0);
            this.operateSingleObj(objs, resr, 1);
            copy_idx = this.copyObj(objs, resl);
        }

        let deleted_name = -1;
        let copy_name = -1;
        if(delete_obj_idx > -1)
            deleted_name = objs[delete_obj_idx]._name;
        if(copy_idx > -1)
            copy_name = objs[copy_idx]._name;
        let selected_names = Array(0)

        for(let i =0; i < selected_obj_idx.length; ++ i){
            if(wu.isNull(objs[selected_obj_idx[i]]))
                continue
            selected_names.push(objs[selected_obj_idx[i]]);
        }

        state.OBJ.ACTION["DELETE"] = deleted_name;
        state.OBJ.ACTION["REVISE"] = selected_names;
        state.OBJ.ACTION["COPY"] = copy_name;

        return [false, state]

        // return [delete_obj_idx, selected_obj_idx, copied_obj];
    }

    this.clearState = (t, state, sandbox, collection_mode) =>{
        let revised_lst = state.OBJ.ACTION.REVISE;
        let delete_name = state.OBJ.ACTION.DELETE;
        let copy_name = state.OBJ.ACTION.COPY;
        if(revised_lst.length > 0){
            sandbox.refreshObj(revised_lst);
            state.OBJ.ACTION["REVISE"] = Array(0);
        }
        if(delete_name !== -1){
            sandbox.removeObjOfName(delete_name, collection_mode);
            state.OBJ.ACTION["DELETE"] = -1;
        }
        if(copy_name !== -1){
            sandbox.copyObj([copy_name]);
            state.OBJ.ACTION["COPY"] = -1;
        }

        return state
    }
}