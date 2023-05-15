import { g2 } from "../util/g2.js";
import {CreateLoginMenuController} from "../sandbox/loginMenuController.js";
import { controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";

export const init = async model => {

    model.setTable(false);
    model.setRoom(false);

    let userResponse = null;
    let debugPanel = model.add('cube').texture(() => {
        g2.setColor('white');
        g2.textHeight(0.1);
        g2.fillText( 'User Name : ' + userResponse, .5, 0.7 , 'center');        
    });

    let login_menu_controller = new CreateLoginMenuController();
    login_menu_controller.init(model);

    model.animate(() => {
        let result = login_menu_controller.animate(model);
        if(result != null){
            userResponse = result;
        }
        debugPanel.identity().hud().move(0.5,0.1, 0).scale(0.3,0.3,.0001);
   });

}

