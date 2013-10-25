var fps = 30;
var streamId="";

function receive(){
	var websocket = io.connect("http://192.168.110.134:8080");
		websocket.on('setFrame',proc);
		function proc(obj)
		{
			//if(obj.streamId!=streamId)
				document.querySelector('#remoteImage').src = obj.dataURL;
		};
}

function createUUID() {
    // http://www.ietf.org/rfc/rfc4122.txt
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";
    var uuid = s.join("");
    return uuid;
}

function stream(){
		streamId = createUUID();
		var bandera=0;
		var websocket = io.connect("http://192.168.110.134:8080");
		window.URL = window.URL || window.webkitURL;
		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

		navigator.getUserMedia({audio: false, video:true},function(vid){
			bandera = 1;
			document.querySelector('video').src = window.URL.createObjectURL(vid);
		});
		window.requestAnimFrame = (function(callback){
			return window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			function(callback){
				window.setTimeout(callback, 1000 / 100);
			};
		})();
		function dFrame(ctx,video,canvas)
		{
			console.log("dFrame");
			ctx.drawImage(video,0,0);
			var dataURL = canvas.toDataURL('image/jpeg',0.2);
			console.log(dataURL);
			document.querySelector('#myvision').src = dataURL;
			obj = {"dataURL":dataURL, "streamId":streamId};
			if(bandera!=0) websocket.emit('newFrame',obj);
			requestAnimFrame(function(){
				setTimeout(function(){dFrame(ctx,video,canvas);},1000/fps)
			});
		}
		
		var canvas = document.querySelector('#recCanvas');
		var video = document.querySelector('video');
		var ctx = canvas.getContext('2d');
		dFrame(ctx,video,canvas);
}

var showingCam=1;
function toogleMyCam(){
	if(showingCam==1){
		$("#mycam").hide();
		showingCam=0;
	}else{
		$("#mycam").show();
		showingCam=1;
	}
}

$(function(){
	$("#camselector").change(function(){
		toogleMyCam();
	});

	$("#start").click(function(){
		stream();
	});

	receive();
});