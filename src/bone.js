/*global Sylvester */
/*global $V */

var Bone = function (length, rotationAxis){

    this.constraint=0; // the value used for second task
    this.jointLimit=1.2; //after this angle of rotation the rotation stops
    this.constraintAmplifier=0.0; //how much (%) of the rotation should be used as constraint
    this.length = length || 10;
    this.rotationAxis = rotationAxis || new THREE.Vector3(1, 0, 0);
    this.geometry = new THREE.CylinderGeometry( 0.5, 0.5, this.length, 32);
    this.material = new THREE.MeshPhongMaterial( {// light
        specular: '#a9fcff',
        // intermediate
        color: '#00abb1',
        // dark
        emissive: '#006063',
        shininess: 100 } );
    this.boneMesh = new THREE.Mesh( this.geometry, this.material );
    
};

Bone.prototype = {

    /**
    * adds 'this' mesh as child to bone and puts the child 
    * in right relative position
    */
    connectTo: function (bone){
        bone.boneMesh.add(this.boneMesh);
        this.boneMesh.translateY(bone.length/2 + this.length/2);
    },

    /**
    * Updates the rotation around a bones rotation axis
    * with theta radians
    */
    update: function (theta){

        //Constraint calculation
        this.constraintAmplifier = (Math.abs(this.boneMesh.rotation.x + theta) - 0.8) / (this.jointLimit-0.8);
        this.constraintAmplifier = Math.min(Math.max(this.constraintAmplifier, 0.0), 1.0);
        this.constraint = (-this.boneMesh.rotation.x)*this.constraintAmplifier ;

        this.boneMesh.translateY(-this.length/2);
        this.boneMesh.rotateOnAxis(this.rotationAxis, theta);
        this.boneMesh.translateY(this.length/2);
  

    },

    /**
    * returns the endpoint of the bone in global coordinates
    */
    getGlobalEndPos: function (){

        var e = new THREE.Vector3(0, this.length/2, 0);

        return this.boneMesh.localToWorld(e);
    },

    /**
    * returns the start point of the bone in global coordinates
    */
    getGlobalStartPos: function (){

        var e = new THREE.Vector3(0, -this.length/2, 0);

        return this.boneMesh.localToWorld(e);
    },

    /**
    * converts and returns the local rotation axis into
    * world space coordinates
    */
    getGlobalRotationAxis: function (){
        //console.log(this.boneMesh.worldToLocal(this.rotationAxis.clone()));
        var axis = this.rotationAxis.clone();

        axis.transformDirection(this.boneMesh.matrixWorld);
        //console.log(axis);
        return axis;
    },

    /**
    * converts and returns a local axis into
    * world space coordinates
    * axis number 1 = x, 2 = y, 3 = z
    */
    getGlobalAxis: function (axis_number){
        //console.log(this.boneMesh.worldToLocal(this.rotationAxis.clone()));
        var axis;
        switch (axis_number){
            case 1:
                axis = new THREE.Vector3(1, 0, 0);
                break;
            case 2:
                axis = new THREE.Vector3(0, 1, 0);
                break;
            case 3:
                axis = new THREE.Vector3(0, 0, 1);
                break;
            default:
                console.log("wat?");
        }

        axis.transformDirection(this.boneMesh.matrixWorld);

        return axis;
    },

};