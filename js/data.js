function ZephyrPlot(name){
  this.name=name;
  this.smoothie="";
  this.lines=new Array();
  this.lastValues=new Array();
  this.element="";
  this.minValue="";
  this.maxValue="";
  this.lineStyles=new Array();
  this.fillStyles=new Array();
  this.strokeStyles=new Array();

  this.init=function init(timeseries){

    for(var i=0;i<timeseries.length;i++){
      this.lines.push(new TimeSeries());

    }

    //this.smoothie=new SmoothieChart({grid:{strokeStyle:'transparent',verticalSections:0},minValue:this.minValue,maxValue:this.maxValue}); 
    if(this.maxValue == "")
      this.smoothie=new SmoothieChart({grid:{strokeStyle:'transparent',verticalSections:0},minValue:this.minValue,maxValueScale:1.5});
    else 
      this.smoothie=new SmoothieChart({grid:{strokeStyle:'transparent',verticalSections:0},minValue:this.minValue,maxValue:this.maxValue});

    for(var i=0;i<timeseries.length;i++){
      //this.smoothie.addTimeSeries(this.lines[i],{ strokeStyle: this.strokeStyles[i], fillStyle:this.fillStyles[i], lineWidth:3 });
      this.smoothie.addTimeSeries(this.lines[i],{ strokeStyle: this.strokeStyles[i], fillStyle:this.fillStyles[i], lineWidth:3 });
    }

    this.smoothie.streamTo(document.getElementById(this.element),1000);
   
    // Update the plot if the data array contains only 1 value
    
  }

  this.update=function update(value, lineNumber){
    this.lastValues[lineNumber]=value;
    if(this.lines[lineNumber].data.length==0){
      this.lines[lineNumber].append(new Date().getTime(), value);
    }
    this.lines[lineNumber].append(new Date().getTime()+10, value);

    var f = checkOneValue;
    f.line = this.lines[lineNumber];
    f.lastValue = this.lastValues[lineNumber];
    setInterval(f,100);

    
  }

  function checkOneValue(){
      if(checkOneValue.line.data.length==1){
        checkOneValue.line.append(new Date().getTime() + 10, checkOneValue.lastValue);
      }
  }
}
var connectedUsers = new Array();
function searchInArray(userID){
  for(var i=0;i<connectedUsers.length;i++){
    if(connectedUsers[i].id==userID){return connectedUsers[i]}
  }
}


function new_user(userID){
  userIDHTML = userID.replace("@","_");
  $("#side").append('<div class="col-md-4"><p>'+userID+'</p><canvas class=video_plot id=hr_'+userIDHTML+'></canvas><canvas class=video_plot id=br_'+userIDHTML+'></canvas><canvas class=video_plot id=posture_'+userIDHTML+'></canvas><canvas class=video_plot id=acc_canvas_'+userIDHTML+'></canvas></div>');
  var that = {};
  that.id = userID;
  //Battery
  //that.battery_plot = new ZephyrPlot("Battery plot "+address);
  //that.battery_plot.element="battery_level_canvas_"+address;
  //that.battery_plot.minValue=0;
  //that.battery_plot.maxValue=100;
  //that.battery_plot.strokeStyle="rgb(0,255,0)";
  //that.battery_plot.fillStyle="rgb(0,70,0)";
  //that.battery_plot.init();
  //Heart rate
  that.hr = new ZephyrPlot("Heart rate plot "+userIDHTML);
  that.hr.element="hr_"+userIDHTML;
  that.hr.minValue=0;
  that.hr.strokeStyles=["rgb(255,0,0)"];
  that.hr.fillStyles=["rgb(0,0,0)"];
  that.hr.init(["ecg"]);

  //Breathing plot
  that.breathing_rate = new ZephyrPlot("Breathing plot "+userIDHTML);
  that.breathing_rate.element="br_"+userIDHTML;
  that.breathing_rate.minValue=0;
  //breathing_rate.maxValue=250;
  that.breathing_rate.strokeStyles=["rgb(255,255,0)"];
  that.breathing_rate.fillStyles=["rgb(0,0,0)"];
  that.breathing_rate.init(["breathing_rate"]);


  //Posture
  that.posture = new ZephyrPlot("Posture plot "+userIDHTML);
  that.posture.element="posture_"+userIDHTML;
  that.posture.minValue=0;
  that.posture.maxValue=360;
  that.posture.strokeStyles=["rgb(0,255,0)"];
  that.posture.fillStyles=["rgb(0,0,0)"];
  that.posture.init(["posture"]);


    //Acceleration
  that.acceleration = new ZephyrPlot("Acceleration plot "+userIDHTML);
  that.acceleration.element="acc_canvas_"+userIDHTML;
  that.acceleration.minValue=0;
  //breathing_rate.maxValue=250;
  that.acceleration.strokeStyles=["rgb(255,255,0)","rgb(255,255,255)","rgb(255,0,50)"];
  that.acceleration.fillStyles=["rgb(0,0,0)","rgb(0,0,0)","rgb(0,0,0)"];
  that.acceleration.init(["x","y","z"]);

  return that;

}

function update_values(userID, zephyrValues, zephyrPlot){
  console.log(zephyrValues);
  zephyrPlot.hr.update(zephyrValues.hr,0);
  zephyrPlot.breathing_rate.update(zephyrValues.breathingWaveAmplitude,0);
  zephyrPlot.posture.update(zephyrValues.posture,0);
  zephyrPlot.acceleration.update(zephyrValues.xAccelerationMax,0);
  zephyrPlot.acceleration.update(zephyrValues.yAccelerationMax,1);
  zephyrPlot.acceleration.update(zephyrValues.zAccelerationMax,2);
}

function get_data(){
  var url = "http://devel200.upc.edu:8080/activat/ws/activat.json/listUsersConnectedZephyrLocation"
  $.get(url, function(data){
    var i=0;
    for(i;i<data.length;i++){
      //console.log(data[i]);
      zp = searchInArray(data[i].email);
      if(zp){
        update_values(data[i].email, data[i].zephyr,zp);
      }else{
        //plots does not exist, create new ones
        zp = new_user(data[i].email);
        connectedUsers.push(zp);
        update_values(data[i].email, data[i].zephyr,zp);
      }
    }
  })
}

setInterval(function(){get_data();}, 1000);