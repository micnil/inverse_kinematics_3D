/*global Sylvester */
/*global $V */

var Bone = function (x, y, z, length){
    this.startPos = (x && y && z) ? $V([x, y, z]) : $V([0,0,0]);
    this.length = length || 10;
    this.endPos = $V([this.length, 0, 0]);
    this.rotationAxis = Sylvester.Vector.k;
    this.color = "#0000FF";
    this.geometry = new THREE.CylinderGeometry( 1, 1, this.length, 32 );
    this.material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    this.cylinder = new THREE.Mesh( this.geometry, this.material );
    this.cylinder.translateY(this.length/2); 
 
};

Bone.prototype = {

    connect: function (bone){
        this.startPos=bone.getGlobalEndPos();
    },

    rotateLocally: function (rad){
        //rotation matrix
        var rotation = Sylvester.Matrix.Rotation(rad, this.rotationAxis);

        this.endPos = rotation.x(this.endPos);

        //this.cylinder.translateY(-this.length/2); 
        this.cylinder.rotateOnAxis(new THREE.Vector3(0, 0, 1), rad);
        //  this.cylinder.translateY(this.length/2); 
    },

    getGlobalEndPos: function(){
        return this.startPos.add(this.endPos);
    }


};