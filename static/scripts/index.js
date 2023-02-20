const meName = prompt("whats your name (name required)!!");
const usersItemList = document.getElementsByClassName("items");
let offerName;
let rtc;
if (meName == null || meName.length === 0) {
  location.reload();
}
const socket = io();
socket.on("nameError", (error) => {
  console.log(error);
  document.getElementById("error").style.top = "0";
  setTimeout(() => {
    location.reload();
  }, 5000);
});
socket.on("allUser", (alluser) => {
  Object.keys(alluser).forEach((element) => {
    if (meName != element) {
      userItemBuild(element);
    }
  });
  setTimeout(() => {
    removeItem("name");
  }, 2000);
});
function userItemBuild(element) {
  const items = document.createElement("div");
  items.classList.add("items");
  const name = document.createTextNode(element);
  items.appendChild(name);
  items.setAttribute("id", element);
  items.setAttribute("onclick", `startCall("${element}")`);
  document.getElementById("user-list").appendChild(items);
}
socket.emit("fatchName", meName);
socket.on("offer", (data) => {
  offerName = data.other;
  rtc.setRemoteDescription(data.offer);
  document.getElementById("SCD").innerHTML = data.other;
  document.getElementById("rigning").style.display = "block";
  document.getElementById("list-out").style.display = "none";
  document.getElementById("user-list").style.display = "none";
  document.getElementById("green-button").style.display = "block";
  document.getElementById("red-button").style.display = "block";
});
socket.on("ans", (data) => {
  document.getElementById("rigning").innerHTML = "answered";
  rtc.setRemoteDescription(data.ans);
});
socket.on("candidate", (data) => {
  rtc.addIceCandidate(data);
});
socket.on("end", () => {
  callClose();
});
socket.on("removeUser", (name) => {
  removeItem(name);
});
socket.on("addedUser", (name) => {
  addItem(name);
});
function listClose() {
  document.getElementById("user-list").style.display = "none";
}
function listShow() {
  document.getElementById("user-list").style.display = "block";
}

const callState = new Promise(async (resolve, reject) => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    rtc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun2.l.google.com:19302" }],
    });
    rtc.addStream(stream);
    rtc.onaddstream = (s) => {
      document.getElementById("other").srcObject = s.stream;
    };
    rtc.onicecandidate = (i) => {
      if (i.candidate === null) {
        return;
      }
      socket.emit("candidate", {
        to: offerName,
        candidate: i.candidate,
      });
    };
    resolve(rtc);
  } catch (error) {
    reject(err);
  }
});
//offline user
function removeItem(name) {
  console.log(usersItemList.length);
  for (let index = 0; index < usersItemList.length; index++) {
    if (usersItemList[index].id === name) {
      let element = document.getElementById(name);
      document.getElementById("user-list").removeChild(element);
      break;
    }
  }
}
//online user
function addItem(name) {
  userItemBuild(name);
}
async function startCall(otherUserName) {
  offerName = otherUserName;
  document.getElementById("user-list").style.display = "none";
  document.getElementById("SCD").innerHTML = otherUserName;
  document.getElementById("rigning").style.display = "block";
  document.getElementById("list-out").style.display = "none";
  document.getElementById("user-list").style.display = "none";
  document.getElementById("red-button").style.display = "block";
  callState
    .then(async (rtc) => {
      const offer = await rtc.createOffer();
      rtc.setLocalDescription(offer);
      socket.emit("offer", {
        to: otherUserName,
        offer,
        from: meName,
      });
    })
    .catch((err) => {});
}
function callClose() {
  rtc.close();
  document.getElementById("rigning").innerHTML = "rigning";
  document.getElementById("rigning").style.display = "none";
  document.getElementById("red-button").style.display = "none";
  document.getElementById("green-button").style.display = "none";
  document.getElementById("SCD").innerHTML = "simple call demo";
  document.getElementById("list-out").style.display = "block";
  socket.emit("end", {
    to: offerName,
  });
}

async function callAns() {
  document.getElementById("green-button").style.display = "none";
  document.getElementById("rigning").innerHTML = "answered";
  const ans = await rtc.createAnswer();
  rtc.setLocalDescription(ans);
  socket.emit("ans", {
    to: offerName,
    ans,
  });
}
