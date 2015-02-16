"use strict";
/*global Bone */
/*global Sylvester */
/*global $M */
/*global $V */

var IK = IK || {};
IK.mouse = new THREE.Vector3(0, 0, 5);         
IK.event = {
    selectedBoneIndices: [false, false, false, false, false, false, false, false, false],
    addMouseListener: function(element) {
        var mouse = {x: 0, y: 0},
        body_scrollLeft = document.body.scrollLeft,
        element_scrollLeft = document.documentElement.scrollLeft,
        body_scrollTop = document.body.scrollTop,
        element_scrollTop = document.documentElement.scrollTop,
        offsetLeft = element.offsetLeft,
        offsetTop = element.offsetTop;

        element.addEventListener('mousemove', function (event) {
        var x, y;

        if (event.pageX || event.pageY) {
                x = event.pageX;
                y = event.pageY;
            } else {
                x = event.clientX + body_scrollLeft + element_scrollLeft;
                y = event.clientY + body_scrollTop + element_scrollTop;
            }
            x -= offsetLeft;
            y -= offsetTop;

            IK.mouse.x = x;
            IK.mouse.y = y;
        }, false);


        /*element.addEventListener('mousedown', function (event) {

            switch (event.which) {
                case 1:
                    IK.mouse.z=IK.mouse.z+0.1;
                    console.log("hej1");
                    break;
                case 2:
                    // Nothing happens here, later maybe move camera
                    break;
                case 3:
                console.log("hej1");
                    event.preventDefault();
                    IK.mouse.z=IK.mouse.z-0.1;
                    break;
                default:
                    console.log("strange mouse");
            }  
        }, false);*/
    },

    keyListener: function (e, secondaryTaskValues, boneChain){
        e = e || event; // to deal with IE

        //if a number key (1-9)
        if(e.keyCode>48 && e.keyCode<58){
            var index = e.keyCode-49;
            IK.event.selectedBoneIndices[index] = !IK.event.selectedBoneIndices[index];
            if(boneChain[index]!==undefined){
                boneChain[index].color = (IK.event.selectedBoneIndices[index]) ? "#FF0000" : "#0000FF";
            }
        }

        if(e.keyCode===73){
            IK.mouse.z=IK.mouse.z+0.5;
            console.log("hej1");
        }
        if(e.keyCode===79){
            console.log("hej2");
            IK.mouse.z=IK.mouse.z-0.5;
        }


        function increaseTheta(selected, i){
            if(selected && secondaryTaskValues.e(i+1)!==null){
                secondaryTaskValues.elements[i] += 0.05;
            }
        }
        function decreaseTheta(selected, i){
            if(selected && secondaryTaskValues.e(i+1)!==null){
                secondaryTaskValues.elements[i] -= 0.05;
            }
        }

        if(e.keyCode === 38){
            IK.event.selectedBoneIndices.forEach(increaseTheta);
        }
        if(e.keyCode === 40){
            IK.event.selectedBoneIndices.forEach(decreaseTheta);
        }

    }
};
/*IK.WIDTH = window.innerWidth;
IK.HEIGHT = window.innerHeight;*/
IK.main = function (){
    var scene = new THREE.Scene(),
        camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 ),
        renderer = new THREE.WebGLRenderer(),
        boneChain = [], 
        numBones = 2, 
        jacobian,
        inverseJacobian,
        secondaryTaskValues = Sylvester.Vector.Zero(numBones),
        secondaryTask,
        e_delta, //will be used for delta mouse movement
        theta_delta, //will be an array with each joint delta rotation angle
        e; //end effector, the last point on the chain

    renderer.setSize( window.innerWidth, window.innerHeight );
    document.getElementById("container").appendChild( renderer.domElement );
    camera.position.z = 50;

    boneChain = IK.createBoneChain(0, 0, 0, numBones); 

    function addToScene(bone){
        scene.add(bone.cylinder);
    }
    boneChain.forEach(addToScene);

    window.onkeyup = function(e){
        IK.event.keyListener(e, secondaryTaskValues, boneChain);
    }

    function draw(bone) {
        bone.draw(context); //KOLLA HÄR
    }

    function move(bone, i){
        bone.rotateLocally(theta_delta[i]);
        
        if(i !== 0){
            bone.connect(boneChain[i-1]);
        }
    }

    (function drawFrame () {
        window.requestAnimationFrame(drawFrame); 

        e = boneChain[numBones-1].getGlobalEndPos();

        e_delta = $V([IK.mouse.x, IK.mouse.y, IK.mouse.z]).subtract(e);

        jacobian = IK.createJacobian(boneChain);
        inverseJacobian = IK.createInverseJacobian(jacobian);
        secondaryTask = (Sylvester.Matrix.I(numBones).subtract(inverseJacobian.x(jacobian))).x(secondaryTaskValues);
        theta_delta = ((inverseJacobian.x(e_delta)).add(secondaryTask)).x(0.08).elements;

        boneChain.forEach(move);
        //boneChain.forEach(draw);
        renderer.render(scene, camera);
    }());
};

IK.createBoneChain = function (xStart, yStart, zStart, numOfBones){
    var boneChain = [];
    boneChain.push(new Bone(xStart, yStart, zStart));
    numOfBones--;
    while(numOfBones--){
        boneChain.push(new Bone());
    }
    function connectBone(bone, i){ 

        if(i!==0){
            bone.connect(boneChain[i-1]);
        }  
        if(i%2!==0){
            bone.endPos = bone.endPos.x(-1);  
        }
    }
    boneChain.forEach(connectBone);

    return boneChain;
};

IK.createJacobian = function (boneChain) {

    var jacobianRows = [],
        jacobian,
        numBones = boneChain.length;

    for(var i = 0; i<numBones;i++){
        // one row (later column after transpose): rotationAxis X (endEffector - joint[i])
        var row = boneChain[i].rotationAxis.cross(boneChain[numBones-1].getGlobalEndPos().subtract(boneChain[i].startPos));  
        jacobianRows.push(row.elements);
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

        var lambda = 10.0, //damping constant
            square = jacobian.transpose().x(jacobian),
            dampedSquare = square.add(Sylvester.Matrix.I(square.rows()).x(Math.pow(lambda,2))),
            inverseDampedSquare = dampedSquare.inverse(),
            inverseJacobian = inverseDampedSquare.x(jacobian.transpose());    
    }
    return inverseJacobian;
};

IK.printInfo = function (value, i){

    var valueBox = document.getElementsByClassName("value-box")[i]; 
    valueBox.innerHTML="";
    var text = document.createTextNode(" Bone #" + (parseInt(i)+1) + " = " + (+value.toFixed(2)) + " rad");
    valueBox.appendChild(text);
    
}

if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = (window.webkitRequestAnimationFrame ||
                                  window.mozRequestAnimationFrame ||
                                  window.msRequestAnimationFrame ||
                                  window.oRequestAnimationFrame ||
                                  function (callback) {
                                    return window.setTimeout(callback, 17 /*~ 1000/60*/);
                                  });
}