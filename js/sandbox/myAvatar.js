import * as cg from "../render/core/cg.js";
import {g2} from "../util/g2.js";
import * as ut from '../sandbox/utils.js';

export function CreateAvatar(sandbox, name, scale){
    this.name = name;
    let _scale = scale;
    let _loc = [0,.8/80, 0];
    let _floor = -1;

    let avatar_node = sandbox.boxes[0].robot.add();
    let avatar = avatar_node.add();
    
    let spine = avatar.add().move(0, -.4, 0);
    let head = spine.add('cube').move(0, .3, 0).scale(.06);
    let body = spine.add('cube').scale(.12, .2, .06);
    body.color([0,0,1]);
    let leftArm = spine.add('cube').move(-.2, -.01, 0).scale(.06, .2, .06);
    let rightArm = spine.add('cube').move(.2, -.01, 0).scale(.06, .2, .06);
    let leftLeg = spine.add('cube').move(-.08, -.45, 0).scale(.06, .2, .06).color(.1,.1,.1);
    let rightLeg = spine.add('cube').move(.08, -.45, 0).scale(.06, .2, .06).color(.1,.1,.1);

    let tag = avatar.add().move(0, .2, 0).scale(.2, .1,.0001);
    this.nameTag = tag.add("cube").color(1,1,1);
    this.text = name;
    this.color = [1,1,1];

    this.getScale = () => _scale;
    this.getLoc = () => _loc;

    this.setColor = (c) => body.color(c);

    this.update = (s, loc, floor) => {
        if ((floor >= 1 || _floor >= 1) && floor !== _floor) {
            console.log("move between floor", sandbox.boxes[floor <= 0 ? 0 : floor])
            console.log("move between floor", floor, _floor)
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

    /*let textureFn = () =>{
        g2.setColor(this.nameTag.color);
        g2.fillRect(0,0,1,1);
        g2.setColor('black');
        g2.textHeight(.3);
        g2.fillText(this.nameTag.text, .5, .5, 'center');
        g2.drawWidgets(this.nameTag);
    }*/


    let textureFn = () => {
        g2.setColor(this.color);
        g2.fillRect(0,0,1,1);
        g2.setColor('black');
        g2.textHeightAndFont('',.3,'Arial');
        g2.fillText(this.text, .5, .5 , 'center');
        g2.drawWidgets(this.nameTag);
    }

    this.nameTag.texture(textureFn);

    this.animate = (hide) => {
        //nameTag.text = name;

        avatar.opacity(hide ? .0000001 : 1);
    }
}