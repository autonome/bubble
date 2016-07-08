window.addEventListener('DOMContentLoaded', function() {
  var capabilities = location.search.indexOf('desktop') != -1 ?
    ['gum','webgl'] : ['gum','gyro','webgl'];

  // initialize awe after page loads
  awe.init({
    // automatically detect the device type
    device_type: awe.AUTO_DETECT_DEVICE_TYPE,
    // populate some default settings
    settings: {
      container_id: 'container',
      fps: 5,
      default_camera_position: { x:0, y:0, z:0 },
      default_lights:[{
        id: 'point_light',
        type: 'point',
        color: 0xFFFFFF
      }],
    },
    ready: function() {
      // load js files based on capability detection then setup the scene if successful
      awe.util.require([{
          capabilities: capabilities,
          files: [ 
            ['js/awe-standard-dependencies.js', 'js/awe-standard.js' ], // core dependencies for this app 
            'js/awe-standard-window_resized.js', // window resize handling plugin
            'js/awe-standard-object_clicked.js', // object click/tap handling plugin
            'awe.geo_ar.js', // geo ar plugin
          ],
          success: onAweReady,
        },
        { // else create a fallback
          capabilities: [],
          files: [],
          success: function() { 
            window.location = 'fallback.html';
            /*
            document.body.innerHTML = '<p>This demo currently requires a standards compliant mobile browser (e.g. Firefox on Android). NOTE: iOS does not currently support WebGL or WebRTC and has not implemented the DeviceOrientation API correctly. Please see <a href="http://lists.w3.org/Archives/Public/public-geolocation/2014Jan/0000.html">this post to the W3C GeoLocation Working Group</a> for more detailed information.</p>';
            */
            return;
          },
        },
      ]);
    }
  });
});

function onAweReady() {
  // limit demo to supported devices
  // NOTE: only Chrome and Firefox has implemented the DeviceOrientation API in a workable way
  //       so for now we are excluding all others to make sure your first experience is a happy one
  var device_type = awe.device_type();
  var browser_unsupported = false;
  if (device_type != 'android' && 
      !navigator.userAgent.match(/chrome|firefox/i)) {
    document.body.innerHTML = '<p>This demo currently requires a standards compliant Android browser (e.g. Chrome M33).</p>';
    return;
  }

  window.addEventListener('devicemotion', function(e) {
    //console.log('motion')
  }, false);

  // Our own orientation listener
  var pov = { x: 0, y: 0, z: 0 };
  window.addEventListener('deviceorientation', function(e) {
    //console.log(orientation, e);
    var alpha = e.alpha,
        beta = e.beta,
        gamma = e.gamma,
        x = 0,
        y = 0,
        z = 0;

    if ((beta > 30 && beta < 150) || // device is generally upright (portrait)
        (beta < -30 && beta > -150)) { // device is generally upright but inverted (portrait)
      x = beta+90;
      y = (alpha+gamma)%360;
      z = 180;
    } else { // device is generally not-upright (landscape)
      if (gamma < 0 && gamma > -90) { // rotation below horizon
        x = -gamma-90;
      } else { // rotation above horizon
        x = 90-gamma;
      }
      y = (alpha+gamma+180)%360;
    }

    //var povEl = document.querySelector('#pov');
    //povEl.innerHTML = ['X', Math.round(x), 'Y', Math.round(y)].join(' ');

    pov = { x: Math.round(x), y: Math.round(y), z: Math.round(z) };
  });

  // setup and paint the scene
  awe.setup_scene();

  var addBtn = document.querySelector('#add');
  var hammertime = new Hammer(addBtn);
  hammertime.on('tap', newMessage);
  
  /*
  var numTests = 10;
  for (var i = 0; i < numTests; i++) {
    console.log(randomIntInRange(-100, 100));
    newMessage({
      pos: {
        x: randomIntInRange(-100, 100),
        y: randomIntInRange(-100, 100),
        z: 200,
      }
    });
  }
  */

  function newMessage(opts) {
    var id = opts.id || 'msg' + Date.now();
    var msgPos = opts.pov || { x: 0, y: 0, z: 200 }; //pov;
    var imgPath = opts.image || 'images/envelope.png';
    awe.pois.add({ id: id, position: msgPos });

    console.log('adding new msg at ' + pov.x + ', ' + pov.y);

    awe.projections.add({ 
      id: id,
      geometry:{ shape:'cube', x:100, y:50, z:10 },
      position: { x: 0, y: 0, z: 0 },
      material:{ color: 0xC0C0C0 },
      texture: { path: imgPath },
    }, { poi_id: id });

    // show message editor
    //var msg = document.querySelector('#msg');
    //msg.style.visible = 'visible';
  }

  newMessage({
    id: 'chat1',
    image: 'images/chat1.png',
    pos: { x: 30, y: -3, x: 200 }
  });

  newMessage({
    id: 'chat2',
    image: 'images/chat2.png',
    pos: { x: 40, y: 0, x: 200 }
  });

  newMessage({
    id: 'chat3',
    image: 'images/chat3.png',
    pos: { x: 20, y: 3, x: 200 }
  });


  /*
  window.addEventListener('object_clicked', function(e) {
    alert(e.detail.projection_id)
  });
  */
  
  // save all poi/projections to json
  function serializeSession() {
  }

  // send session to server
  function saveSession() {
  }

  // load session from server
  function loadSession() {
  }

  function randomIntInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
