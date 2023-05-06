import {Object} from "../sandbox/objCollection.js";
import * as wu from "../sandbox/wei_utils.js";
import * as ut from "../sandbox/utils.js";


export function FurnitureCollection(model){
    this.objCollection = new Map();
    this.removedTags = new Map();

    this.isRemoved = (name) =>{
        if(this.removedTags.has(name)){
                return true
        }
        if(this.removedTags.size > 60){

        }
        return false;
    }

    this.newObj = (obj, m) => {
        let n_obj = new Object();
        n_obj.init(model, obj._form, [0, 0, 0], 1, 0);
        n_obj.setColor(obj._color);
        n_obj.setTexture(obj._texture);
        n_obj.setMatrix(m);
        n_obj.setName(obj._name);
        n_obj._revised = obj._revised;
        n_obj._latest = obj._latest;
        this.objCollection.set(obj._name, n_obj);
        return n_obj;
    }

    //this.getObjByIdx = (idx) =>{
    //    return this.objCollection[idx];
    //}

    this.getObjByName = (name) => {
        if(this.objCollection.has(name))
            return this.objCollection.get(name);
        return null;
    }

    /*this.removeObjOfIdx = (idx, time) =>{
        let n_objCollection = Array(0);
        for(let i = 0; i < this.objCollection.length; ++ i){
            if(i !== idx){
                n_objCollection.push(this.objCollection[i]);
            }else{
                this.objCollection[idx].delete();
                let v = new Map();
                v.set(ut.LATEST_KEY, time);
                this.removedTags.set(this.objCollection[idx]._name, v);
            }
        }
        this.objCollection = n_objCollection;
    }*/

    this.removeObjOfName = (name, time) =>{
        let v = new Map();
        v.set(ut.LATEST_KEY, time);
        this.removedTags.set(name, v);
        if(this.objCollection.has(name)){
            let obj = this.objCollection.get(name);
            obj.delete();
            this.objCollection.delete(name);
        }

    }
    this.getRemovedTags = () =>{
        let collections = new Map();
        for(const [name, obj] of this.removedTags) {
            collections.set(name, obj);
        }
        return collections;
    }
    this.getObjCollection = () =>{
        let collection = Array(0);
        for(const [name, obj] of this.objCollection) {
            collection.push(obj);
        }
        return collection;
    }
    this.getCollectionState = (time) =>{
        let collections = new Map();
        for(const [name, obj] of this.objCollection){
            if(obj._revised) {
                let v = new Map();
                v.set(ut.COLOR_KEY, obj.getColor());
                v.set(ut.TEXTURE_KEY, obj.getTexture());
                v.set(ut.RM_KEY, obj.getMatrix());
                v.set(ut.FORM_KEY, obj.getForm());
                v.set(ut.LATEST_KEY, obj._latest);
                collections.set(name, v);
            }
        }
        return collections
    }
    this.reviseObj = (obj) =>{

        let target = this.getObjByName(obj._name);
        if(target === null)
            return 0;
        if(target._latest >= obj._latest){
            return 1;
        }
        if(!wu.isNull(target)){
            target.setMatrix(obj._rm);
            target.setColor(obj._color);
            target.setTexture(obj._texture);
            target._latest = (new Date).getTime();
            target._revised = obj._revised;
            return 2;
        }
        return 1;

    }

    this.setObjScene = (collection) =>{
        for(let [name, obj_map] of collection){
            if(this.isRemoved(name))
                continue
            let obj = {
                _color: obj_map.get(ut.COLOR_KEY),
                _texture: obj_map.get(ut.TEXTURE_KEY),
                _latest: obj_map.get(ut.LATEST_KEY),
                _rm: obj_map.get(ut.RM_KEY),
                _form: obj_map.get(ut.FORM_KEY),
                _name: name,
            };
            obj._revised = false;
            let res = this.reviseObj(obj);
            if(res === 0){
                this.newObj(obj, obj._rm);
            }

        }
    }

    this.setNobjScene = (collection) =>{
        if(wu.isNull(collection))
            return;
        for(let [name, obj_map] of collection) {
            this.removeObjOfName(name, obj_map.get(ut.LATEST_KEY));
        }
    }


}