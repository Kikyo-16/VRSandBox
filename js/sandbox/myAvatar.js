import * as cg from "../render/core/cg.js";
import {g2} from "../util/g2.js";
import * as ut from '../sandbox/utils.js';


export function CreateAvatar(model, name, scale){

	this.name = name;
	let _scale = scale;
    let _loc = [0,.8/80, 0];

    let avatar = model.add();
    
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
    nameTag.text = name;
    nameTag.color = [1, 1, 1];
    this.getScale = () => _scale;
    this.getLoc = () => _loc;

    this.setColor = (c) => spine.color(c);

    this.update = (s, loc) => {
        _loc = loc;
        _scale = s;
        avatar.identity().move(_loc).scale(_scale);
    }

    this.remove = () => {
        avatar = null;
    	model.remove(avatar);
    }

    this.animate = () => {

	}
}