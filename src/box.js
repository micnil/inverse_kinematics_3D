var Box = function (type, x, y, z){

    this.type = type;
    switch(this.type){
        case 1:
            this.color = '#ff0000';
            this.target = IK.boxBaseRed;
            break;
        case 2:
            this.color = '#00ff00';
            this.target = IK.boxBaseGreen;
            break;      
        case 3:  
            this.color = '#0000ff';
            this.target = IK.boxBaseBlue;
            break;      
    }

    //Three shapes
    var boxGeometry = new THREE.BoxGeometry(1, 1, 1),
        boxMaterial = new THREE.MeshPhongMaterial( {
            ambient: 0x030303, 
            color: this.color, 
            specular: 0x009900, 
            shininess: 30, 
            shading: THREE.FlatShading} );

    this.boxMesh = new THREE.Mesh( boxGeometry, boxMaterial );
    this.boxMesh.castShadow = true;

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
    },

    highlight: function (){

        switch(this.type){
            case 1:
                this.boxMesh.material.color.setRGB(1,0.7,0.7);
                break;
            case 2:
                this.boxMesh.material.color.setRGB(0.7,1,0.7);
                break;      
            case 3:  
                this.boxMesh.material.color.setRGB(0.7,0.7,1);
                break;      
        }
    },
    repaint: function (){

        switch(this.type){
            case 1:
                this.boxMesh.material.color.setRGB(1,0,0);
                break;
            case 2:
                this.boxMesh.material.color.setRGB(0,1,0);
                break;      
            case 3:  
                this.boxMesh.material.color.setRGB(0,0,1);
                break;      
        }
    }
}