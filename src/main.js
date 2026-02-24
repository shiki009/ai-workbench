import { Sidebar } from './ui/Sidebar.js';
import { Workspace } from './ui/Workspace.js';
import { StatusBar } from './ui/StatusBar.js';
import { Toast } from './ui/Toast.js';
import { ToolRegistry } from './tools/ToolRegistry.js';
import { StorageManager } from './storage/StorageManager.js';
import { AIManager } from './ai/AIManager.js';
import { OnboardingOverlay } from './onboarding/OnboardingOverlay.js';

async function main() {
  // Storage
  const storage = new StorageManager();
  await storage.init();

  // AI
  const aiManager = new AIManager();

  // UI
  const workspace = new Workspace();
  const toolRegistry = new ToolRegistry(workspace, aiManager, storage);
  const sidebar = new Sidebar(toolRegistry.getDefinitions());
  const statusBar = new StatusBar();
  const toast = new Toast();

  // Settings button
  document.getElementById('btn-settings').addEventListener('click', () => {
    sidebar.toggle();
  });

  // Onboarding
  const onboarding = new OnboardingOverlay(storage);
  onboarding.check();

  console.log('AI Workbench initialized');
}

main().catch(console.error);
