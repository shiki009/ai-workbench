import { SceneManager } from './scene/SceneManager.js';
import { Room } from './scene/Room.js';
import { Lighting } from './scene/Lighting.js';
import { CameraController } from './scene/CameraController.js';
import { PostProcessing } from './scene/PostProcessing.js';
import { SkyboxBackground } from './scene/SkyboxBackground.js';
import { RaycastInteraction } from './input/RaycastInteraction.js';
import { PanelManager } from './ui3d/PanelManager.js';
import { ToolShelf } from './ui3d/ToolShelf.js';
import { ToolRegistry } from './tools/ToolRegistry.js';
import { StorageManager } from './storage/StorageManager.js';
import { AIManager } from './ai/AIManager.js';
import { OnboardingOverlay } from './onboarding/OnboardingOverlay.js';
import { eventBus } from './events.js';
import { EVENTS } from './constants.js';

async function main() {
  const container = document.getElementById('app');

  // Core 3D
  const sceneManager = new SceneManager(container);
  const room = new Room(sceneManager.scene);
  const lighting = new Lighting(sceneManager.scene);
  const skybox = new SkyboxBackground(sceneManager.scene);
  const postProcessing = new PostProcessing(sceneManager);
  const cameraController = new CameraController(sceneManager.camera, sceneManager.domElement);

  // Input
  const raycaster = new RaycastInteraction(sceneManager);

  // Storage
  const storage = new StorageManager();
  await storage.init();

  // AI
  const aiManager = new AIManager();

  // Panels & Tools
  const panelManager = new PanelManager(sceneManager, raycaster);
  const toolRegistry = new ToolRegistry(panelManager, aiManager, storage);
  const toolShelf = new ToolShelf(sceneManager, toolRegistry, raycaster, cameraController);

  // Wire up tool shelf icon clicks
  raycaster.onToolIconClick = (toolType) => {
    toolShelf.handleClick(toolType);
  };

  // Onboarding
  const onboarding = new OnboardingOverlay(storage, toolShelf);
  onboarding.check();

  // Update loop
  sceneManager.onUpdate((delta) => {
    cameraController.update(delta);
    skybox.update(delta);
    raycaster.update();
    panelManager.update(delta);
    toolShelf.update(delta);
  });

  // Load saved workspace
  eventBus.emit(EVENTS.WORKSPACE_LOAD);

  sceneManager.start();
  console.log('Spatial AI Workbench initialized');
}

main().catch(console.error);
