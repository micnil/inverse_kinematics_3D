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