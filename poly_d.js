'use strict';

if(!navigator.requestMIDIAccess){
    alert('This app needs Google Chrome (WebMIDI) to work!')
}

var ma;
var out;
var store = {
  "device_id": 0x00, // all devices,
	"sync_clock_rate": 0x00, // 1 PPS,
  "sync_clock_source": 0x00, // Internal
	"pitch_bend_range": 12, // semitones
}

function initMA(f){
    navigator.requestMIDIAccess({sysex: true}).then(
        ma_ => {
            ma=ma_;
            var outs = [];
            ma.outputs.forEach(x=>outs.push(x))
            out = outs.filter(o=>o.name==="POLY D MIDI 1")[0];
            console.log(out);
            if (f) {
                f();
            }
        }
    )
}

function send(msg){
    if (out===undefined){
        initMA(_=>{        
            out.send(msg);
        })
    } else {
        out.send(msg);
    }
}

function sliderChangedFn(fn,eid){
    return e => {
        document.getElementById(eid).innerHTML=e.value;
        fn(parseInt(e.value))
    }
}

function feedback(name) {
  store[name] = document.getElementById(name).value;
	var el = document.getElementById(name + "_fb");
	if (el)
		el.innerHTML = store[name];
}

function change(name) {
  feedback(name);
  console.log("new " + name + " selected: " + store[name]);
}

function restoreFactorySettings() {
  const restore_factory_settings = [
    0xf0,
    0x00,
    0x20,
    0x32,
    0x00,
    0x01,
    0x0c,
    store["device_id"],
    0x7d,
    0xf7
  ];
  send(restore_factory_settings);
}

function apply(param) {
	switch (param) {
		case "sync_clock_rate":
			var payload = [
				0xf0,
				0x00,
				0x20,
				0x32,
				0x00,
				0x01,
				0x0c,
				store["device"],
				0x1a,
				parseInt(store["sync_clock_rate"]),
			  0xf7
			];
			break;
		case "sync_clock_source":
			var payload = [
				0xf0,
				0x00,
				0x20,
				0x32,
				0x00,
				0x01,
				0x0c,
				store["device"],
				0x1b,
				parseInt(store["sync_clock_source"]),
			  0xf7
			];
			break;
		case "pitch_bend_range":
			var payload = [
				0xf0,
				0x00,
				0x20,
				0x32,
				0x00,
				0x01,
				0x0c,
				store["device_id"],
				0x11,
				store["pitch_bend_range"],
				0x00,
				0xf7
			];
			break;
	}
  send(payload);
}
