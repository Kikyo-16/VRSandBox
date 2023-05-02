import * as cg from "../render/core/cg.js";
import {g2} from "../util/g2.js";
import * as ut from '../sandbox/utils.js';

export function CreateAvatar(model, name, scale){
	this.name = name;
	let _scale = scale;
    let _loc = [0,0,0];

	let avatar = model.add().color(1,.86,.69);
    let base  = avatar.add();
    let spine = base.add().move(0, .4, 0);
    spine.add('tubeY').scale(.06, .4, .06);

    let tag = avatar.add().move(0, 1, 0).scale(.2, .1,.0001);
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

    avatar.scale(_scale);

	this.setMatrix = (matrix) => {
		avatar.setMatrix(matrix);
	}

	this.getGlobalMatrix = () => avatar.getGlobalMatrix();

	this.getMatrix = () => avatar.getMatrix();

	this.scale = (s) => {
        _scale = _scale*s;
        avatar.scale(s);
    }

    this.getScale = () => _scale;

	this.getName = () => nameTag.text;

	this.updateLoc = (loc) => { //move to global location loc
        _loc = loc;
    	let mTr = cg.mTranslate(cg.subtract(loc, avatar.getGlobalMatrix().slice(12,15)));
    	avatar.setMatrix(ut.transform(mTr, avatar));
    }

    this.remove = () => {
    	model.remove(avatar);
    }

	this.animate = () => {

	}
}