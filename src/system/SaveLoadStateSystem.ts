import { GameManager } from "..";
import { PlayerState, playerToState, stateToPlayer } from "../network/state";

export const register = (manager: GameManager) => {
  const playerEntity = manager.context.player;

  const snapShot: number[] = [];
  const playerState = new PlayerState();

  document.addEventListener("keydown", (ev) => {
    if (ev.key === "F1") {
      playerToState(playerEntity, playerState);
      snapShot.length = 0;
      playerState.encode(true, snapShot, false);
    }
  });

  document.addEventListener("keyup", (ev) => {
    if (ev.key === "F3") {
      if (snapShot.length > 0) {
        playerState.decode(snapShot);
        stateToPlayer(playerState, playerEntity);
      }
    }
  });
};
