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
import * as wut from '../sandbox/wei_utils.js';
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

    this.resizeObj = (obj, t) => {
        if (t - norm_t < 0.15) {
            return;
        }
        let ratio = 1;
        if (this.js.left.y > .1)
            ratio = 1.05;
        if (this.js.left.y < -.1)
            ratio = 0.95;
        obj.updateScale(ratio);
        norm_t = t;
    }

    this.moveObj = (obj, p) => {
        obj.updateLoc(p);
    }

    this.moveObjAlongBeam = (obj, hand) => {
        let direction = cg.normalize(lcb.beamMatrix().slice(8,11));
        obj.updateLoc(cg.add(obj.getLoc(), cg.scale(direction, this.js.right.y*move_speed)));
    }

    this.hitByBeam = (objs, hand) => {
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


    this.animate = (t, objs, active) => {
        let delete_obj_idx = -1;
        let selected_obj_idx = Array(0);

        if(objs.length === 0 || !active)
            return [delete_obj_idx, selected_obj_idx];

        let resl = this.hitByBeam(objs, 0);

        if (resl[0] > -1) {
            let obj = objs[resl[0]];
            let p = resl[1];
            if (this.isLeftTriggerPressed()) {
                this.moveObj(obj, p);
                this.moveObjAlongBeam(obj, 0);
                this.resizeObj(obj, t);
                selected_obj_idx = [resl[0]];
            } else if (this.isLeftTriggerPressed() && this.bs.left[1].pressed) {
                delete_obj_idx = resl[0];
            }
        }
        
        return [delete_obj_idx, selected_obj_idx];
    }
}