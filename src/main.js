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
IK.event = {
    keyListener: function (e, camera){
        e = e || event; // to deal with IE

        var dir = IK.mouse.position.sub( camera.position );
        var distance = dir.length();
        dir.normalize();

        if(e.keyCode===38){
            distance += 0.5;
        }
        if(e.keyCode===40){
            distance -= 0.5;
        } 

        var pos = camera.position.clone().add( dir.multiplyScalar( distance ));

        IK.mouse.position.set(pos.x, pos.y, pos.z);

    },

    mouseMoveListener: function (e, camera){
        var vector = new THREE.Vector3(),
        x,
        y;


        if (event.pageX || event.pageY) {
                x = event.pageX;
                y = event.pageY;
            } else {
                x = event.clientX;
                y = event.clientY;
            }

            vector.set(
                ( x / window.innerWidth ) * 2 - 1,
                - ( y / window.innerHeight ) * 2 + 1,
                0.5 );

            vector.unproject( camera );

            var dir = vector.sub( camera.position ).normalize();

            var distance = IK.mouse.position.sub(camera.position).length();

            var pos = camera.position.clone().add( dir.multiplyScalar( distance ) );

            IK.mouse.position.x = pos.x;
            IK.mouse.position.y = pos.y;
            IK.mouse.position.z = pos.z;
    }
};

IK.main = function (){

    var scene = new THREE.Scene(),
        camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 ),
        renderer = new THREE.WebGLRenderer(),
        numBones = 10,
        boneChain = [],
        jacobian,
        inverseJacobian,
        endEffector,
        lastBone,
        e_delta = new THREE.Vector3(),
        theta_delta = new THREE.Euler(),
        newState;


    
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

    var render = function () {
        requestAnimationFrame( render );

        var vectorFrom = lastBone.getGlobalAxis(2),
            vectorTo = new THREE.Vector3(),
            q = new THREE.Quaternion();
            
        vectorTo.subVectors(IK.mouse.position, lastBone.getGlobalStartPos());

        endEffector = lastBone.getGlobalEndPos();

        e_delta.subVectors(IK.mouse.position, endEffector);
        
        q.setFromUnitVectors(vectorFrom.normalize(), vectorTo.normalize());

        theta_delta.setFromQuaternion(q); 

        jacobian = IK.createJacobian(boneChain);
        inverseJacobian = IK.createInverseJacobian(jacobian);

        newState = (inverseJacobian.x($V([e_delta.x, e_delta.y, e_delta.z, theta_delta.x, theta_delta.y, theta_delta.z]))).x(0.08).elements;
        //newState = (inverseJacobian.x($V([e_delta.x, e_delta.y, e_delta.z]))).x(0.08).elements;

        boneChain.forEach(updatePosition);
        renderer.render(scene, camera);
    };
    render();
};


IK.createJacobian = function (boneChain) {

    var jacobianRows = [],
        jacobian,
        numBones = boneChain.length,
        endEffector,
        row = new THREE.Vector3(),
        r = new THREE.Vector3();

    for(var i = 0; i<numBones;i++){
        // one row (later column after transpose): rotationAxis X (endEffector - joint[i])
        
        endEffector = boneChain[numBones-1].getGlobalEndPos();

        row.crossVectors(boneChain[i].getGlobalRotationAxis(), r.subVectors(endEffector,boneChain[i].getGlobalStartPos()));  
        jacobianRows.push(row.toArray().concat(boneChain[i].getGlobalRotationAxis().toArray()));
        //jacobianRows.push(row.toArray());
    }
    
    jacobian = $M(jacobianRows);
    jacobian = jacobian.transpose();

    return jacobian;
};

IK.createInverseJacobian =  function (jacobian){

    var inverseJacobian;
    if(jacobian.isSquare() && !jacobian.isSingular()){
        inverseJacobian = jacobian.inverse();
    } else {
        //pseudo inverse with damping
        //(A'*A + lambda*I)^-1*A'
        var lambda = 5.0, //damping constant
            square = jacobian.transpose().x(jacobian),
            dampedSquare = square.add(Sylvester.Matrix.I(square.rows()).x(Math.pow(lambda,2))),
            inverseDampedSquare = dampedSquare.inverse(),
            inverseJacobian = inverseDampedSquare.x(jacobian.transpose());    
    }

    return inverseJacobian;
};


