var Box = function (x, y, z){

    //Three shapes
    var boxGeometry = new THREE.BoxGeometry(1, 1, 1),
        boxMaterial = new THREE.MeshPhongMaterial( {
            ambient: 0x030303, 
            color: 0x00ff00, 
            specular: 0x009900, 
            shininess: 30, 
            shading: THREE.FlatShading} );

    this.boxMesh = new THREE.Mesh( boxGeometry, boxMaterial );
    //Cannon bodies
    var boxShape = new CANNON.Box(new CANNON.Vec3(0.5,0.5,0.5));

    this.boxBody = new CANNON.Body({
            mass: 10
        });
    this.boxBody.addShape(boxShape);
    this.boxBody.position.set(x, y, z);

    this.physicsEnabled = true;
};

Box.prototype = {

    moveBodyToMesh: function (){
        this.boxBody.position.copy(this.boxMesh.position);
        this.boxBody.quaternion.copy(this.boxMesh.quaternion);
    },

    moveMeshToBody: function (){
        this.boxMesh.position.copy(this.boxBody.position);
        this.boxMesh.quaternion.copy(this.boxBody.quaternion);
    },

    position: function (){
        return this.boxMesh.position;
    }
}