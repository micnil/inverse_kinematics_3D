IK.event = {
/*    keyListener: function (e, camera){
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

    },*/

    wheelListener: function (e, camera){
        e = e || event; // to deal with IE

        var dir = IK.mouse.mouseMesh.position.sub( camera.position );
        var distance = dir.length();
        dir.normalize();

        if(e.wheelDelta>0){
            distance += 4;
        }else{
            distance -= 4;
        }

        var pos = camera.position.clone().add( dir.multiplyScalar( distance ));

        IK.mouse.mouseBody.position.set(pos.x, pos.y, pos.z);
        IK.mouse.mouseMesh.position.copy(IK.mouse.mouseBody.position);
        IK.mouse.mouseMesh.quaternion.copy(IK.mouse.mouseBody.quaternion);

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

            var distance = IK.mouse.mouseMesh.position.sub(camera.position).length();

            var pos = camera.position.clone().add( dir.multiplyScalar( distance ) );

        IK.mouse.mouseBody.position.set(pos.x, pos.y, pos.z);
        IK.mouse.mouseMesh.position.copy(IK.mouse.mouseBody.position);
        IK.mouse.mouseMesh.quaternion.copy(IK.mouse.mouseBody.quaternion);
    }
};