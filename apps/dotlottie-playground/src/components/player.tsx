/**
 * Copyright 2023 Design Barn Inc.
 */

import type { DotLottieCommonPlayer } from '@dotlottie/react-player';
import { DotLottiePlayer, Controls, PlayerEvents } from '@dotlottie/react-player';
import React, { useState, useCallback, useRef } from 'react';

import { useAppSelector } from '../store/hooks';

import { Button } from './button';

interface PlayerProps {
  activeAnimationId?: string;
}

export const Player: React.FC<PlayerProps> = ({ activeAnimationId }) => {
  const lottiePlayer = useRef<DotLottieCommonPlayer>();

  const currentPlayerUrl = useAppSelector((state) => state.playground.playerUrl);
  const [playerStates, setPlayerStates] = useState<string[]>([]);
  const [activeStateId, setActiveStateId] = useState('');
  const [currentFrame, setCurrentFrame] = useState(0);

  const handlePlayerEvents = useCallback(
    (event: PlayerEvents, params: unknown) => {
      if (event === PlayerEvents.Ready) {
        const _states = lottiePlayer.current?.getManifest()?.states;

        setPlayerStates(_states || []);
      }

      if (event === PlayerEvents.Frame) {
        const { frame } = params as { frame: number };

        setCurrentFrame(Math.floor(frame));
      }

      const currentState = lottiePlayer.current?.getState();

      if (currentState) {
        setActiveStateId(currentState.activeStateId || '');
      }
    },
    [lottiePlayer],
  );

  const exitInteractivity = useCallback(() => {
    return () => {
      if (!lottiePlayer.current) return;
      lottiePlayer.current.exitInteractiveMode();
    };
  }, [lottiePlayer]);

  const enterInteractivity = useCallback(
    (state: string) => {
      return () => {
        if (!lottiePlayer.current) return;
        lottiePlayer.current.enterInteractiveMode(state);
      };
    },
    [lottiePlayer],
  );

  if (!currentPlayerUrl) return undefined;

  return (
    <div>
      <>
        <DotLottiePlayer
          activeAnimationId={activeAnimationId || undefined}
          background="white"
          onEvent={handlePlayerEvents}
          ref={lottiePlayer}
          src={currentPlayerUrl}
        >
          <div className="bg-white">
            <Controls />
            <div className="px-3 pb-1">
              <span className="bg-gray-300 rounded px-2">
                # <span>{currentFrame}</span>
              </span>
            </div>
          </div>
        </DotLottiePlayer>
        <div className="flex flex-wrap gap-2 p-2 text-white">
          <div className="text-white">
            <div className="mb-2 flex gap-2">
              <span>Interactivity states:</span>
              <Button disabled={!activeStateId} color="red" onClick={exitInteractivity()}>
                Exit Interactivity
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {playerStates.map((state) => {
                return (
                  <Button
                    color={activeStateId === state ? 'green' : 'blue'}
                    onClick={enterInteractivity(state)}
                    key={state}
                  >
                    {state}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </>
    </div>
  );
};
