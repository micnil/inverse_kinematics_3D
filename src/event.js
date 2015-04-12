IK.event = {

    wheelListener: function (event){

        if(event.deltaY>0){
            IK.impulseForce -= 4;
        }else if(event.deltaY<0){
            IK.impulseForce += 4;
        }
        document.getElementById("info").innerHTML = "press cube to apply " + IK.impulseForce + " units of force. Scroll to appy more or less";
    },

    mouseClickListener: function (event){
        

        if(IK.impulsePosition){
            IK.selectedBox.boxBody.applyImpulse(new CANNON.Vec3(0,IK.impulseForce,0), 
                                                new CANNON.Vec3().copy(IK.impulsePosition));
        }
    },

    mouseMoveListener: function (e){

        IK.mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
        IK.mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;

    },

    onWindowResize: function (){

        IK.camera.aspect = window.innerWidth / window.innerHeight;
        IK.camera.updateProjectionMatrix();

        IK.renderer.setSize( window.innerWidth, window.innerHeight );

    }
};