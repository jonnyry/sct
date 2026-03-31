import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { SlideContent } from './components/SlideContent';
import { Slide } from './components/Slide';
import { SCENES_WITH_OFFSETS } from './scenes';

export const Walkthrough: React.FC = () => (
  <AbsoluteFill>
    {SCENES_WITH_OFFSETS.map((scene) => (
      <Sequence key={scene.id} from={scene.from} durationInFrames={scene.durationInFrames}>
        <Slide duration={scene.durationInFrames}>
          <SlideContent scene={scene} />
        </Slide>
      </Sequence>
    ))}
  </AbsoluteFill>
);
