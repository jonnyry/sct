import React from 'react';
import { Composition } from 'remotion';
import { Walkthrough } from './Walkthrough';
import { TOTAL_FRAMES } from './scenes';

export const Root: React.FC = () => (
  <Composition
    id="SctWalkthrough"
    component={Walkthrough}
    durationInFrames={TOTAL_FRAMES}
    fps={30}
    width={1920}
    height={1080}
    defaultProps={{}}
  />
);
