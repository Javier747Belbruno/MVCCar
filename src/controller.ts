import * as THREE from 'three';
//import THREE,{ PerspectiveCamera,PlaneGeometry, Renderer } from 'three';
import * as CANNON from 'cannon-es-control';
import { GUI } from 'dat.gui';

import {UserInterface} from './userInterface';
import { World } from './Entities/world';

export class Controller {

    ui: UserInterface = new UserInterface;
    camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera();
    scene: THREE.Scene = new THREE.Scene();
    box!: THREE.Mesh;
    vehicle!: CANNON.RaycastVehicle;
    world: World = new World();
    chassisBody!: CANNON.Body;
    wheelBodies: CANNON.Body[] = [];
    wheelVisuals: any = [];
    renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer( { antialias: true, alpha: true });
    stateProgram = 1; //0 Start Screen.  //1 Free Drive. //2 PIDController.
    cameraOption = 2; //1 Chase Camera // 2 Chase Camera Side.  
    controllerMap: Map<number,{ pressed: boolean, funcPress: Function, funcUnPress: Function}> = new Map<number,{ pressed: boolean, funcPress: Function, funcUnPress: Function}>();
    carConst = {
        //Motor Force Limit.
        engineForceLimit: 3000,
        //Angle Steering.
        SteeringValLimit: 0.3,
        //Brake Force.
        brakeForceLimit: 200
    };

    public Controller(): void {    
        
    }

    public start() {
        this.ui.start(this);
    }

    public updateCamera(w: number, h: number) {
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
    }

    public init() {


    
        var geometry = new THREE.PlaneGeometry(10, 10, 10);
        var material = new THREE.MeshBasicMaterial({ color: 0xcc1122, side: THREE.DoubleSide });
        var plane = new THREE.Mesh(geometry, material);
        plane.rotation.x = Math.PI / 2;
        this.scene.add(plane);

        var geometry = new THREE.PlaneGeometry(10, 10, 10);
        var material = new THREE.MeshBasicMaterial({ color: 0x00ff22, side: THREE.DoubleSide });
        var plane = new THREE.Mesh(geometry, material);
        plane.rotation.x = Math.PI / 2;
        plane.position.set(0, 0, 100);
        this.scene.add(plane);


        var sunlight = new THREE.DirectionalLight(0xffffff, 1.0);
        sunlight.position.set(-10, 10, 0);
        this.scene.add(sunlight)

        
        //Physics


        this.world.worldCANNON = new CANNON.World();
        this.world.worldCANNON.broadphase = new CANNON.SAPBroadphase(this.world.worldCANNON);
        this.world.worldCANNON.gravity.set(0, -9.81, 0);
        this.world.worldCANNON.defaultContactMaterial.friction = 0;

        var groundMaterial = new CANNON.Material('groundMaterial');
        var wheelMaterial = new CANNON.Material('wheelMaterial');
        var wheelGroundContactMaterial = new CANNON.ContactMaterial(wheelMaterial, groundMaterial, {
            friction: 2,
            restitution: 5,
            contactEquationStiffness: 1e2,
            contactEquationRelaxation: 8,
            frictionEquationStiffness: 1e2
        });

        this.world.worldCANNON.addContactMaterial(wheelGroundContactMaterial);

        // car physics body
        var chassisShape = new CANNON.Box(new CANNON.Vec3(1, 0.3, 2));
        this.chassisBody = new CANNON.Body({ mass: 1600 });
        this.chassisBody.addShape(chassisShape);
        this.chassisBody.position.set(0, 1, 0);
        this.chassisBody.angularVelocity.set(0,0, 0); // initial velocity

        //Grid Helper
        const gridHelper = new THREE.GridHelper(500, 100);
        this.scene.add(gridHelper)

        // car visual body
        var geometry1 = new THREE.BoxGeometry(2, 0.6, 4); // double chasis shape
        var materia1l = new THREE.MeshPhongMaterial({
            color: 0xfffff,
            emissive: 0xB1D8B7,
            side: THREE.DoubleSide,
            flatShading: true,
        });
        //var materia1l = new THREE.MeshStandardMaterial({  });
        this.box = new THREE.Mesh(geometry1, materia1l);
        this.scene.add(this.box);

        // parent vehicle object
        this.vehicle = new CANNON.RaycastVehicle({
            chassisBody: this.chassisBody,
            indexRightAxis: 0, // x
            indexUpAxis: 1, // y
            indexForwardAxis: 2, // z
        });

        // wheel options
        var options = {
            radius: 0.3,
            directionLocal: new CANNON.Vec3(0, -1, 0),
            suspensionStiffness: 50,
            suspensionRestLength: 0.75,
            frictionSlip: 2.5,
            dampingRelaxation: 2.3,
            dampingCompression: 4.5,
            maxSuspensionForce: 200000,
            rollInfluence: 0.1,
            axleLocal: new CANNON.Vec3(-1, 0, 0),
            chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0),
            maxSuspensionTravel: 0.3,
            //customSlidingRotationalSpeed: -1,
            customSlidingRotationalSpeed: -10,
            useCustomSlidingRotationalSpeed: true,
        };

        var axlewidth = 0.7;
        options.chassisConnectionPointLocal.set(axlewidth, 0, -1);
        this.vehicle.addWheel(options);

        options.chassisConnectionPointLocal.set(-axlewidth, 0, -1);
        this.vehicle.addWheel(options);

        options.chassisConnectionPointLocal.set(axlewidth, 0, 1);
        this.vehicle.addWheel(options);

        options.chassisConnectionPointLocal.set(-axlewidth, 0, 1);
        this.vehicle.addWheel(options);

        this.vehicle.addToWorld(this.world.worldCANNON);

        // car wheels

        this.vehicle.wheelInfos.forEach( (wheel: any) => {
            var shape = new CANNON.Cylinder(wheel.radius, wheel.radius, wheel.radius / 2, 20);
            var body = new CANNON.Body({ mass: 8, material: wheelMaterial });
            var q = new CANNON.Quaternion();
            q.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);
            body.addShape(shape, new CANNON.Vec3(), q);
            this.wheelBodies.push(body);
            // wheel visual body
            var geometry = new THREE.CylinderGeometry(wheel.radius, wheel.radius, 0.4, 32);
            var material = new THREE.MeshPhongMaterial({
                color: 0xd0901d,
                emissive: 0x1101aa,
                side: THREE.DoubleSide,
                flatShading: true,
            });
            var cylinder = new THREE.Mesh(geometry, material);
            cylinder.geometry.rotateZ(Math.PI / 2);
            this.wheelVisuals.push(cylinder);
            this.scene.add(cylinder);
        });

        // update the wheels to match the physics
        this.world.worldCANNON.addEventListener('postStep',  () => {
            for (var i = 0; i < this.vehicle.wheelInfos.length; i++) {
                this.vehicle.updateWheelTransform(i);
                var t = this.vehicle.wheelInfos[i].worldTransform;
                // update wheel physics
                this.wheelBodies[i].position.copy(t.position);
                this.wheelBodies[i].quaternion.copy(t.quaternion);
                // update wheel visuals
                this.wheelVisuals[i].position.copy(t.position);
                this.wheelVisuals[i].quaternion.copy(t.quaternion);
            }
        });

        var q = plane.quaternion;
        var planeBody = new CANNON.Body({
            mass: 0, // mass = 0 makes the body static
            material: groundMaterial,
            shape: new CANNON.Plane(),
            quaternion: new CANNON.Quaternion(-q.x, q.y, q.z, q.w)
        });
        this.world.worldCANNON.addBody(planeBody);

    }
    public getRenderer(): THREE.Renderer {
        return this.renderer;
    }

    public simulation(w: number,h: number) {


        this.camera = new THREE.PerspectiveCamera(75, w / h, 0.001, 100);

        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(w, h); 



        //var initialTime: number;


        //DAT GUI
        var gui = new GUI();


        this.init();

        
        

        this.controllerMap.set(87, { pressed: false, funcPress: this.forward.bind(this), funcUnPress: this.NotEngineForce.bind(this) });
        this.controllerMap.set(32, { pressed: false, funcPress: this.brake.bind(this), funcUnPress: this.unbrake.bind(this) });
        this.controllerMap.set(83, { pressed: false, funcPress: this.backward.bind(this), funcUnPress: this.NotEngineForce.bind(this) });
        this.controllerMap.set(68, { pressed: false, funcPress: this.right.bind(this), funcUnPress: this.releaseSteering.bind(this) });
        this.controllerMap.set(65, { pressed: false, funcPress: this.left.bind(this), funcUnPress: this.releaseSteering.bind(this) });

        //const point = new CANNON.Vec3(0, 0, 100); // Objetive.

        const constantsControl = {
            //Kp = Proptional Constant.
            Kp: 480,
            //Kd = Derivative Constant.
            Kd: 900,
            //Ki = Integral Constant.
            Ki: 0
        };
        if (this.stateProgram == 2) {
            const constFolder = gui.addFolder("Control Constants");
            constFolder.add(constantsControl, "Kp", -200, 2000, 10)
            constFolder.add(constantsControl, "Ki", -200, 2000, 10)
            constFolder.add(constantsControl, "Kd", -200, 2000, 10)
            constFolder.open();
        };

        /*var P, I, D = 0;

        var ek_1 = 0;
        var dt = 1 / 60;
        var int = 0;
        var u = 0;*/

        /*const PID_Controller = () => {
            var refZ = this.chassisBody.position.z;
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
            u = P + I + D; //I

            EngineForceVal(u);

            //der  = err - err from previous loop; ( i.e. differential error)
            ek_1 = e;
            //int  = int from previous loop + err; ( i.e. integral error )
            int = int + e;
        }*/



        const phyFolder = gui.addFolder("Car Constants");
        phyFolder.add(this.carConst, "engineForceLimit", 0, 10000, 10);
        phyFolder.add(this.carConst, "SteeringValLimit", 0, 1, 0.01);
        phyFolder.add(this.carConst, "brakeForceLimit", 0, 1000, 10);
        phyFolder.open();

        





        /*

        const updatePhysics = () => {
            this.world.step(1 / 60);
            // update the chassis position
            this.box.position.copy(new THREE.Vector3(this.chassisBody.position.x, this.chassisBody.position.y, this.chassisBody.position.z));
            this.box.quaternion.copy(new THREE.Quaternion(this.chassisBody.quaternion.x, this.chassisBody.quaternion.y, this.chassisBody.quaternion.z, chassisBody.quaternion.w));
        }*/

 



        //var winnerInfo = '';
        /*const UpdateInfo = () => {
            CurrentTime = String((Date.now() - initialTime) / 1000);
            infoHtmlElement.innerText = "Signal: " + String(Math.round(u))
                + "\n" + "EngineForce Left Rear Wheel:" + String(Math.round(this.vehicle.wheelInfos[2].engineForce))
                + "\n" + "EngineForce Right Rear Wheel:" + String(Math.round(this.vehicle.wheelInfos[3].engineForce))
                + "\n" + "Steering:" + String(this.vehicle.wheelInfos[2].steering)
                + "\n" + "Body Position:  x: " + String(Math.round(this.vehicle.chassisBody.position.x)) + ", y: " + String(Math.round(this.vehicle.chassisBody.position.y)) + " , z: " + String(Math.round(this.vehicle.chassisBody.position.z))
                + "\n" + "Vehicle.sliding:" + String(this.vehicle.sliding)
                + "\n" + "ChassisBody.velocity  x: " + String(Math.round(this.vehicle.chassisBody.velocity.x)) + ", y: " + String(Math.round(this.vehicle.chassisBody.velocity.y)) + " , z: " + String(Math.round(this.vehicle.chassisBody.velocity.z))
                + "\n" + "Time (Seconds): " + CurrentTime;
            + winnerInfo
                ;
        }*/

        //var winningTime = "timeless";
        /*const DidYouWin = () => {
            if (winningTime == "timeless") {
                if (Math.round(this.vehicle.chassisBody.velocity.z) == 0 && Math.round(this.vehicle.chassisBody.position.z) == 100) {
                    winningTime = CurrentTime;
                    winnerInfo = "\n" + "Winning Time (Seconds): " + winningTime;
                    window.alert(winnerInfo);
                }
            }
        }*/



        var initialTime = Date.now();
        //var CurrentTime: string;
        console.log("Initial Times: " + initialTime);
        if (this.stateProgram == 2) {
            setTimeout(() => {
                this.render();
            }, 2000);
        } else {
            this.render();
        }




    }
    
    public render() {
        //this.EngineForceValue(-3000);
        //this.vehicle.wheelInfos[2].engineForce = -3000;
        //console.log("render");
        requestAnimationFrame(this.render.bind(this));
        this.executeMoves();
        //if (this.stateProgram == 2) { PID_Controller(); }
        this.Camera();
        this.renderer.render(this.scene, this.camera);
        this.updatePhysics();
        //UpdateInfo();
        //DidYouWin();
    }
    private updatePhysics(){
        this.world.worldCANNON.step(1 / 60);
        // update the chassis position
        this.box.position.copy(new THREE.Vector3(this.chassisBody.position.x, this.chassisBody.position.y, this.chassisBody.position.z));
        this.box.quaternion.copy(new THREE.Quaternion(this.chassisBody.quaternion.x, this.chassisBody.quaternion.y, this.chassisBody.quaternion.z, this.chassisBody.quaternion.w));
        //console.log(this.box.position);
    }
    
    private executeMoves() {
        //this.box.position.add(new THREE.Vector3(this.chassisBody.velocity.x, this.chassisBody.velocity.y, this.chassisBody.velocity.z));
        for (let [key, value] of this.controllerMap) {
            if (value.pressed) {
                value.funcPress();
            } else {
                //fix here  
                if (key == 32 || key == 68 || key == 87) {
                    value.funcUnPress();
                }
            }
        }
    }
    public navigate(e: KeyboardEvent) {
       if (e.type == 'keydown') {
            if (this.controllerMap.get(e.keyCode)) {
                this.controllerMap.set(e.keyCode, { pressed: true, funcPress: this.controllerMap.get(e.keyCode)!.funcPress, funcUnPress: this.controllerMap.get(e.keyCode)!.funcUnPress });
            }
            this.changeCamera(e.keyCode);
        }
        if (e.type == 'keyup') {
            if (this.controllerMap.get(e.keyCode)) {
                this.controllerMap.set(e.keyCode, { pressed: false, funcPress: this.controllerMap.get(e.keyCode)!.funcPress, funcUnPress: this.controllerMap.get(e.keyCode)!.funcUnPress });
            }
        }
    }
    public chaseCameraSide() {
        var cameraOffset;
        var relativeCameraOffset;
        relativeCameraOffset = new THREE.Vector3(-10, 4, -18);
        cameraOffset = relativeCameraOffset.applyMatrix4(this.box.matrixWorld);
        this.camera.position.x = cameraOffset.x;
        this.camera.position.y = cameraOffset.y;
        this.camera.position.z = cameraOffset.z;
        this.camera.lookAt(new THREE.Vector3(this.vehicle.chassisBody.position.x, this.vehicle.chassisBody.position.y, this.vehicle.chassisBody.position.z));
    }

    public chaseCamera() {
        var cameraOffset;
        var relativeCameraOffset;
        relativeCameraOffset = new THREE.Vector3(0, 4, -6);
        cameraOffset = relativeCameraOffset.applyMatrix4(this.box.matrixWorld);
        this.camera.position.x = cameraOffset.x;
        this.camera.position.y = cameraOffset.y;
        this.camera.position.z = cameraOffset.z;
        this.camera.lookAt(new THREE.Vector3(this.vehicle.chassisBody.position.x, this.vehicle.chassisBody.position.y, this.vehicle.chassisBody.position.z));
    }

    public Camera() {
        switch (this.cameraOption) {
            case 1:
                this.chaseCamera();
                break;
            case 2:
                this.chaseCameraSide();
            default:
                break;
        }
    }
    public changeCamera(keyCode: number) {
        switch (keyCode) {
            case 49:
                this.cameraOption = 1;
                break;
            case 50:
                this.cameraOption = 2;
            default:
                break;
        }
    }
    private EngineForceVal(value: number){
        //Limit Signal
        if(value > this.carConst.engineForceLimit){
            value = this.carConst.engineForceLimit; 
        }
        if(value < -this.carConst.engineForceLimit){
            value = -this.carConst.engineForceLimit; 
        }
        for (let index = 0; index < 4; index++) {
            this.vehicle.applyEngineForce(value, index); 
        }
    }
    
    private BrakeValApplied(value: number){
        for (let index = 0; index < 2; index++) {
            this.vehicle.setBrake(value, index);
        }
    }
    private SteeringVal(value: number){
        this.vehicle.setSteeringValue(value, 2);
        this.vehicle.setSteeringValue(value, 3);
    }

    private forward() {
        console.log(this);
        //console.log(this.carConst);
        this.EngineForceVal(-this.carConst.engineForceLimit);
    }
    private backward() {
        this.EngineForceVal(this.carConst.engineForceLimit);
    }
    private NotEngineForce() {
        this.EngineForceVal(0);
    }

    private brake() {
        this.BrakeValApplied(this.carConst.brakeForceLimit);
    }
    private unbrake() {
        this.BrakeValApplied(0);
    }

    private right() {
        this.SteeringVal(-this.carConst.SteeringValLimit);
    }

    private left() {
        this.SteeringVal(this.carConst.SteeringValLimit);
    }

    private releaseSteering() {
        this.SteeringVal(0);
    }
}
