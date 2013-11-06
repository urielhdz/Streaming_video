var fps = 30;
var streamId="";
var retry=0;
var maxRetry=3;

function receive(){
	var websocket = io.connect("http://192.168.110.207:8080");
		websocket.on('setFrame',proc);
		function proc(obj)
		{
			//if(obj.streamId!=streamId)
			//console.log("receiving "+obj.width+" x "+obj.height)
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
		var streamId = createUUID();
		var bandera=0;
		var websocket = io.connect("http://192.168.110.207:8080");
		var canvas = document.querySelector('#recCanvas');
		var video = document.querySelector('video');
		var ctx = canvas.getContext('2d');



		window.URL = window.URL || window.webkitURL;
		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

		
		var ss = $('input[name=size]:checked', '#configForm').val();
		console.log(ss);
		var constraints;
		var qVGA_constraint = {
			video:{
				mandatory: {
					maxWidth: 320,
					maxHeight: 240
				}
			}
		};

		var vga_constraint = {
			video:{
				mandatory: {
					maxWidth: 640,
					maxHeight: 480
				}
			}
		};

		var hd_720_constraint = {
			video:{
				mandatory: {
					maxWidth: 1280,
					maxHeight: 720
				}
			}
		};
		


		if(ss){
			if(ss=="320"){
				constraints = qVGA_constraint;
			}else if(ss=="640"){
				constraints = vga_constraint;
			}else{
				constraints = hd_720_constraint;	
			}
		}else{
			constraints = qVGA_constraint;
		}
		usermedia(constraints);

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
				ctx.drawImage(video,0,0);
				var dataURL = canvas.toDataURL('image/jpeg',0.2);
				document.querySelector('#myvision').src = dataURL;
				obj = {"dataURL":dataURL, "streamId":streamId, "height": video.videoHeight, "width":video.videoWidth};
			 	websocket.emit('newFrame',obj);
				requestAnimFrame(function(){
					setTimeout(function(){dFrame(ctx,video,canvas);},1000/fps);
				});
		}



		video.addEventListener('playing', function() {
			configure(constraints);
		}, false);

		function usermedia(constraints){
			navigator.getUserMedia(constraints,function(vid){
			console.log("Video requested: "+constraints.video.mandatory.maxWidth+" x "+constraints.video.mandatory.maxHeight);

			//document.querySelector('video').src = window.URL.createObjectURL(vid);
			video = document.querySelector('video');
			if (video.mozSrcObject !== undefined) {
        		video.mozSrcObject = vid;
        		
    		} else {
        		video.src = (window.URL && window.URL.createObjectURL(vid)) || vid;
    		};
    		video.play();
    		bandera = 1;

		}, function(error){
			alert("get user media not supported in this browser. Error: "+error);
		});
		}

		function configure(constraints){
			console.log('Video dimensions: ' + video.videoWidth + ' x ' + video.videoHeight);
			$("#recCanvas").attr("width",video.videoWidth+"px");
			$(video).attr("width",video.videoWidth+"px");
			$("#recCanvas").attr("height",video.videoHeight+"px");
			$(video).attr("height",video.videoHeight+"px");
			if(video.videoWidth==0 && video.videoHeight==0){
				retry=retry+1;
				console.log("Retry "+retry);
				setTimeout(function(){
					//dFrame(ctx,video,canvas);
					//stream();
					usermedia(constraints);
				}, 500);
			}else{
				dFrame(ctx,video,canvas);
			}
}

		//dFrame(ctx,video,canvas);

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