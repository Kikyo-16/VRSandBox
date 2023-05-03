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
	this.local_user = null;

	let prevInBox = false;
	let prev_rp = null;

	// debug
	let t = model.time;
	
	this.initialize = (msg, local_user, sandbox) => {
		// msg: {NAME: {ID, IN_BOX, FLOOR, RM, VM}}, include local user, RM: relative to mini sandbox
		// local user initialize to outside of box
		this.local_user = local_user;
		for (const [name, info] of msg) {
			if (name !== this.local_user) {
				let avatar = new CreateAvatar(this.model, name, SCALE_OUT);
				this.avatars.set(name, avatar);
			}
			let mini_avatar = new CreateAvatar(this.model, name, MINI_SCALE_OUT);
			this.mini_avatars.set(name, mini_avatar);
		}
		this.mini_avatars.get(this.local_user).setColor([1,0,0]);
	}

	//debug = model.add('cube').color(1,0,0);

	this.update = (name, inBox, rm, box, mini_box) => {
		// update visualization of a given avatar
		let box_center = cg.add(box.robot.getGlobalMatrix().slice(12, 15), cg.scale(floor_offset, sc)); // further left corner
		let mini_box_center = cg.add(mini_box.robot.getGlobalMatrix().slice(12, 15), floor_offset);

		let rLoc = rm.slice(12, 15);
		// global location
		let loc = cg.add(box_center, cg.scale(rLoc, sc));
		let loc_mini = cg.add(mini_box_center, rLoc);

		this.mini_avatars.get(name).update(inBox ? MINI_SCALE_IN : MINI_SCALE_OUT, loc_mini);

		// only update non-local-users' room avatar location and scale
		if (name !== this.local_user) {
			this.avatars.get(name).update(inBox ? SCALE_IN : SCALE_OUT, loc);
		}
	}

	this.getVMPosition = (in_room, sandbox) => {
		let vm = window.views[0]._viewMatrix;
        let p = vm.slice(12, 15);
        let rp = sandbox.getRPosition(in_room ? 1 : 0, p);
        return rp;
	}

	this.updateLocal = (inBox, floor, rm, vm, sandbox, state) =>{
		
		// move sandbox according to local user location
		let box_center = sandbox.room.robot.getGlobalMatrix().slice(12, 15); // further left corner
		let mini_box_center = sandbox.mini_sandbox.robot.getGlobalMatrix().slice(12, 15);

		let rLoc = rm.slice(12, 15);

		// move sandbox around, might need to block for diving??
		if (state.MODE["MODE"] !== ut.DIVING_MSG && state.PERSPECTIVE.ACTION.MSG === ut.PERSPECTIVE_EXCHANGE_MSG) {
			if (prevInBox && inBox) {
				// from inbox to inbox
				// let rv = this.getVMPosition(inBox, sandbox);
				// let rp = cg.subtract(rv, rLoc);
				let rp = cg.subtract(prev_rp, rLoc);
				console.log("move in room", prev_rp, rLoc, rp);
				sandbox.changePerspective(1, rp);
			} else if (!prevInBox && !inBox) { 
				// from outside to outside
				// do nothing
			} else if (!prevInBox && inBox) { 
				// from outside to inbox
				console.log("dive", prevInBox, inBox)
				let loc = sandbox.getGPosition(0, rLoc);
				// sandbox.div(loc);
				state.MODE["MODE"] = ut.DIVING_MSG;
				state.BOX.ACTION.MSG = ut.DIVING_MSG;
				state.BOX.ACTION.ARG = loc;
			} else { 
				// from inbox to outside
				console.log("leave room")
				//sandbox.leaveRoom();
				state.MODE["MODE"] = ut.BOX_VIEW_MSG;
				state.BOX.ACTION.MSG = ut.NON_ACTION_MSG;
				state.BOX.ACTION.ARG = null;
			}
			state.PERSPECTIVE.ACTION.MSG = ut.NON_ACTION_MSG;
		}

		// update location and scale in mini sandbox
		prevInBox = inBox;
		prev_rp = rLoc;
		mini_box_center = cg.add(sandbox.mini_sandbox.robot.getGlobalMatrix().slice(12, 15), floor_offset);
		let loc_mini = cg.add(mini_box_center, rLoc);
		this.mini_avatars.get(this.local_user).update(inBox ? MINI_SCALE_IN : MINI_SCALE_OUT, loc_mini);

		return state;

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
		}
	}

	this.refresh = (msg, sandbox, state) => {
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
		state = this.updateLocal(info.get("IN_BOX"), info.get["FLOOR"], info.get("RM"), info.get("VM"), sandbox, state);

		// update other avatars
		for (const [name, info] of msg) {
			if (name !== this.local_user) {
				// add new users
				if (!this.avatars.has(name)) {
					let avatar = new CreateAvatar(this.model, name, SCALE_OUT);
					let mini_avatar = new CreateAvatar(this.model, name, MINI_SCALE_OUT);
					this.avatars.set(name, avatar);
					this.mini_avatars.set(name, mini_avatar);
				}
				this.update(name, info.get("IN_BOX"), info.get("RM"), room, mini_box);
			}
		}

		return state;
	}

	this.animate = (msg, sandbox, state) => {

		if (msg !== undefined && msg !== null) {
			state = this.refresh(msg, sandbox, state);
		}

		for (const [name, avatar] of this.avatars) {
			if (name !== this.local_user)
				this.avatars.get(name).animate();
			this.mini_avatars.get(name).animate();
		}

		return state;
	}

}