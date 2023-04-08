import * as cg from "../render/core/cg.js";
import {CreateVRSandbox}  from '../sandbox/sandbox.js'
import {customClays} from '../sandbox/defineClays.js'


export const init = async model => {
   model.setTable(false);
   customClays();
   let box = model.add();
   box.move(0, 1.5, 0).scale(.3).turnX(Math.PI/6);
   //let p1 = [0, 1.5, 0], p2 = [0, 1.5, .2], p3 = [.2, 1.5, .2], p4 = [.2, 1.5, 0];
   let sand_box = new CreateVRSandbox(box);
   let p1 = [1, 1.5, 0];
   model.add("sphere").move(p1).scale(.01).color(1, 0, 0);


   /*model.add("sphere").move(p2).scale(.01).color(1, 1, 0);
   model.add("sphere").move(p3).scale(.01).color(1, 0, 0);
   model.add("sphere").move(p4).scale(.01).color(1, 1, 0);*/

   let s1 = [-.1, 1.51, 0.02];
   let n1 = [.2, 0, 0];
   let s1_ob = model.add("sphere").move(s1).scale(.01).color(1, 0, 0);
   let n1_ob = model.add("sphere").move(cg.add(s1, n1)).scale(.01).color(1, 1, 0);

   let s2 = [0.15, 1.52, 0.08];
   let n2 = [0.2, 0, -.02];
   model.add("sphere").move(s2).scale(.01).color(1, 0, 0);
   let n2_ob = model.add("sphere").move(cg.add(s2, n2)).scale(.01).color(1, 1, 0);


   let res = sand_box.select(s1, n1, 0);
   console.log(res);
   if(res[0] !== undefined) {
      sand_box.focus(res, true, 0);
      sand_box.spliting(cg.add(s2, n2), 0);
      res = sand_box.select(s2, n2, 0);
      sand_box.splitingFocus(res, 0);
      sand_box.split();
      let nn = cg.subtract(cg.add(s1, n1), s2);
      res = sand_box.select(s2, nn, 0);
      sand_box.focus(res, true, 0);
      sand_box.deleteFocus();
      let n3 = [.1, 0, 0];
      model.add("sphere").move(cg.add(s1, n3)).scale(.01).color(0, 0, 1);
      res = sand_box.select(s1, n3, 0);
      console.log(res)
      sand_box.focus(res, true, 0);

     // let s4 = [-.03, 1.52, .03]
      let n4 = [.2, -.06, 0.1];
      //model.add("sphere").move(s4).scale(.01).color(0, 0, 0);
      model.add("sphere").move(cg.add(s1, n4)).scale(.01).color(1, 1, 1);
      res = sand_box.select(s1, n4, 0);
      console.log(res)
      sand_box.focus(res, false, 0);
      sand_box.merge();

   }
   sand_box.addFloor();
   sand_box.removeFloor();
   sand_box.addFloor();
   sand_box.addFloor();
   sand_box.addFloor();
   //sand_box.expand();
   //sand_box.gather();


   let p4 = [0.2, 1.4, .2];
   model.add("cube").move(p4).scale(.02).color(1, 0, 0);
   sand_box.expand()
   sand_box.div(p4);



   model.animate(() => {
      sand_box.divAnimation();
      /*model.identity().turnY(Math.cos(model.time / 2) * Math.PI);
      box.identity().move(0, 1.5, 0)
          .scale(.3).turnX(Math.PI/6)
          .turnY(Math.cos(model.time / 2) * Math.PI);*/
      //box.turnX(Math.PI / 10);

   });
}

