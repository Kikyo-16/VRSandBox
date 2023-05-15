import * as cg from "../render/core/cg.js";
import {g2} from "../util/g2.js";
import * as ut from '../sandbox/utils.js';

export function CreateAvatar(model, name, scale){
    this.name = name;
    let _scale = scale;
    let _loc = [0,.8/80, 0];

    let avatar = model.add();
    
    let spine = avatar.add().move(0, -.4, 0);
    let head = spine.add('cube').move(0, .3, 0).scale(.06);
    let body = spine.add('cube').scale(.12, .2, .06);
    let leftArm = spine.add('cube').move(-.2, -.01, 0).scale(.06, .2, .06);
    let rightArm = spine.add('cube').move(.2, -.01, 0).scale(.06, .2, .06);
    let leftLeg = spine.add('cube').move(-.08, -.45, 0).scale(.06, .2, .06).color(.1,.1,.1);
    let rightLeg = spine.add('cube').move(.08, -.45, 0).scale(.06, .2, .06).color(.1,.1,.1);

    let tag = avatar.add().move(0, .2, 0).scale(.2, .1,.0001);
    this.nameTag = tag.add("cube").color(1,1,1);
    this.nameTag.text = name;
    this.nameTag.color = [1,1,1];

    this.getScale = () => _scale;
    this.getLoc = () => _loc;

    this.setColor = (c) => body.color(c);

    this.update = (s, loc) => {
        _loc = loc;
        _scale = s;
        avatar.identity().move(_loc).scale(_scale);
    }

    this.remove = () => {
        avatar = null;
        model.remove(avatar);
    }

    let textureFn = () =>{
        g2.setColor(this.nameTag.color);
        g2.fillRect(0,0,1,1);
        g2.setColor('black');
        g2.textHeight(.5);
        g2.fillText(this.nameTag.text, .5, .5, 'center');
        g2.drawWidgets(this.nameTag);
    }

    this.animate = () => {
        //nameTag.text = name;
        this.nameTag.texture(textureFn);
    }
}