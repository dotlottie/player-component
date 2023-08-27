/**
 * Copyright 2023 Design Barn Inc.
 */

import { DotLottiePlayer, Controls, PlayerEvents, type DotLottieRefProps } from '@dotlottie/react-player';
import React, { useState, useCallback, useRef } from 'react';

import { useAppSelector } from '../store/hooks';

import { Button } from './button';

interface PlayerProps {}

export const Player: React.FC<PlayerProps> = () => {
  const lottiePlayer = useRef<DotLottieRefProps>();

  const currentPlayerUrl = useAppSelector((state) => state.playground.playerUrl);
  const [playerStates, setPlayerStates] = useState<string[]>([]);
  const [activeStateId, setActiveStateId] = useState('');

  const handlePlayerEvents = useCallback(
    (event: PlayerEvents) => {
      if (event === PlayerEvents.Ready) {
        const _states = lottiePlayer.current?.getManifest()?.states;

        setPlayerStates(_states || []);
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
          background="white"
          onEvent={handlePlayerEvents}
          lottieRef={lottiePlayer}
          src={currentPlayerUrl}
        >
          <Controls />
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
