import React from 'react';
import { StudioProvider } from './context/StudioContext';
import { PhotoshopMenuBar } from './components/PhotoshopMenuBar';
import { PhotoshopOptionsBar } from './components/PhotoshopOptionsBar';
import { PhotoshopTabBar } from './components/PhotoshopTabBar';
import { PhotoshopToolbar } from './components/PhotoshopToolbar';
import { PhotoshopRulers } from './components/PhotoshopRulers';
import { PhotoshopRightDock } from './components/PhotoshopRightDock';
import { PhotoshopStatusBar } from './components/PhotoshopStatusBar';
import { CanvasArea } from './components/CanvasArea';
import { TemplatesModal } from './components/TemplatesModal';
import { EvidenceModal } from './components/EvidenceModal';
import { CameraRawFilterModal } from './components/CameraRawFilterModal';
import { HueSaturationModal } from './components/HueSaturationModal';
import { LevelsModal } from './components/LevelsModal';
import { NewDocumentModal } from './components/NewDocumentModal';
import { SvgCodeEditorModal } from './components/SvgCodeEditorModal';

export const AppContent: React.FC = () => {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#262626] text-[#cccccc] font-sans antialiased select-none text-[12px]">
      {/* 1. Photoshop Classic Menu Bar */}
      <PhotoshopMenuBar />

      {/* 2. Photoshop Contextual Options Bar */}
      <PhotoshopOptionsBar />

      {/* 3. Photoshop Document Tab Bar */}
      <PhotoshopTabBar />

      {/* 4. Main Workspace */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Photoshop Vertical Toolbar */}
        <PhotoshopToolbar />

        {/* Center Workspace with Photoshop Rulers & Canvas */}
        <PhotoshopRulers>
          <CanvasArea />
        </PhotoshopRulers>

        {/* Right Photoshop Multi-Tab Dock */}
        <PhotoshopRightDock />
      </div>

      {/* 5. Photoshop Bottom Status Bar */}
      <PhotoshopStatusBar />

      {/* Modals & Photoshop Dialogs */}
      <NewDocumentModal />
      <TemplatesModal />
      <EvidenceModal />
      <CameraRawFilterModal />
      <HueSaturationModal />
      <LevelsModal />
      <SvgCodeEditorModal />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <StudioProvider>
      <AppContent />
    </StudioProvider>
  );
};

export default App;
