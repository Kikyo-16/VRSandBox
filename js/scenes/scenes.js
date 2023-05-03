import * as global from "../global.js";
import { Gltf2Node } from "../render/nodes/gltf2.js";

export default () => {
   global.scene().addNode(new Gltf2Node({
      url: ""
   })).name = "backGround";

   return {
      enableSceneReloading: false,
      scenes: [ 
         // { name: "DemoObjCtrTest"     , path: "./demoObjCtrTest.js"      },
         { name: "DemoSandBox"        , path: "./demoSandbox.js"      },
         // { name: "DemoSandBoxTest"    , path: "./demoSandboxTest.js"      },
         // { name: "DemoMenu"           , path: "./demoMenu.js"      },
         { name: "DemoAvatarTest"           , path: "./DemoAvatarTest.js"      },
         // { name: "DemoSandbox"        , path: "./demoSandbox.js"      },
      ]
   };
}

