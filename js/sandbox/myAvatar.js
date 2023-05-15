import * as cg from "../render/core/cg.js";
import {g2} from "../util/g2.js";
import * as ut from '../sandbox/utils.js';


export function CreateAvatar(sandbox, name, scale){

	this.name = name;
    let _floor = -1;
	let _scale = scale;
    let _loc = [0,.8/80, 0];

    let avatar_node = sandbox.boxes[0].robot.add();
    let avatar = avatar_node.add();
    let spine = avatar.add().move(0, -.4, 0);
    spine.add('tubeY').scale(.06, .4, .06);
    let tag = avatar.add().move(0, .2, 0).scale(.2, .1,.0001);
    let nameTag = tag.add("cube").color(1,1,1).texture(() => {
            g2.setColor(nameTag.color);
            g2.fillRect(0,0,1,1);
            g2.setColor('black');
            g2.textHeight(.8);
            g2.fillText(nameTag.text, .5, .5, 'center');
            g2.drawWidgets(nameTag);
    });
    nameTag.text = this.name;
    nameTag.color = [1, 1, 1];
    this.getScale = () => _scale;
    this.getLoc = () => _loc;

    this.setColor = (c) => spine.color(c);

    this.update = (s, loc, floor) => {
        if ((floor >= 1 || _floor >= 1) && floor !== _floor) {
            //console.log("move between floor", floor, _floor)
            sandbox.boxes[floor <= 0 ? 0 : floor].robot._children.push(avatar_node);
            sandbox.boxes[_floor <= 0 ? 0: _floor].robot.remove(avatar_node);
            _floor = floor;
        }
        this.update_floor(s, loc);
    }

    this.update_floor = (s, loc) => {
        _loc = loc;
        _scale = s;
        avatar.identity().move(_loc).scale(_scale);
    }

    this.remove = () => {
        avatar = null;
    	avatar_node.remove(avatar);
        sandbox.boxes[_floor <= 0 ? 0 : _floor].robot.remove(avatar_node);
        avatar_node = null;
    }

    this.animate = () => {
        nameTag.text = this.name;
        nameTag.texture();
	}
}