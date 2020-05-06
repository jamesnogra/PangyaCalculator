var fakeAngle = 0.0;
var windDirectionY, windDirectionX;
var meterToYards = 1.093;
var elevationAdjuster = 0.0135;

calculate = () => {
	var maxPower = $('#max-power').val();
	var wind = $('#wind').val();
	var pin_distance = $('#pin-distance').val();
	var elevation = $('#elevation').val();
	var final_distance = parseFloat(pin_distance);
	//add/subtract the elevation
	final_distance += addSubtractElevation(elevation, pin_distance);
	//add/subtract the wind influence
	final_distance += parseFloat((90-fakeAngle)/90 * wind) * (windDirectionY=="Forward"?-1:1);
	//calculate the powerbards
	var final_pb = Math.abs(Math.sin(fakeAngle * Math.PI / 180) * wind * getHWI(maxPower, final_distance));
	//adjust final_pb with elevation
	var adjustedHWiForElevation = (fakeAngle>0) ? (elevation * elevationAdjuster * -1) : 0;
	final_pb += adjustedHWiForElevation;
	$("#final-results").html("Power: " + final_distance.toFixed(2) + " yards<br/>PB: " + final_pb.toFixed(1));
	//update the power-bar-fill
	$('#power-bar-fill').css("width", (final_distance/maxPower*100)+"%")
}

getHWI = (maxPower, final_distance) => {
	if (maxPower == 250) {
		return ((0.03861 * final_distance) - 5.801);
	} else if (maxPower == 260) {
		return ((0.03 * final_distance) - 4.1);
	} else if (maxPower == 270) {
		return ((0.0205 * final_distance) - 2.1854);
	}
	return 3.09; //temporary
}

addSubtractElevation = (elevation, pin_distance) => {
	var elevationMultiplier = 4.33 - (0.013 * pin_distance); //equation derived from the table
	var numberToAddSubstract = parseFloat(elevation) * elevationMultiplier;
	//console.log("Elevation Mul: " + elevationMultiplier, "\nFinal: " + numberToAddSubstract);
	return numberToAddSubstract;
}

$(document).ready(function() {

	//calculate on load
	calculate();

	$("#circle-wind").click(function(event) {
        var objLeft = $(this).offset().left;
        var objTop = $(this).offset().top;
        var objCenterX = objLeft + $(this).width() / 2;
        var objCenterY = objTop + $(this).height() / 2;
        var dx = event.pageX - objCenterX;
        var dy = event.pageY - objCenterY;
        var theta = Math.atan2(dy, dx);
		theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
        $("#circle-wind-direction").css({'transform' : 'rotate('+ (theta+90) +'deg)'});
        //determine if forward wind or back wind
        windDirectionY = (theta<0) ? "Forward" : "Backward";
        //determine if wind is going left or right
        windDirectionX = (Math.abs(theta)>=90) ? "Left" : "Right";
        //determine the fake angle (0 degrees to 90 degress)
        fakeAngle = (theta>0) ? (Math.abs(theta-90)) : (Math.abs(theta+90));
        $("#circle-results").html(fakeAngle.toFixed(1) + "&#176;, " + windDirectionX + ", " + windDirectionY);
        calculate();
    });

});