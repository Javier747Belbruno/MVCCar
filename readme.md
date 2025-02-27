 
# PID Controller Car Simulator (Demo)

     
### > Go to Page [Link](https://javier747belbruno.github.io/car-control-simulation/)

![](https://javier747belbruno.github.io/car-control-simulation/assets/demo.png)

----


  #### Build The project


  ##### Make sure you installed Node.js and Git before start.
  
 ##### Clone the project
 `git clone https://github.com/Javier747Belbruno/car-control-simulation.git`

  ##### Change path to Project
  `cd car-control-simulation`

  ##### Install dependencies
  `npm i`
  
  ##### Build (Files to /dist)
  `npm run build`

  ##### Run in Developer Mode (Changes on the fly)
  `npm run dev`
 
  ##### Run in Developer Mode with Productions Files (Changes on the fly)
  `npm run serve`
   
  ---
  
##### Controller Code.

```typescript
const point = new CANNON.Vec3(0,0,100 ); // Objetive.

const constantsControl = {
  //Kp = Proptional Constant.
  Kp: 480,
//Kd = Derivative Constant.
  Kd: 900,
  //Ki = Integral Constant.
  Ki: 0
};
if(stateProgram==2){
const constFolder = gui.addFolder("Control Constants");
constFolder.add(constantsControl, "Kp", -200, 2000, 10)
constFolder.add(constantsControl, "Ki", -200, 2000, 10)
constFolder.add(constantsControl, "Kd", -200, 2000, 10)
constFolder.open();};

var P , I , D = 0;

var ek_1 = 0; 
var dt = 1/60;
var int = 0;
var u = 0;

function PID_Controller(){
  var refZ = chassisBody.position.z;
  var pointZ = point.z;
  //err = Expected Output - Actual Output;
  var e = refZ - pointZ;
  
  //Proptional action
  P = constantsControl.Kp * e;
  //Differential action
  D = constantsControl.Kd * (e - ek_1) / dt; 
  //Integral action
   I = constantsControl.Ki * int * dt;
  
  // u = Kp * err + (Ki * int * dt) + (Kd * der /dt) //Action
   u = P + I + D; 
  
  //Apply to Car.
  EngineForceVal(u);
  
  //der  = err - err from previous loop; ( i.e. differential error)
  ek_1 = e;
  //int  = int from previous loop + err; ( i.e. integral error )
  int = int + e;
}
```

  
----
                    
### Button Configuration:
                    

| Key  | Action |
| ------------- | ------------- |
| w  | Accelerator   |
| Space key  | Brake  |
| s  | Reverse  |
| a  | Turn Left  |
| d  | Turn Right  |
| Number 1 key  | Chase Camera  |
| Number 2 key  | Chase Camera Side  |

----

#### How it works? Non-technical Explanation.


Cannon-es is a lightweight 3D physics engine written in JavaScript.
All Objects, forces and interactions are simulated here (Cannon-es is Pure maths).

This world is invisible, so we need a library that can create a "skin" for those objects and makes them "visible".


That library is Three.js (JavaScript 3D Library).

Basically we need Lights, Camera and Meshes (Geometry+Material) for see an Scene on the Screen.


For bind that 3D object which have to be same shape and dimensions with the physic object. 

We do something like this:

THREE.Scene.skinObject.position.set( CANNON.world.physicObject.position ); //Update all the time.

This way the "skin" follows the body and we can see on screen what is going on in the physics world.

----
                
  #### FlowChart
  
  Somehow, this Javascript code works like an Arduino code is works on a microcontroller:

  First Setup, then Render (Loop Function).

  ![](https://javier747belbruno.github.io/car-control-simulation/assets/flowchart.png)

 
----

#### task list

- [x] Start Menu.
- [x] Free Drive.
- [x] Simulation Changes on the fly (dat.gui).
- [ ] Corrections to PID formula.
- [ ] Create an HTML with all functionality inside (Typescript to Javascript legible).
- [ ] Create a follow path Car Simulation (Maybe is another project).

----

 #### Credits
   ##### Technologies
  - Typescript by Microsoft.
  - Node.js by OpenJS Foundation.
   - Three.js by Mr.doob.
   - Cannon.js (Cannon-es) by Stefan Hedman, Poimandres Community and Marco Fugaro . 
   - Dat.gui by Google Data Arts Team.
- Vite.js by Evan You & Vite Contributors.

   ######  Thanks for provide free open source software to the community making this 	possible. 

##### Blogs and people that make life easier.
   - Handling Multiple Key Presses at Once in Vanilla JavaScript (for Game Controllers) by Nicky Dover.
   - How to Build a Multiplayer (.io) Web Game by Victor Zhou.
   - Bruno Simon — Portfolio (case study) by Bruno Simon.

 