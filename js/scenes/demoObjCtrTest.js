
import * as cg from "../render/core/cg.js";
import {Object}  from '../sandbox/objCollection.js'
import {CreateObjController}  from '../sandbox/objController.js'


export const init = async model => {
   model.setTable(false);
   let obj_model = model.add();
   let obj_controller = new CreateObjController(obj_model);

   // create test obj
   let t = new Date();
   let obj = new Object();
   let obj1 = new Object();
   let obj2 = new Object();
   let obj3 = new Object();
   obj.init(obj_model, 'cube', [0, 1,.2], .1, t.getTime());
   obj1.init(obj_model, 'sphere', [0, 1, .1], .1, t.getTime());
   obj2.init(obj_model, 'cube', [.5, 1, 0], .1, t.getTime());
   obj3.init(obj_model, 'donut', [.5, .8,-.1], .1, t.getTime());
   
   let o = obj_model.add();
   let o1 = o.add('cube');
   o1.move(.5, .5, 0).scale(.1).color(.5,.5,0);
   let o2 = o1.add('sphere')
   o2.move(.5, .5, 0).color(.5, 0, 0);

   let obj4 = new Object();
   obj4.vallinaInit(o2);
   let obj_collection = [obj, obj1, obj2, obj3, obj4];

   for (let i = 0; i < 10; ++i){
      let obj5 = new Object();
      obj5.init(obj_model, 'cube', [0+Math.sin(i), 1+Math.cos(i),.2], .1, t.getTime());
      obj_collection.push(obj5);
   }

   // // create test obj
   // let t = new Date();
   // let obj = new ObjectCollection();
   // let obj1 = new ObjectCollection();
   // let obj2 = new ObjectCollection();
   // let obj3 = new ObjectCollection();
   // //obj.init(obj_model, 'cube', [0, 1,.2], .1, t.getTime());
   // obj1.init(obj_model, 'sphere', [0, 1, .1], .1, t.getTime());
   // obj2.init(obj_model, 'cube', [.5, 1, 0], .1, t.getTime());
   // obj3.init(obj_model, 'donut', [.5, .8,-.1], .1, t.getTime());
   
   // let o = obj_model.add()
   // let o1 = o.add('cube');
   // o1.move(.5, .5, 0).scale(.1).color(.5,.5,0);
   // let o2 = o1.add('sphere')
   // o2.move(.5, .5, 0).color(.5, 0, 0);

   // let obj4 = new ObjectCollection();
   // obj4.vallinaInit(o2);
   // let obj_collection = [obj, obj1, obj2, obj3, obj4];

   // console.log("obj1", obj1 !== null ? obj1.nChildren():0);
   // console.log("obj2 parent's children", obj2.parent !== null ? obj2.parent.nChildren(): 0);
   // console.log("obj1 parent's children", obj1.parent !== null ? obj1.parent.nChildren(): 0);
   // console.log("obj1 's children", obj1 !== null ? obj1.nChildren(): 0);
   // console.log("adding obj2 to obj1 ")
   // obj1.add(obj2);
   
   // // obj1.updateScale(2);
   // console.log("obj2 parent's children", obj2.parent !== null ? obj2.parent.nChildren() : 0);
   // console.log("obj2 's children", obj2.parent !== null ? obj2.nChildren() : 0);
   // console.log("obj1 parent's children", obj1.parent !== null ? obj1.parent.nChildren() : 0);
   // console.log("obj1 's children", obj1 !== null ? obj1.nChildren() : 0, obj1._form);

   // console.log("obj3 parent's children", obj3.parent !== null ? obj3.parent.nChildren() : 0);
   // console.log("obj3 's children", obj3 !== null ? obj3.nChildren(): 0);
   // console.log("adding obj1 to obj3 ")
   // obj3.add(obj1);
   // console.log("obj3 parent's children", obj3.parent !== null ? obj3.parent.nChildren() : 0);
   // console.log("obj3 's children", obj3 !== null ? obj3.nChildren() : 0);
   // console.log("obj2 parent's children", obj2.parent !== null ? obj2.parent.nChildren() : 0);
   // console.log("obj1 parent's children", obj1.parent !== null ? obj1.parent.nChildren() : 0);
   // console.log("obj1 's children", obj1 !== null ? obj1.nChildren() : 0);
   // let obj11 = obj_model.add('sphere')

   model.animate(() => {
      //obj3.obj_node.turnY(Math.sin(.005*model.time));

      // let p = [.5, .8, -.099];
      // let hit = obj3.inside(p);
      // console.log("hit", hit);

      //obj2.obj_node.turnY(model.time);
      // o1.turnY(model.time);
      let changed_objs = obj_controller.animate(model.time, obj_collection, true);
      // if (changed_objs[2] !== null) {
      //    obj_collection.push(changed_objs[2]);
      // } 
   });
}

