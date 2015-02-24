IK.event = {

    wheelListener: function (e, camera){
        e.preventDefault();
        var dir = IK.mouse.mouseMesh.position.sub( camera.position );
        var distance = dir.length();
        dir.normalize();
        if(distance>1){
            if(e.deltaY>0){
                distance += 4;
            }else if(e.deltaY<0){
                distance -= 4;
            }

            var pos = camera.position.clone().add( dir.multiplyScalar( distance ));

            IK.mouse.mouseBody.position.set(pos.x, pos.y, pos.z);
            IK.mouse.mouseMesh.position.copy(IK.mouse.mouseBody.position);
            IK.mouse.mouseMesh.quaternion.copy(IK.mouse.mouseBody.quaternion);
        }
    },

    mouseMoveListener: function (e, camera){
        var vector = new THREE.Vector3(),
        x,
        y;


        if (e.pageX || e.pageY) {
                x = e.pageX;
                y = e.pageY;
            } else {
                x = e.clientX;
                y = e.clientY;
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