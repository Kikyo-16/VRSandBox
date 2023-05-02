import {CreateAvatar}  from '../sandbox/myAvatar.js'
import * as ut from '../sandbox/utils.js';
import * as cg from "../render/core/cg.js";

const sc = 80;
const s_in_out = 2;
const floor_offset = [0, .01, 0];
const wall_h = .05;
const init_dist = 1.25;
const avatar_height = .8;

const MINI_SCALE_IN = wall_h;
const MINI_SCALE_OUT = MINI_SCALE_IN*s_in_out;

const SCALE_IN = MINI_SCALE_IN*sc;
const SCALE_OUT = SCALE_IN*s_in_out;

export function CreateAvatarController(model){
	this.model = model;
	this.avatars = new Map(); //{NAME: [avatar, prevInsideBox]}
	this.mini_avatars = new Map();
	let prevInboxes = new Map();
	let num_users = 0;
	this.local_user = null;
	
	this.initialize = (msg, local_user, room, mini_box) => {
		// msg: {NAME: {ID, IN_BOX, FLOOR, RM, VM}}, include local user, RM: relative to mini sandbox
		// local user initialize to global location [0,.8,0] and outside of box
		this.local_user = local_user;
		for (const [name, info] of msg) {
			this.num_users++;
			let rm = null;
			if (name !== this.local_user) {
				let avatar = new CreateAvatar(this.model, name, SCALE_OUT);
				this.avatars.set(name, avatar);
				rm = info.get("RM");
			} else {
				rm = [1,0,0,0, 0,1,0,0, 0,0,1,0, -.25+1.25*Math.random(), 0, 1.1+.25*Math.random(), 0];
			}
			let mini_avatar = new CreateAvatar(this.model, name, MINI_SCALE_OUT);
			this.mini_avatars.set(name, mini_avatar);
			prevInboxes.set(name, false);

			if (rm !== null)
				this.update(name, info.get("IN_BOX"), rm, room, mini_box);
		}
	}

	//debug = model.add('cube').color(1,0,0);

	this.update = (name, inBox, rm, box, mini_box) => {
		// update visualization of a given avatar
		let box_center = cg.add(box.robot.getGlobalMatrix().slice(12, 15), cg.scale(floor_offset, sc)); // further left corner
		let mini_box_center = cg.add(mini_box.robot.getGlobalMatrix().slice(12, 15), floor_offset);
		let prevInBox = prevInboxes.get(name);

		let rLoc = rm.slice(12, 15); // [x,y,z] relative location in box w.r.t. box center
		// global location
		let loc = cg.add(box_center, cg.scale(rLoc, sc));
		let loc_mini = cg.add(mini_box_center, rLoc);

		// console.log(name, "box", box_center, "mini box", mini_box_center, "rLoc", rLoc);
		
		let s = (prevInBox && !inBox) ? s_in_out : (!prevInBox && inBox) ? 1/s_in_out : 1;

		this.mini_avatars.get(name).scale(s);
		this.mini_avatars.get(name).updateLoc(loc_mini);
		prevInboxes.set(name, inBox);

		// only update non-local-users' room avatar location and scale
		if (name !== this.local_user) {
			this.avatars.get(name).scale(s);
			this.avatars.get(name).updateLoc(loc);
		}
	}

	this.updateLocal = (inBox, rm, vm, sandbox) =>{
		// move sandbox according to local user location
		let box_center = sandbox.room.robot.getGlobalMatrix().slice(12, 15); // further left corner
		let mini_box_center = sandbox.mini_sandbox.robot.getGlobalMatrix().slice(12, 15);
		let prevInBox = prevInboxes.get(this.local_user);

		let rLoc = cg.add(rm.slice(12, 15), floor_offset); // [x,y,z] relative position in box w.r.t. mini box center
		let s = 1;

		// move sandbox around
		if (prevInBox && inBox) { // from inbox to inbox
			// translate sandbox to updated global location
			let move = cg.subtract([-box_center[0], -box_center[1], -box_center[2]], cg.scale(rLoc, sc));
			sandbox.move(move);
		} else if (!prevInBox && !inBox) { // from outside to outside
			let move = cg.subtract([-mini_box_center[0], -mini_box_center[1], -mini_box_center[2]], [-rLoc[0], -rLoc[1], -rLoc[2]]);
			sandbox.move(move);
		} else if (!prevInBox && inBox) { // from outside to inbox
			let loc = cg.add(mini_box_center, rLoc);
			loc = cg.add(loc, floor_offset);
			loc = cg.add(loc, [0, avatar_height*MINI_SCALE_IN, 0]);
			sandbox.div(loc);
			prevInboxes.set(this.local_user, true);
			s = 1/s_in_out;
		} else { // from inbox to outside
			sandbox.leaveRoom();
			prevInboxes.set(this.local_user, false);
			s = s_in_out;
		}

		// update location and scale in mini sandbox
		mini_box_center = cg.add(sandbox.mini_sandbox.robot.getGlobalMatrix().slice(12, 15), floor_offset);
		let loc_mini = cg.add(mini_box_center, rLoc);
		this.mini_avatars.get(this.local_user).scale(s);
		this.mini_avatars.get(this.local_user).updateLoc(loc_mini);
	}

	this.destroy = (names) => {
		
		if (names.length === 0) 
			return;

		for (let i = 0; i < names.length; ++i) {
			let name = names[i];
			this.avatars.get(name).remove();
			this.mini_avatars.get(name).remove();
			this.avatars.delete(name);
			this.mini_avatars.delete(name);
			prevInboxes.delete(name);
			this.num_users--;
		}
	}

	this.refresh = (msg, sandbox) => {
		// msg: {NAME: {ID, IN_BOX, RM, VM}}

		let room = sandbox.room, mini_box = sandbox.mini_sandbox;

		// remove inactivate avatars
		let inactivate_avatars = [];
		for (const [name, avatar] of this.avatars) {
			if (!msg.has(name)) {
				inactivate_avatars.push(name);
			}
		}
		this.destroy(inactivate_avatars);

		// move sandbox to update local avatar
		let info = msg.get(this.local_user);
		this.updateLocal(info.get("IN_BOX"), info.get("RM"), info.get("VM"), sandbox);

		// update other avatars
		for (const [name, info] of msg) {
			if (name !== this.local_user) {
				// add new users
				if (!this.avatars.has(name)) {
					let avatar = new CreateAvatar(this.model, name, SCALE_OUT);
					let mini_avatar = new CreateAvatar(this.model, name, MINI_SCALE_OUT);
					this.avatars.set(name, avatar); // [avatar, prevInsideBox]
					this.mini_avatars.set(name, mini_avatar);
					prevInboxes.set(name, false);
					this.num_users++;
				}
				this.update(name, info.get("IN_BOX"), info.get("RM"), room, mini_box);
			}
		}
	}

	this.animate = (msg, sandbox) => {
		if (msg !== undefined || msg !== null) {
			this.refresh(msg, sandbox);
		}

		if (this.num_users <= 0) {
			return;
		}

		for (const [name, avatar] of this.avatars) {
			this.avatars.get(name).animate();
			this.mini_avatars.get(name).animate();
		}
	} 

}