/*global Sylvester */
/*global $V */

var Bone = function (length, rotationAxis){

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
    connectTo: function (bone){
        bone.boneMesh.add(this.boneMesh);
        //this.boneMesh.position.y += bone.length;
        this.boneMesh.translateY(bone.length/2 + this.length/2);
        console.log(bone.length);
       // this.boneMesh.position.x += 2;
    },

    update: function (theta){

        this.boneMesh.translateY(-this.length/2);

        this.boneMesh.rotateOnAxis(this.rotationAxis, theta);

        this.boneMesh.translateY(this.length/2);

    },

    //returns the endpoint in global coordinates
    getGlobalEndPos: function (){

        var e = new THREE.Vector3(0, this.length/2, 0);

        return this.boneMesh.localToWorld(e);
    },

    getGlobalStartPos: function (){

        var e = new THREE.Vector3(0, -this.length/2, 0);

        return this.boneMesh.localToWorld(e);
    },

    getGlobalRotationAxis: function (){

        var axis = this.rotationAxis.clone();

        axis.transformDirection(this.boneMesh.matrixWorld);

        return axis;
    },

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
