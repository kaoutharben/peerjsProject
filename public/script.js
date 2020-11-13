const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;

//peer connection ,id auto-generated(undefined)
const myPeer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "443"
});
const peers = {};
var myVideoStream;
//get access to navigator's vid,aud with a promess function(waits for user acceptance)
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);
   
    //answer the call
    myPeer.on('call', call => {
    call.answer(stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
   
    });
    
    //listening to user stram
    
    socket.on("user-connected", (userId) => {
      //send user stream to others
   connectToNewUser(userId,myVideoStream);
  });
  
  socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
  })
  

  })
  //listening to user stram
    
    socket.on("user-connected", (userId) => {
        //send user stream to others
     connectToNewUser(userId,myVideoStream);
    });
    
    socket.on('user-disconnected', userId => {
      if (peers[userId]) peers[userId].close()
    })
    


//send the user to video stream
const connectToNewUser = (userId,stream) => {
    //call user that ve joined the room
    //stream stands for the caller
    console.log(userId);
    const call = myPeer.call(userId,stream);
    const video=document.createElement('video');
    call.on('stream',useVideoStream =>{
     addVideoStream(video,useVideoStream)
    })

};
//listening to peer connection
myPeer.on("open", (id) => {
    //emit socket from server to front
    socket.emit("join-room", ROOM_ID, id);
  });

//play the stream
const addVideoStream = (video, stream) => {
  //loading data
  video.srcObject = stream;
  //playing
  //loadmetadata: metadata for the specified audio/video has been loaded
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
};
//send message using jquerry
let text =$('input');
$('html').keydown((e)=>{
    //13 IS ENTER NUMBER
    if(e.which == 13 && text.val().length!==0){
        socket.emit('message',text.val());
        console.log(text)
        text.val('');
    }
})
socket.on('createMessage',message=>{
    $('ul').append(`<li class="message"><b>user</b><br/>${message}</li>`)
})
//mute/unmute audio
const setMuteButton = () => {
    console.log('function mute')
    const html = `
      <i class="fas fa-microphone"></i>
      <span>Mute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
  }
  
  const setUnmuteButton = () => {
      console.log('function unmute')
    const html = `
      <i class="unmute fas fa-microphone-slash"></i>
      <span>Unmute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
  }
const muteUnmute=()=>{
    //first element refers to my audio
    //enabled is an attribute sent when audio ended
    const enabled=myVideoStream.getAudioTracks()[0].enabled;
    if(enabled){
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    }
    else{
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled=true;
    }
}

const setStopVideo = () => {
    const html = `
      <i class="fas fa-video"></i>
      <span>Stop Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
  }
  
  const setPlayVideo = () => {
    const html = `
    <i class="stop fas fa-video-slash"></i>
      <span>Play Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
  }
const playStop = () => {
    console.log('object')
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
      myVideoStream.getVideoTracks()[0].enabled = false;
      setPlayVideo()
    } else {
      setStopVideo()
      myVideoStream.getVideoTracks()[0].enabled = true;
    }
  }