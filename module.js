
const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');

function onResults(results) {
  
  let allVisibleLandmarks = results.poseLandmarks?.map((el)=>el.visibility>0.0001?{...el, visibility:1}:el)
      .map((e,index)=>(index>10 && index<17) || (index>22)?e:{...e, visibility:0})
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  // Only overwrite existing pixels.
  canvasCtx.globalCompositeOperation = 'source-in';
  canvasCtx.fillStyle = '#00FF00';
  canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);

  // Only overwrite missing pixels.
  canvasCtx.globalCompositeOperation = 'destination-atop';
  canvasCtx.drawImage(
      results.image, 0, 0, canvasElement.width, canvasElement.height);

  canvasCtx.globalCompositeOperation = 'source-over';
  drawConnectors(canvasCtx, allVisibleLandmarks, POSE_CONNECTIONS,
                 {color: 'white', lineWidth: 4});
  drawLandmarks(canvasCtx, allVisibleLandmarks,
                {color: 'yellow', lineWidth: 2});
  // drawConnectors(canvasCtx, results.faceLandmarks, FACEMESH_TESSELATION,
  //                {color: '#0ee9e599', lineWidth: 1});
  drawConnectors(canvasCtx, results.leftHandLandmarks, HAND_CONNECTIONS,
                 {color: 'white', lineWidth: 2});
  drawLandmarks(canvasCtx, results.leftHandLandmarks,
                {color: 'gold', radius: 3});
  drawConnectors(canvasCtx, results.rightHandLandmarks, HAND_CONNECTIONS,
                 {color: 'white', lineWidth: 2});
  drawLandmarks(canvasCtx, results.rightHandLandmarks,
                {color: 'yellow', radius: 3});
  canvasCtx.restore();
  
}

const holistic = new Holistic({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
}});
holistic.setOptions({
  selfiMode:true,
  modelComplexity: 1,
  smoothLandmarks: true,
  enableSegmentation: false,
  smoothSegmentation: true,
  refineFaceLandmarks: false,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
holistic.onResults(onResults);

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await holistic.send({image: videoElement});
  },
  width: 1280,
  height: 720
});
camera.start();