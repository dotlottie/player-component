import React, { useCallback, useEffect } from 'react';
import { useDotLottie } from '../hooks/use-dotlottie';
import { PlayMode, PlaybackOptions } from '@dotlottie/react-player';
import { BooleanEditor } from './input-editor/boolean';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setEditorPlaybacOptions, setEditorUpdated } from '../store/editorSlice';
import { InputDropdown } from './input-editor/dropdown';
import { InputNumber } from './input-editor/input-number';
import { BiSolidSave } from 'react-icons/bi';

interface PlaybackOptionsEditorProps {
  onUpdate: () => void;
}

export const DEFAULT_OPTIONS: PlaybackOptions = {
  autoplay: false,
  direction: 1,
  hover: false,
  intermission: 0,
  loop: false,
  playMode: PlayMode.Normal,
  speed: 1,
  defaultTheme: '',
};

export const PlaybackOptionsEditor: React.FC<PlaybackOptionsEditorProps> = ({ onUpdate }) => {
  const { dotLottie, setPlaybackOptions } = useDotLottie();
  const dispatch = useAppDispatch();

  const playbackOptions = useAppSelector((state) => state.editor.playbackOptions);
  const animationId = useAppSelector((state) => state.editor.animationId);
  const editorUpdated = useAppSelector((state) => state.editor.updated);

  useEffect(() => {
    if (!animationId) return;

    (async () => {
      const animation = await dotLottie.getAnimation(animationId);

      console.log('animationId', animation);
      if (animation) {
        dispatch(
          setEditorPlaybacOptions({
            direction: animation.direction,
            speed: animation.speed,
            playMode: animation.playMode,
            loop: animation.loop,
            autoplay: animation.autoplay,
            hover: animation.hover,
            intermission: animation.intermission,
          }),
        );
      }
    })();
  }, [dispatch, dotLottie, animationId]);

  const update = useCallback(
    (key: string) => {
      return (value: unknown): void => {
        console.log('updating', key, value);
        dispatch(
          setEditorPlaybacOptions({
            [key]: value,
          }),
        );
        dispatch(setEditorUpdated(true));
      };
    },
    [dispatch],
  );

  const handleSave = useCallback(() => {
    if (playbackOptions && animationId) {
      setPlaybackOptions(animationId, playbackOptions);
      dispatch(setEditorUpdated(false));
      onUpdate();
    }
  }, [animationId, playbackOptions, setPlaybackOptions]);

  return (
    <div>
      <div className="flex justify-end pr-4 py-1 flex-shrink border-b border-gray-600">
        <button
          title="Save"
          className="text-gray-400 hover:text-white disabled:text-gray-700"
          onClick={handleSave}
          disabled={!editorUpdated}
        >
          <BiSolidSave size={33} />
        </button>
      </div>
      <div className="p-8">
        <div className="text-gray-400 text-2xl mb-4">Animation: {animationId}</div>
        <ul>
          {Object.keys(playbackOptions).map((key) => {
            switch (key) {
              case 'loop':
              case 'autoplay':
              case 'hover':
                return (
                  <li key={key}>
                    <BooleanEditor label={key} value={playbackOptions[key] as boolean} onToggle={update(key)} />
                  </li>
                );
              case 'playMode':
                return (
                  <li key={key}>
                    <InputDropdown
                      label={key}
                      value={playbackOptions[key] as string}
                      onChange={update(key)}
                      items={[
                        { name: 'Normal', value: 'normal' },
                        { name: 'Bounce', value: 'bounce' },
                      ]}
                    />
                  </li>
                );
              case 'direction':
                return (
                  <li key={key}>
                    <InputDropdown
                      label={key}
                      value={playbackOptions[key] as string}
                      onChange={update(key)}
                      items={[
                        { name: 'Normal', value: '1' },
                        { name: 'Inverted', value: '-1' },
                      ]}
                    />
                  </li>
                );

              case 'speed':
              case 'intermission':
                return (
                  <li key={key}>
                    <InputNumber label={key} value={playbackOptions[key] as number} onChange={update(key)} />
                  </li>
                );
            }
          })}
        </ul>
      </div>
    </div>
  );
};
