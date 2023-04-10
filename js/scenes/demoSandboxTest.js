import * as cg from "../render/core/cg.js";
import {CreateVRSandbox}  from '../sandbox/sandbox.js'
import {customClays} from '../sandbox/defineClays.js'


export const init = async model => {
   model.setTable(false);
   model.setRoom(false);
   customClays();
   let sandbox_model = model.add();

   let sandbox = new CreateVRSandbox(sandbox_model);
   //sandbox.initialize()
   sandbox_model.move(0, 1.5, 0).turnX(Math.PI/40).scale(.2);
   sandbox.addFloor();
   sandbox.active_floor = 0;



   /*model.add("sphere").move(p2).scale(.01).color(1, 1, 0);
   model.add("sphere").move(p3).scale(.01).color(1, 0, 0);
   model.add("sphere").move(p4).scale(.01).color(1, 1, 0);*/

   let s1 = [-.1, 1.52, .2];
   let n1 = [.2, 1.52, .2];
   let s1_ob = model.add("sphere").move(s1).scale(.01).color(1, 0, 0);
   let n1_ob = model.add("sphere").move(n1).scale(.01).color(1, 1, 0);

   let s2 = [.3, 1.52, 0.08];
   let n2 = [2, 1.52, 0.0];
   model.add("sphere").move(s2).scale(.01).color(1, 0, 0);
   let n2_ob = model.add("sphere").move(n2).scale(.01).color(1, 1, 0);


   let res = sandbox.select(s1, n1, 0);
   console.log(res);
   if(res[0] !== undefined) {
      sandbox.focus(res, true, 0);}
      sandbox.spliting(s1, 0);
      res = sandbox.select(n1, s1, 0);
      sandbox.splitingFocus(res, 0);
      sandbox.split();

      let s5 = [.1, 1.52, .2];
      let a = model.add("cube").color(0, 1, 1).move(s5).scale(.02);
      sandbox.leaveRoom();
      //;
      sandbox.addObj(a, 0);
      console.log("add", sandbox.getObjCollection(0))
      console.log("add", sandbox.getObjCollection(1))

      res = sandbox.select(n1, s1, 0);
      sandbox.focus(res, false, 0, false);
      sandbox.reviseFocus(["texture", a]);
      res = sandbox.select(n1, s1, 0);
      console.log("done")
      //sandbox.focus(res, true, 0, false);
      //sandbox.div(s5)
      /*sandbox.reviseFocus(["delete"])
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



   sand_box.expand()
   sand_box.div(p4);
   let s5 = [.1, 1.52, .2];
   model.add("cube").color(0, 1, 1).move(s5).scale(.02);
   sandbox.div(s5);
   let m = s1_ob.getMatrix();
   sandbox.addObj(1, m, "cube")
   sandbox.addObj(1, m, "cube")
   let a = sandbox.addObj(1, m, "cube")
   console.log("getObjCollection", sandbox.getObjCollection(0))
   console.log("getObjCollection", sandbox.getObjCollection(1))
   sandbox.removeObj(0, 1)
   sandbox.removeObj(0, 1)
   console.log("remove", sandbox.getObjCollection(0))
   console.log("remove", sandbox.getObjCollection(1))
   console.log(a.getGlobalMatrix().slice(12, 15));
   a.move(.1, 0, 0)
   console.log(a.getGlobalMatrix().slice(12, 15));
   console.log("refreshObj", sandbox.getObjCollection(0)[0].getGlobalMatrix().slice(12, 15))
   console.log("refreshObj", sandbox.getObjCollection(1)[0].getGlobalMatrix().slice(12, 15))
   sandbox.refreshObj(0, 1)
   console.log("refreshObj", sandbox.getObjCollection(0)[0].getGlobalMatrix().slice(12, 15))
   console.log("refreshObj", sandbox.getObjCollection(1)[0].getGlobalMatrix().slice(12, 15))
   a.move(.1, 0, 0)*/


   model.animate(() => {
      sandbox.animate(model.time);
      //model.identity().turnY(Math.cos(model.time / 2) * Math.PI);
      /*box.identity().move(0, 1.5, 0)
          .scale(.3).turnX(Math.PI/6)
          .turnY(Math.cos(model.time / 2) * Math.PI);*/
      //box.turnX(Math.PI / 10);

   });
}

