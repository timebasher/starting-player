import React, { useRef, useState, useEffect } from "react";
import { shuffleArray } from "./utils/helpers";
import {
  initiateSocket,
  disconnectSocket,
  sendCursorPositionData,
  subscribeToCursorPositionsData,
} from "./utils/socket.helpers";
import "./App.css";
import "./Winner.css";
import "./Looser.css";

const states = {
  winner: "winner",
  looser: "looser",
  default: "default",
};

const room = "A";

const players = ["Johannes", "maarit", "tatze"];

function App() {
  const [animate, setAnimate] = useState(false);
  const [state, setState] = useState(states.default);
  const [finalRank, setFinalRank] = useState(null);


  const cursor = useRef(null);

  const playerName = "Johannes";

  useEffect(() => {
    if (room) initiateSocket(room);

    subscribeToCursorPositionsData((err, cords) => {
      if (err) return;
      setCursorPosition(cords);
    });

    return () => {
      disconnectSocket();
    };
  }, []);

  function handleMouseMove(ev) {
    const cords = { x: ev.pageX, y: ev.pageY };
    setCursorPosition(cords);
    sendCursorPositionData(room, cords);
  }

  function setCursorPosition(cords) {
    cursor.current.style.top = `+${cords.y}px`;
    cursor.current.style.left = `+${cords.x}px`;
  }

  function handleMouseDown(ev) {
    let timeleft = 2;
    var downloadTimer = setInterval(function () {
      if (timeleft <= 0) {
        determineWinner(playerName);
        /*   setState(states.looser); */
        clearInterval(downloadTimer);
      }
      console.log("count seconds", timeleft);
      timeleft -= 1;
    }, 1000);

    setAnimate(true);
    console.log("mouseDown", ev);
  }

  function handleMouseUp(ev) {
    console.log("mouseUp", ev);
  }

  function determineWinner(playerName) {
    shuffleArray(players);
    const position = players.indexOf(playerName);
    const finalRank = position + 1;
    setFinalRank(finalRank);
    if (finalRank === 1) {
      setState(states.winner);
    } else {
      setState(states.looser);
    }

    console.log("finalArray", position, players);
  }

  function renderCursor() {
    switch (state) {
      case states.winner:
        return (
          <div className="cursor winner">
            <WinnerCircle></WinnerCircle>
          </div>
        );
      case states.looser:
        return (
          <div className="cursor looser">
            <LooserCircle finalRank={finalRank}></LooserCircle>
          </div>
        );
      default:
        return (
          <div className="cursor">
            <div className={animate ? "point_1 animationRev" : "point_1"}></div>
            <div className={animate ? "point_2 animation" : "point_2"}></div>
          </div>
        );
    }
  }

  function renderName() {
    return <div>{playerName}</div>;
  }

  return (
    <div
      className="app"
      onMouseMove={(ev) => handleMouseMove(ev)}
      onMouseDown={(ev) => handleMouseDown(ev)}
      onMouseUp={(ev) => handleMouseUp(ev)}
    >
      <div ref={cursor} className="cursor_wrapper">
        {renderCursor()}
        {renderName()}
      </div>
    </div>
  );
}

function WinnerCircle() {
  return (
    <>
      <div className="point_winner" style={{ "--i": 1 }}></div>
      <div className="point_winner" style={{ "--i": 2 }}></div>
      <div className="point_winner" style={{ "--i": 3 }}></div>
      <div className="point_winner" style={{ "--i": 4 }}></div>
      <div className="point_winner" style={{ "--i": 5 }}></div>
      <div className="point_winner" style={{ "--i": 6 }}></div>
    </>
  );
}

function LooserCircle({ finalRank }) {
  return (
    <>
      <div className="point_looser" style={{ "--i": 1 }}>
        {finalRank}
      </div>
      <div className="point_looser" style={{ "--i": 2 }}>
        {finalRank}
      </div>
      <div className="point_looser" style={{ "--i": 3 }}>
        {finalRank}
      </div>
      <div className="point_looser" style={{ "--i": 4 }}>
        {finalRank}
      </div>
      <div className="point_looser" style={{ "--i": 5 }}>
        {finalRank}
      </div>
      <div className="point_looser" style={{ "--i": 6 }}>
        {finalRank}
      </div>
    </>
  );
}

export default App;
