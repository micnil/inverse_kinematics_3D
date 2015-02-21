"use strict";
/*global Bone */
/*global Sylvester */
/*global $M */
/*global $V */

var IK = IK || {};

IK.mouse = new THREE.Mesh( new THREE.SphereGeometry( 1, 24, 24 ), new THREE.MeshPhongMaterial( {
        // light
        specular: '#a9fcff',
        // intermediate
        color: '#00FF00',
        // dark
        emissive: '#006063',
        shininess: 100 } ) );       


IK.main = function (){

    var scene = new THREE.Scene(),
        camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 ),
        renderer = new THREE.WebGLRenderer(),
        numBones = 10,
        boneChain = [],
        jacobian,
        inverseJacobian,
        endEffector,
        secondaryTaskValues = Sylvester.Vector.Zero(numBones), // when boneChain is constrained somewhere
        secondaryTask,
        lastBone, // will be set as boneChain[numBones-1]
        e_delta = new THREE.Vector3(), //vector from end effector to target position
        theta_delta = new THREE.Euler(), //angle from lastbone to target vector
        newState; //new state of the boneChain (only delta angles)


    
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.getElementById("container").appendChild( renderer.domElement );
    
    //add listeners
    document.addEventListener('keydown', function (event){
        IK.event.keyListener(event, camera)});

    document.addEventListener('mousemove', function (event){
        IK.event.mouseMoveListener(event, camera)});

    // add subtle ambient lighting
    var ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(ambientLight);

    // directional lighting
    var directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    //create mouse pointer
    IK.mouse.position.set(0, 20, 0);
    scene.add(IK.mouse);

    
    // create bone chain
    boneChain.push(new Bone(1, new THREE.Vector3(0, 1, 0)));
    for(var i = 0; i<numBones-1; i++){
        boneChain.push(new Bone(5, new THREE.Vector3(1, 0, 0)));    
    }
    lastBone = boneChain[numBones-1];
    

    // add bones to scene
    boneChain.forEach(function (bone, i){
        if(i<numBones-1)
            boneChain[i+1].connectTo(bone);
    });
    boneChain[0].boneMesh.position.y += boneChain[0].length/2;
    scene.add(boneChain[0].boneMesh);

    camera.position.z = 50;
    function updatePosition(bone, i){
             bone.update(newState[i]);         
    }

    function updateSecondaryTaskValues(bone, i){
        if(i!==0){
            secondaryTaskValues.elements[i] = boneChain[i].constraint;
        }
    }

    var render = function () {
        requestAnimationFrame( render );

        //variables needed for theta_delta
        var vectorFrom = lastBone.getGlobalAxis(2),
            vectorTo = new THREE.Vector3(),
            q = new THREE.Quaternion();
            
        //angle delta
        vectorTo.subVectors(IK.mouse.position, lastBone.getGlobalStartPos());
        q.setFromUnitVectors(vectorFrom.normalize(), vectorTo.normalize());
        theta_delta.setFromQuaternion(q); 

        //positional delta
        endEffector = lastBone.getGlobalEndPos();
        e_delta.subVectors(IK.mouse.position, endEffector);
        
        //creating a jacobian and inversing it
        jacobian = IK.createJacobian(boneChain);
        inverseJacobian = IK.createInverseJacobian(jacobian, 10);

        boneChain.forEach(updateSecondaryTaskValues);

        secondaryTask = (Sylvester.Matrix.I(numBones).subtract(inverseJacobian.x(jacobian))).x(secondaryTaskValues);
        // new delta angles = J^-1 * delta_X * dt
        newState = (inverseJacobian.x(
            $V([e_delta.x, e_delta.y, e_delta.z, theta_delta.x, theta_delta.y, theta_delta.z])
            ).add(secondaryTask)
            ).x(0.016).elements;

        boneChain.forEach(updatePosition);
        renderer.render(scene, camera);
    };
    render();
};

/**
* returns a jacobian matrix with 'numBones' columns where each column has 6 rows.
* first three are x, y and z values of the vector = rotationAxis X BoneJoint-To-EndEffector-Vector
* and the other three are x, y and z values of the rotationAxis alone.
*/
IK.createJacobian = function (boneChain) {

    var jacobianRows = [],
        jacobian,
        numBones = boneChain.length,
        endEffector,
        row = new THREE.Vector3(),
        r = new THREE.Vector3();

    for(var i = 0; i<numBones;i++){
        // one row (later column after transpose): ( rotationAxis X (endEffector - joint[i]) ) rotationAxis 
        endEffector = boneChain[numBones-1].getGlobalEndPos();

        row.crossVectors(boneChain[i].getGlobalRotationAxis(), r.subVectors(endEffector,boneChain[i].getGlobalStartPos()));  
        jacobianRows.push(row.toArray().concat(boneChain[i].getGlobalRotationAxis().toArray()));

    }
    
    jacobian = $M(jacobianRows);
    jacobian = jacobian.transpose();

    return jacobian;
};

/**
* Tries to inverse the jacobian, if unsuccessful, takes the 
* pseudo inverse with damping constant lambda instead
*/
IK.createInverseJacobian =  function (jacobian, lambda){

    var inverseJacobian;
    if(jacobian.isSquare() && !jacobian.isSingular()){
        inverseJacobian = jacobian.inverse();
    } else {
        //pseudo inverse with damping
        //(A'*A + lambda*I)^-1*A'
        var square = jacobian.transpose().x(jacobian),
            dampedSquare = square.add(Sylvester.Matrix.I(square.rows()).x(Math.pow(lambda,2))),
            inverseDampedSquare = dampedSquare.inverse(),
            inverseJacobian = inverseDampedSquare.x(jacobian.transpose());    
    }

    return inverseJacobian;
};


