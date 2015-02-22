/*global Sylvester */
/*global $V */

var Bone = function (length, rotationAxis, parent, mesh){

    this.constraint=0; // the value used for second task
    this.jointLimit=1.2; //after this angle of rotation the rotation stops
    this.constraintAmplifier=0.0; //how much (%) of the rotation should be used as constraint
    this.length = length || 10;
    this.rotationAxis = rotationAxis || new THREE.Vector3(1, 0, 0);
    this.boneMesh = mesh;
    console.log("mesh: %s",this.boneMesh);
    if(parent instanceof Bone){
        parent.boneMesh.add(this.boneMesh);
        console.log("parent: %s", this.boneMesh.parent);
        this.boneMesh.translateY(parent.length/2 + this.length/2);
    }else{
        parent.add(this.boneMesh);
        console.log("parent: %s", this.boneMesh.parent);
    }
};

Bone.prototype = {

    /**
    * Updates the rotation around a bones rotation axis
    * with theta radians
    */
    update: function (theta){

        //Constraint calculation
        this.constraintAmplifier = (Math.abs(this.boneMesh.rotation.x + theta) - 0.8) / (this.jointLimit-0.8);
        this.constraintAmplifier = Math.min(Math.max(this.constraintAmplifier, 0.0), 1.0);
        this.constraint = (-this.boneMesh.rotation.x)*this.constraintAmplifier;

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
    */
    getGlobalAxis: function (axis){

        axis.transformDirection(this.boneMesh.matrixWorld);

        return axis;
    },

};
