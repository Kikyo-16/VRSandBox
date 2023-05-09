import { g2 } from "../util/g2.js";
import {CreateInvitationMenuController} from "../sandbox/invitationMenuController.js";
import { controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";

export const init = async model => {

    model.setTable(false);
    model.setRoom(false);

    let userResponse = null;
    let debugPanel = model.add('cube').texture(() => {
        g2.setColor('white');
        g2.textHeight(0.1);
        g2.fillText( 'User Response : ' + userResponse, .5, 0.7 , 'center');        
    });

    let invitation_menu_controller = new CreateInvitationMenuController();
    
    model.animate(() => {
        let result = invitation_menu_controller.animate(model,'Rahul', 'collaborate' ,true);
        if(result != null){
            userResponse = result;
        }
        debugPanel.identity().hud().move(0.5,0.1, 0).scale(0.3,0.3,.0001);
   });

}

