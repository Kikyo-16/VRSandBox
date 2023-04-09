import * as cg from "../render/core/cg.js";



export let customClays = () => {
    clay.defineMesh('twoCubes', clay.combineMeshes([
      [ 'cube', cg.mTranslate(1,0,0  ), [1,.5,.5] ], // shape, matrix, color
      [ 'cube', cg.mScale    (.5,.5,2), [1,1,0  ] ], // shape, matrix, color
   ]));

}