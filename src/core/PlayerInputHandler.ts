import Camera from "./Camera";
import Experience from "./Experience";
import Player from "./World/Player";

export default class PlayerInputHandler {
  private camera: Camera;
  private player: Player;

  constructor(player: Player) {
    const experience = new Experience();
    this.camera = experience.camera;

    this.player = player;

    this.setListeners();
  }

  private handleKeyboardEvent(event: KeyboardEvent): void {
    const isKeyDown = event.type === "keydown";

    switch (event.code) {
      case "ArrowUp":
      case "KeyW":
        this.player.moveForward = isKeyDown;
        break;

      case "ArrowLeft":
      case "KeyA":
        this.player.moveLeft = isKeyDown;
        break;

      case "ArrowDown":
      case "KeyS":
        this.player.moveBackward = isKeyDown;
        break;

      case "ArrowRight":
      case "KeyD":
        this.player.moveRight = isKeyDown;
        break;

      case "Space":
        isKeyDown && this.player.jump();
        break;

      case "ShiftLeft":
        this.player.accelerate(isKeyDown);
    }
  }

  private setListeners(): void {
    document.addEventListener("keydown", (e: KeyboardEvent) =>
      this.handleKeyboardEvent(e),
    );
    document.addEventListener("keyup", (e: KeyboardEvent) =>
      this.handleKeyboardEvent(e),
    );
    document.addEventListener("click", () => {
      if (this.camera.controls.isLocked === true) {
        this.player.throwObject();
      }
    });
  }
}
