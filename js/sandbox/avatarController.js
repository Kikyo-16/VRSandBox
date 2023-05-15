import {CreateAvatar}  from '../sandbox/myAvatar.js'
import * as ut from '../sandbox/utils.js';
import * as cg from "../render/core/cg.js";

export const s_in_out = 3;
const sc = 80;

const floor_offset = [0, .01, 0];
const wall_h = .05;
const init_dist = 1.25;
const avatar_height = .8;

const MINI_SCALE_IN = wall_h;
const MINI_SCALE_OUT = MINI_SCALE_IN*s_in_out;

export function CreateAvatarController(sandbox){
	this.avatars = new Map(); //{NAME: [avatar, prevInsideBox]}
	this.mini_avatars = new Map();
	this.effect_avatars = new Map();
	this.local_user = null;

	let prevInBox = false;
	let prev_rp = null;

	let prev_vm = null;
	
	this.initialize = (msg, local_user) => {
		// msg: {NAME: {ID, IN_BOX, FLOOR, RM, VM}}, include local user, RM: relative to mini sandbox
		// local user initialize to outside of box
		this.local_user = local_user;
		for (const [name, info] of msg) {
			if (name !== this.local_user) {
				let avatar = new CreateAvatar(sandbox.room.robot_model, name, MINI_SCALE_OUT);
				let effect_avatar = new CreateAvatar(sandbox.effect.robot_model, name, MINI_SCALE_OUT);
				this.avatars.set(name, avatar);
				this.effect_avatars.set(name, effect_avatar);
			}
			let mini_avatar = new CreateAvatar(sandbox.mini_sandbox.robot_model, name, MINI_SCALE_OUT);
			this.mini_avatars.set(name, mini_avatar);
		}
		this.mini_avatars.get(this.local_user).setColor([1,0,0]);
	}

	this.update = (name, inBox, rm) => {
		// update visualization of a given avatar
		let rLoc = rm.slice(12, 15);
		this.mini_avatars.get(name).update(inBox ? MINI_SCALE_IN : MINI_SCALE_OUT, rLoc);
		// only update non-local-users' room avatar location and scale
		if (name !== this.local_user) {
			this.avatars.get(name).update(inBox ? MINI_SCALE_IN : MINI_SCALE_OUT, rLoc);
			this.effect_avatars.get(name).update(inBox ? MINI_SCALE_IN : MINI_SCALE_OUT, rLoc);
		}
	}

	let moveSandbox = (inBox, floor, rm, vm, state, rLoc) => {
		if (prevInBox && inBox) {
			// from inbox to inbox
			let rp = cg.subtract(prev_rp, rLoc);
			console.log("move in room");
			sandbox.changePerspective(rp);
		} else if (!prevInBox && !inBox) { 
			// from outside to outside
			console.log("outside to outside")
			// do nothing
		} else if (!prevInBox && inBox) { 
			// from outside to inbox
			let loc = sandbox.getGPosition(0, rLoc);
			console.log("dive", prevInBox, inBox, loc);
			state.MODE["MODE"] = ut.DIVING_MSG;
			state.BOX.ACTION.MSG = ut.DIVING_MSG;
			state.BOX.ACTION.ARG = loc;
			state.MODE.ARG = null;
		} else { 
			// from inbox to outside
			console.log("leave room");
			state.MODE["MODE"] = ut.BOX_VIEW_MSG;
			state.BOX.ACTION.MSG = ut.NON_ACTION_MSG;
			state.BOX.ACTION.ARG = null;
		}
		return state
	}

	this.updateLocal = (inBox, floor, rm, vm, state) =>{
		
		// move sandbox according to local user location

		let rLoc = rm.slice(12, 15);

		console.log("perspective flag", state.PERSPECTIVE.ACTION.MSG)
		// move sandbox around, might need to block for diving??
		if (state.MODE["MODE"] !== ut.DIVING_MSG) {
			if (state.PERSPECTIVE.ACTION.MSG === ut.POS_EXCHANGE_MSG || state.PERSPECTIVE.ACTION.MSG === ut.PERSP_SHARING_MSG) {
				console.log("perspective flag", state.PERSPECTIVE.ACTION.MSG)
				state = moveSandbox(inBox, floor, rm, vm, state, rLoc);
			}
			if (state.PERSPECTIVE.ACTION.MSG === ut.POS_EXCHANGE_MSG) {
				state.PERSPECTIVE.ACTION.MSG = ut.NON_ACTION_MSG;
				state.PERSPECTIVE.ACTION.USER = null;
				state.PERSPECTIVE.ACTION.INFO = null;
			}
			prevInBox = inBox;
			prev_rp = rLoc;
		} else {
			prevInBox = true;
			if (state.MODE.ARG !== null && state.MODE.ARG !== -1) {
				prev_rp = state.MODE.ARG;
			}
		}

		// update location and scale in mini sandbox
		this.mini_avatars.get(this.local_user).update(inBox ? MINI_SCALE_IN : MINI_SCALE_OUT, rLoc);
		console.log("local mini: ", rLoc, inBox, this.mini_avatars.get(this.local_user).getLoc())

		return state;
	}

	this.destroy = (names) => {
		
		if (names.length === 0) 
			return;

		for (let i = 0; i < names.length; ++i) {
			let name = names[i];
			this.avatars.get(name).remove();
			this.mini_avatars.get(name).remove();
			this.effect_avatars.get(name).remove();
			this.avatars.delete(name);
			this.mini_avatars.delete(name);
			this.effect_avatars.delete(name);
		}
	}

	this.refresh = (msg, state) => {
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
		state = this.updateLocal(info.get("IN_BOX"), info.get["FLOOR"], info.get("RM"), info.get("VM"), state);

		// update other avatars
		for (const [name, info] of msg) {
			if (name !== this.local_user) {
				// add new users
				if (!this.avatars.has(name)) {
					let avatar = new CreateAvatar(sandbox.room.robot_model, name, MINI_SCALE_OUT);
					let mini_avatar = new CreateAvatar(sandbox.mini_sandbox.robot_model, name, MINI_SCALE_OUT);
					let effect_avatar = new CreateAvatar(sandbox.effect.robot_model, name, MINI_SCALE_OUT);
					this.avatars.set(name, avatar);
					this.mini_avatars.set(name, mini_avatar);
					this.effect_avatars.set(name, effect_avatar);
				}
				this.update(name, info.get("IN_BOX"), info.get("RM"));
			}
		}

		if (state.MODE["MODE"] !== ut.DIVING_MSG) {
			console.log("avatar ", state.PERSPECTIVE.ACTION.MSG)
			if (state.PERSPECTIVE.ACTION.MSG === ut.PERSP_SHARING_MSG) {
				// compensate for view offset??
				// update to the other player's view
				let vm = info.get("VM");
				vm[12] = 0;
				vm[13] = 0;
				vm[14] = 0;
				console.log("persp share", vm)
				sandbox.changeView(vm);

				// lock local player's view
				let local_vm = window.views[0]._viewMatrix;
				sandbox.hud(cg.mInverse(local_vm)); 
			} else {
				prev_vm = null;
				sandbox.resetHud();
				sandbox.resetView();
			}
		}

		return state;
	}

	this.animate = (msg, state) => {

		if (msg !== undefined && msg !== null) {
			state = this.refresh(msg, state);
		}

		for (const [name, avatar] of this.avatars) {
			if (name !== this.local_user)
				this.avatars.get(name).animate();
			this.mini_avatars.get(name).animate();
		}

		return state;
	}

}