/*
export class World {

}
*/
import * as CANNON from 'cannon-es-control';
export class World {

    worldCANNON!: CANNON.World;

    public init(/*q_x : number,q_y : number,q_z: number,q_w: number*/){
         //console.log(q_x + " " + q_y + " " + q_z + " " + q_w);       
        //PHYSICS

        //INIT WORLD
        this.worldCANNON = new CANNON.World();
        this.worldCANNON.broadphase = new CANNON.SAPBroadphase(this.worldCANNON);
        this.worldCANNON.gravity.set(0, -9.81, 0);
        this.worldCANNON.defaultContactMaterial.friction = 0;
        //CONTACT MATERIAL
        var groundMaterial = new CANNON.Material('groundMaterial');
        var wheelMaterial = new CANNON.Material('wheelMaterial');
        var wheelGroundContactMaterial = new CANNON.ContactMaterial(wheelMaterial, groundMaterial, {
            friction: 2,
            restitution: 5,
            contactEquationStiffness: 1e2,
            contactEquationRelaxation: 8,
            frictionEquationStiffness: 1e2
        });
        this.worldCANNON.addContactMaterial(wheelGroundContactMaterial);
        //GROUND

        //var q = plane.quaternion;
        var planeBody = new CANNON.Body({
            mass: 0, // mass = 0 makes the body static
            material: groundMaterial,
            shape: new CANNON.Plane(),
            quaternion: new CANNON.Quaternion(-0.7071067811865475, 0, 0, 0.7071067811865476)
        });
        this.worldCANNON.addBody(planeBody);
    }
}