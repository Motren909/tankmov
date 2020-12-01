var maxPWMval = 100;  // will be changed when sync
    
function updateView(settings) {
    console.log(settings);
    let d = new Date();
    $('#lastsync').html(d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + "." + d.getMilliseconds());
    let arr = ['mode', 'heap', 'ssid', 'millis', 'maxpwm'];
    for (let i in arr) {
        let id = arr[i];
        if (id in settings) $('#' + id).html(settings[id]);
    }
    if ('maxpwm' in arr) {
        maxPWMval = arr['maxpwm'];
    }
    arr = ['pwm0', 'pwm1'];
    for (let i in arr) {
        let id = arr[i];
        if (id in settings) $('#' + id + "act").html(settings[id]);
    }
    if ('pwm0' in settings) pwm[0] = settings['pwm0'];
    if ('pwm1' in settings) pwm[1] = settings['pwm1'];
    if ('mode' in settings) {
        let mode = settings['mode'];
        let modesToDelete = ['PWM', 'PID', 'haha'];
        modesToDelete.splice($.inArray(mode, modesToDelete), 1);  // delete this element
        console.log(modesToDelete);
        for (let i in modesToDelete) {
            $("#" + modesToDelete[i] + "Panel").hide();
        }
        $("#" + mode + "Panel").show();
    }
}
function sync() {
    $.get("sync", function(result) {
        updateView(result);
    });
}
function setMode(mode) {
    $.post("setMode", {
        mode: mode
    }, function(result) {
        updateView(result);
    });
}

var pwm = [0, 0];
function pwmSet(motor, value) {
    // first reset the slider
    slider1.slider('setValue', 0);
    slider2.slider('setValue', 0);

    let pwm0 = pwm[0];
    let pwm1 = pwm[1];
    if (motor == 0) {
        pwm0 = value;
        $('#pwm0').val(value);
    } else {
        pwm1 = value;
        $('#pwm1').val(value);
    }
    $.post("setPWM", {
        pwm0: pwm0,
        pwm1: pwm1
    }, function(result) {
        updateView(result);
    });
}

function setdirection(left, right) {
    let pwm = parseInt($('#pwmbase').val());;
    let l = pwm*left;
    let r = pwm*right
    console.log("" + l + "," + r);
    $.post("setPWM", {
        pwm0: l,
        pwm1: r
    }, function(result) {
        updateView(result);
    });
}

function updateSlider() {
    let pwmwant0 = parseInt($('#pwm0').val());
    let pwmwant1 = parseInt($('#pwm1').val());
    let rough = slider1.slider('getValue');
    let fine = slider2.slider('getValue');
    let actualpwm0 = pwmwant0 + rough + fine;
    let actualpwm1 = pwmwant1 - rough - fine;
    $.post("setPWM", {
        pwm0: actualpwm0,
        pwm1: actualpwm1
    }, function(result) {
        updateView(result);
    });
}

function pwmChange(motor, delta) {
    pwmSet(motor, pwm[motor] + delta);
}

var slider1 = null;
var slider2 = null;
$(function () {
    slider1 = $('#PWMadj1').slider().on('slideStop', updateSlider);
    slider2 = $('#PWMadj2').slider().on('slideStop', updateSlider);
});





Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, 
        "d+": this.getDate(), 
        "H+": this.getHours(),  
        "m+": this.getMinutes(),  
        "s+": this.getSeconds(), 
        "q+": Math.floor((this.getMonth() + 3) / 3), 
        "S": this.getMilliseconds()  
    };
    var year = this.getFullYear();
    var yearstr = year + '';
    yearstr = yearstr.length >= 4 ? yearstr : '0000'.substr(0, 4 - yearstr.length) + yearstr;
    
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (yearstr + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
$(sync);  // when the file is loaded, call sync
$(function() {
    setInterval(function () {
        let d = new Date();
        $('#nowtime').html(d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds());
    }, 100);
});