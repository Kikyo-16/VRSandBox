import * as cg from "../render/core/cg.js";



export let customClays = () => {
   

   // Table
   let scaleTablX = 1;
   let scaleTablY = 0.1;
   let scaleTableZ = 1;

   let tableTop = cg.scaleO(cg.mTranslate(0,0,0),scaleTablX,scaleTablY,scaleTableZ);

   let tableLeg1 = cg.scaleO(cg.mTranslate(-0.9,-0.5,0.9),0.05,0.5,0.05);
   let tableLeg2 = cg.scaleO(cg.mTranslate(0.9,-0.5,0.9),0.05,0.5,0.05);
   let tableLeg3 = cg.scaleO(cg.mTranslate(-0.9,-0.5,-0.9),0.05,0.5,0.05);
   let tableLeg4 = cg.scaleO(cg.mTranslate(0.9,-0.5,-0.9),0.05,0.5,0.05);


   clay.defineMesh('table', clay.combineMeshes([
      [ 'cube',  tableTop,  [ 1, 1, 1]],
      [ 'tubeY', tableLeg1, [ 0.05, 0.05, 0.05]],
      [ 'tubeY', tableLeg2, [ 0.05, 0.05, 0.05]],
      [ 'tubeY', tableLeg3, [ 0.05, 0.05, 0.05]],
      [ 'tubeY', tableLeg4, [ 0.05, 0.05, 0.05]],
   ]));

   // Chair
   let chairTop  = cg.scaleO(cg.mTranslate(0,0,0),0.45,0.05,0.5);
   let chairBack1 = cg.scaleO(cg.mTranslate(-0.18,0.45,-0.5),0.06,0.5,0.05);
   let chairBack2 = cg.scaleO(cg.mTranslate(-0.4,0.45,-0.5),0.06,0.5,0.05);
   let chairBack3 = cg.scaleO(cg.mTranslate(0.18,0.45,-0.5),0.06,0.5,0.05);
   let chairBack4 = cg.scaleO(cg.mTranslate(0.4,0.45,-0.5),0.06,0.5,0.05);
   let chairBack5 = cg.scaleO(cg.mTranslate(0,1,-0.5),0.51,0.06,0.05);
   
   let chairLeg1 = cg.scaleO(cg.mTranslate(-0.4,-0.5,0.4),0.05,0.5,0.05);
   let chairLeg2 = cg.scaleO(cg.mTranslate(0.4,-0.5,0.4),0.05,0.5,0.05);
   let chairLeg3 = cg.scaleO(cg.mTranslate(-0.4,-0.5,-0.4),0.05,0.5,0.05);
   let chairLeg4 = cg.scaleO(cg.mTranslate(0.4,-0.5,-0.4),0.05,0.5,0.05);


   clay.defineMesh('chair', clay.combineMeshes([
      [ 'cube',  chairTop,   [ 0.8, 0.8, 0.8]],
      [ 'cube',  chairBack1,  [ 1, 1, 1]],
      [ 'cube',  chairBack2,  [ 1, 1, 1]],
      [ 'cube',  chairBack3,  [ 1, 1, 1]],
      [ 'cube',  chairBack4,  [ 1, 1, 1]],
      [ 'cube',  chairBack5,  [ 1, 1, 1]],
      [ 'tubeY', chairLeg1, [ 0.05, 0.05, 0.05]],
      [ 'tubeY', chairLeg2, [ 0.05, 0.05, 0.05]],
      [ 'tubeY', chairLeg3, [ 0.05, 0.05, 0.05]],
      [ 'tubeY', chairLeg4, [ 0.05, 0.05, 0.05]],
   ]));

   // Bed
   let bedTop = cg.scaleO(cg.mTranslate(0,0.1,0),1,0.15,0.7);
   let bedTopBase = cg.scaleO(cg.mTranslate(0,-0.1,0),1.05,0.2,0.75);

   let bedLeg1 = cg.scaleO(cg.mTranslate(-0.85,-0.3,0.55) ,0.06,0.1,0.06);
   let bedLeg2 = cg.scaleO(cg.mTranslate(0.85,-0.3,0.55)  ,0.06,0.1,0.06);
   let bedLeg3 = cg.scaleO(cg.mTranslate(-0.85,-0.3,-0.55),0.06,0.1,0.06);
   let bedLeg4 = cg.scaleO(cg.mTranslate(0.85,-0.3,-0.55) ,0.06,0.1,0.06);


   clay.defineMesh('bed', clay.combineMeshes([
      [ 'cube',  bedTop,  [ 1, 1, 1]],
      [ 'cube',  bedTopBase,  [ 0.5, 0.5, 0.5]],
      [ 'tubeY', bedLeg1, [ 0.05, 0.05, 0.05]],
      [ 'tubeY', bedLeg2, [ 0.05, 0.05, 0.05]],
      [ 'tubeY', bedLeg3, [ 0.05, 0.05, 0.05]],
      [ 'tubeY', bedLeg4, [ 0.05, 0.05, 0.05]],
   ]));


   // Table Storage
   let tableStorageTop = cg.scaleO(cg.mTranslate(0,0.42,0) ,1.01,0.03,0.41);
   let tableStorageBase = cg.scaleO(cg.mTranslate(0,0,0),1,0.4,0.4);

   let tableStorageLeftTop = cg.scaleO(cg.mTranslate(-0.73,0.18,0.32),0.22,0.17,0.1);
   let tableStorageLeftTopHandle = cg.scaleO(cg.mTranslate(-0.73,0.30,0.34),0.08,0.008,0.1);
   
   let tableStorageLeftBottom = cg.scaleO(cg.mTranslate(-0.73,-0.18,0.32),0.22,0.17,0.1);
   let tableStorageLeftBottomHandle = cg.scaleO(cg.mTranslate(-0.73,-0.065,0.34),0.08,0.008,0.1);
   
   let tableStorageRightTop = cg.scaleO(cg.mTranslate(0.73,0.18,0.32),0.22,0.17,0.1);
   let tableStorageRightTopHandle = cg.scaleO(cg.mTranslate(0.73,0.30,0.34),0.08,0.008,0.1);
   
   let tableStorageRightBottom = cg.scaleO(cg.mTranslate(0.73,-0.18,0.32),0.22,0.17,0.1);
   let tableStorageRightBottomHandle = cg.scaleO(cg.mTranslate(0.73,-0.065,0.34),0.08,0.008,0.1);
   
   let tableStoragCenterLeft = cg.scaleO(cg.mTranslate(-0.25,0,0.38),0.22,0.35,0.05);
   let tableStoragCenterLeftHandle = cg.scaleO(cg.mTranslate(-0.1,0,0.35),0.008,0.08,0.1);
   
   let tableStoragCenterRight = cg.scaleO(cg.mTranslate(0.25,0,0.38),0.22,0.35,0.05);
   let tableStoragCenterRightHandle = cg.scaleO(cg.mTranslate(0.1,0,0.35),0.008,0.08,0.1);
   
   clay.defineMesh('table-storage', clay.combineMeshes([
      [ 'cube',  tableStorageTop,  [ 1, 1, 1]],
      [ 'cube',  tableStorageBase,  [ 0.4, 0.4, 0.4]],
      [ 'cube',  tableStorageLeftTop,  [ 1, 1, 1]],
      [ 'cube',  tableStorageLeftTopHandle,  [ 0.8, 0.8, 0.8]],
      [ 'cube',  tableStorageLeftBottom,  [ 1, 1, 1]],
      [ 'cube',  tableStorageLeftBottomHandle,  [ 0.8, 0.8, 0.8]],
      [ 'cube',  tableStorageRightTop,  [ 1, 1, 1]],
      [ 'cube',  tableStorageRightTopHandle,  [ 0.8, 0.8, 0.8]],
      [ 'cube',  tableStorageRightBottom,  [ 1, 1, 1]],
      [ 'cube',  tableStorageRightBottomHandle,  [ 0.8, 0.8, 0.8]],
      [ 'cube',  tableStoragCenterLeft,  [ 1, 1, 1]],
      [ 'cube',  tableStoragCenterLeftHandle,  [ 0.8, 0.8, 0.8]],
      [ 'cube',  tableStoragCenterRight,  [ 1, 1, 1]],
      [ 'cube',  tableStoragCenterRightHandle,  [ 0.8, 0.8, 0.8]],
   ]));


   // Lamp
   let tableLampTop   = cg.scaleO(cg.mTranslate(0,0.5,0),0.3,0.25,0.3);
   let tableLampStand = cg.scaleO(cg.mTranslate(0,0,0),0.02,0.4,0.02);
   let tableLampBase  = cg.scaleO(cg.mTranslate(0,-0.4,0),0.25,0.03,0.25);

   clay.defineMesh('lamp-small', clay.combineMeshes([
      [ 'tubeY',  tableLampTop,  [ 1, 1, 1]],
      [ 'tubeY', tableLampStand,[ 0.05, 0.05, 0.05]],
      [ 'tubeY', tableLampBase, [ 0.5, 0.5, 0.5]],
      
   ]));


   // Fridge
   let fridgeBase   = cg.scaleO(cg.mTranslate(0,0,0),0.4,0.8,0.4);
   let fridgeUpperDoor = cg.scaleO(cg.mTranslate(0,0.46,0.4),0.36,0.3,0.01);
   let fridgeUpperDoorHandle = cg.scaleO(cg.mTranslate(0.3,0.27,0.41),0.01,0.07,0.01);
   let fridgeBottomDoor  = cg.scaleO(cg.mTranslate(0,-0.33,0.4),0.36,0.45,0.01);
   let fridgeBottomDoorHandle  = cg.scaleO(cg.mTranslate(0.3,-0.01,0.41),0.01,0.1,0.01);

   clay.defineMesh('fridge', clay.combineMeshes([
      [ 'cube',  fridgeBase,  [ 0.8, 0.8, 0.8]],
      [ 'cube', fridgeUpperDoor,[ 0.7, 0.7, 0.7]],
      [ 'cube', fridgeUpperDoorHandle, [ 0.3, 0.3, 0.3]],
      [ 'cube', fridgeBottomDoor,[ 0.7, 0.7, 0.7]],
      [ 'cube', fridgeBottomDoorHandle, [ 0.3, 0.3, 0.3]],
   ]));


   return [ "table", "chair", "bed", "table-storage", "lamp-small", "fridge"];//, "microwave"

}