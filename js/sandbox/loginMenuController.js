import { g2 } from "../util/g2.js";
import * as bc from "../sandbox/baseController.js"


export class CreateLoginMenuController {
    constructor() {
        let menu = undefined;
        let login_menu = undefined;
        let name_banner = undefined;

        this.init = (model) => {
            console.log("LOGIN MENU")
            menu = model.add('cube').opacity(0.0001).color(0,1,1);
            login_menu = menu.add('cube').texture(() => {
                g2.setColor('white');
                g2.fillRect(0.2,0,0.6,1);
                g2.setColor(0,0,1);
                g2.fillRect(.25,0.40,.5,0.45);
                g2.setColor('black');
                g2.textHeight(0.07);
                g2.fillText('Login', .5, .92, 'center');
                g2.drawWidgets(login_menu);
            });

            g2.addWidget(login_menu, 'button', 0.3, 0.5, '#ff0000', 'A', () => {login_menu.name_selected="A";});
            g2.addWidget(login_menu, 'button', 0.6, 0.5, '#ff0000', 'B', () => {login_menu.name_selected="B";});
            
            login_menu.name_selected = null;
            menu.move(0.3, .6, 0);
            login_menu.move(-0.4,0,0.1).turnY(0.4).scale(0.6, 0.35, .001);
            
        }
        this.animate = () =>{

            menu.identity().hud().move(0.2, .6, 0).scale(1.3);
            
            login_menu.opacity(login_menu.name_selected == null ? 1 : 0.0001);

            if(name_banner == undefined && login_menu.name_selected)
            {
                name_banner = menu.add('cube').texture(() => {
                    g2.setColor('white');
                    g2.fillRect(0.3,0,0.4,0.3);
                    g2.setColor(0,0,1);
                    g2.setColor('black');
                    g2.textHeight(0.07);
                    g2.fillText(login_menu.name_selected, .5, .15, 'center');
                    g2.drawWidgets(name_banner);
                });
                name_banner.move(-0.3,0.5,0.1).scale(0.6, 0.35, .001).color(1,0,0);
                name_banner.opacity(1);
            }
            return login_menu.name_selected;
        }
    }
}