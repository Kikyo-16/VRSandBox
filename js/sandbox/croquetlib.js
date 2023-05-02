import {Status} from "../sandbox/status.js"
import * as wu from "../sandbox/wei_utils.js"

let status = new Status();
export let getOPs = status.getOPs;
export let sendOPs = status.sendOPs;

let apiKey = '1yvF8Ott320yzAlpl4z99Mgtimi54jKMpH0H2yHBz';

export class SandboxModel extends Croquet.Model {
    init(options={})  {
        this.participants = 0;
        this.time = 0;
        this.max_time = -1;
        this.views = new Map();
        this.states = {
            numFloors : 1,
            collections : Array(0),
        }
        this.subscribe(this.sessionId, "view-join", this.viewJoin);
        this.subscribe(this.sessionId, "view-exit", this.viewExit);
        this.subscribe("ops", 'center', this.setOPs);
        //this.update()
        //console.log("init Model", this.sessionId, this.time);

    }


    viewJoin(viewId) {
        const existing = this.views.get(viewId);
        if (!existing) {
            const nickname = this.randomName();
            this.views.set(viewId, nickname);
        }
        this.participants++;
        if(this.participants > 1){
            //this.publish("scene", 'require', viewId);
        }
        //this.publish("viewInfo", "refresh");
    }
    viewExit(viewId) {
        this.participants--;
        this.views.delete(viewId);
        this.publish("viewInfo", "refresh");
    }



    setOPs(msg) {
        this.time += 1;

        if(!wu.isNull(msg)){
             this.max_time = msg.time;
            this.states = msg;
            //console.log("center", msg)

            this.publish("ops", 'distribution', msg);
        }


    }


    randomName() {
        const names = ["Acorn", "Allspice", "Almond", "Ancho", "Anise", "Aoli", "Apple", "Apricot", "Arrowroot", "Asparagus", "Avocado", "Baklava", "Balsamic", "Banana", "Barbecue", "Bacon", "Basil", "Bay Leaf", "Bergamot", "Blackberry", "Blueberry", "Broccoli", "Buttermilk", "Cabbage", "Camphor", "Canaloupe", "Cappuccino", "Caramel", "Caraway", "Cardamom", "Catnip", "Cauliflower", "Cayenne", "Celery", "Cherry", "Chervil", "Chives", "Chipotle", "Chocolate", "Coconut", "Cookie Dough", "Chamomile", "Chicory", "Chutney", "Cilantro", "Cinnamon", "Clove", "Coriander", "Cranberry", "Croissant", "Cucumber", "Cupcake", "Cumin", "Curry", "Dandelion", "Dill", "Durian", "Earl Grey", "Eclair", "Eggplant", "Espresso", "Felafel", "Fennel", "Fig", "Garlic", "Gelato", "Gumbo", "Halvah", "Honeydew", "Hummus", "Hyssop", "Ghost Pepper", "Ginger", "Ginseng", "Grapefruit", "Habanero", "Harissa", "Hazelnut", "Horseradish", "Jalepeno", "Juniper", "Ketchup", "Key Lime", "Kiwi", "Kohlrabi", "Kumquat", "Latte", "Lavender", "Lemon Grass", "Lemon Zest", "Licorice", "Macaron", "Mango", "Maple Syrup", "Marjoram", "Marshmallow", "Matcha", "Mayonnaise", "Mint", "Mulberry", "Mustard", "Natto", "Nectarine", "Nutmeg", "Oatmeal", "Olive Oil", "Orange Peel", "Oregano", "Papaya", "Paprika", "Parsley", "Parsnip", "Peach", "Peanut Butter", "Pecan", "Pennyroyal", "Peppercorn", "Persimmon", "Pineapple", "Pistachio", "Plum", "Pomegranate", "Poppy Seed", "Pumpkin", "Quince", "Raspberry", "Ratatouille", "Rosemary", "Rosewater", "Saffron", "Sage", "Sassafras", "Sea Salt", "Sesame Seed", "Shiitake", "Sorrel", "Soy Sauce", "Spearmint", "Strawberry", "Strudel", "Sunflower Seed", "Sriracha", "Tabasco", "Tahini", "Tamarind", "Tandoori", "Tangerine", "Tarragon", "Thyme", "Tofu", "Truffle", "Tumeric", "Valerian", "Vanilla", "Vinegar", "Wasabi", "Walnut", "Watercress", "Watermelon", "Wheatgrass", "Yarrow", "Yuzu", "Zucchini"];
        return names[Math.floor(Math.random() * names.length)];
    }
}


class View extends Croquet.View {

    constructor(model) {
        super(model);
        this.time = model.time;
        this.model = model;
        this.has_init = false;
        console.log("viewId", this.viewId);
        this.subscribe("viewInfo", "refresh", this.refreshViewInfo);
        //this.publish("init", "scene", {viewId: this.viewId, time : (new Date()).getMilliseconds()});
        this.subscribe("scene", 'require', this.sendScene)
        this.subscribe("ops", 'distribution', this.setOPsDistribution);
        this.checkOPs();
        status.setViewId(this.viewId);
        //console.log("init view", this.viewId);

    }

    refreshViewInfo(){

    }
    setOPsDistribution(msg) {
        console.log("allrev", msg)
        if(msg.viewId !== this.viewId){
            status.setOPs(msg);
            console.log("rev", msg)
        }


    }
    sendScene(viewId){
        //if(this.viewId === viewId)
        //    return
        //status.requireScene(this.viewId, viewId);
        //this.sent_scene = true;
    }

    checkOPs() {
        let msg = status.checkOPs();
        if(!wu.isNull(msg)){
            msg.viewId = this.viewId;
            msg.viewTime = this.model.time;
            this.publish("ops", 'center', msg);
        }
        this.future(5).checkOPs();
    }


}

export  let register = (name, global_model) => {
   SandboxModel.register("SandboxModel");
   Croquet.Session.join({
      apiKey  : apiKey,
      appId   : 'edu.nyu.frl.' + name,
      name    : name,
      password: 'secret',
      model   : SandboxModel,
      view    : View,
      tps     : 1000 / 500,
   });
}