import { g2 } from "../util/g2.js";
import {CreateShareMenuController} from "../sandbox/shareMenuController.js";

export const init = async model => {

    model.setTable(false);
    model.setRoom(false);

    let user = null;
    let op = null;

    //  Debug Panel
    let debugPanel = model.add('cube').texture(() => {
        g2.setColor('white');
        g2.textHeight(0.1);
        g2.fillText( 'User : ' + user, .5, 0.7 , 'center');
        g2.fillText( 'OP   : ' + op  , .5, 0.3 , 'center');
        
    });

    let share_menu_controller = new CreateShareMenuController();
    let playerNames = ['Rahul', 'Zhiqi', 'Lewei', 'Namrata',"Hello"];

    model.animate(() => {
        let selection = share_menu_controller.animate(model, playerNames);
        if(selection.user != null){
            user = selection.user;
            op = selection.op;
        }
        
        debugPanel.identity().hud().move(0.5,0.1, 0).scale(0.3,0.3,.0001);
   });

}

