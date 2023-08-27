/**
 * Copyright 2023 Design Barn Inc.
 */

import React, { useCallback, useEffect, useMemo } from 'react';
import { BiSolidSave } from 'react-icons/bi';

import { useDotLottie } from '../hooks/use-dotlottie';
import {
  type EditorAnimationOptions,
  updateEditorAnimationOptions,
  setEditorAnimationOptions,
  setEditorUpdated,
} from '../store/editor-slice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

import { InputBoolean, InputNumber, InputSelect, type InputSelectOption } from './input-fields';

interface PlaybackOptionsEditorProps {
  onUpdate: () => void;
}

export const PlaybackOptionsEditor: React.FC<PlaybackOptionsEditorProps> = ({ onUpdate }) => {
  const { dotLottie, setAnimationOptions } = useDotLottie();
  const dispatch = useAppDispatch();

  const animationOptions: EditorAnimationOptions = useAppSelector((state) => {
    return state.editor.animationOptions;
  });

  const animationId = useAppSelector((state) => state.editor.animationId);
  const editorUpdated = useAppSelector((state) => state.editor.updated);
  const allThemes = useAppSelector((state) => state.themes.list);

  const themeSelectorOptions = useMemo(() => allThemes.map(({ name }) => ({ label: name, value: name })), [allThemes]);

  const assignedThemes = useMemo<InputSelectOption[] | undefined>(() => {
    const defaultOptions = [
      {
        label: 'None',
        value: '',
      },
    ];

    if (typeof animationOptions.assignedThemes !== 'undefined' && Array.isArray(animationOptions.assignedThemes))
      return defaultOptions;

    return defaultOptions.concat(
      animationOptions.assignedThemes?.split(',').map((themeId) => {
        return {
          label: themeId,
          value: themeId,
        };
      }) || [],
    );
  }, [animationOptions, animationId]);

  useEffect(() => {
    if (!animationId) return undefined;

    (async (): Promise<void> => {
      const animation = await dotLottie.getAnimation(animationId);

      if (animation) {
        dispatch(
          setEditorAnimationOptions({
            direction: animation.direction,
            speed: animation.speed,
            playMode: animation.playMode,
            loop: animation.loop,
            autoplay: animation.autoplay,
            hover: animation.hover,
            intermission: animation.intermission,
            defaultTheme: animation.defaultTheme,
            assignedThemes: animation.themes.map((theme) => theme.id).join(',') || undefined,
            defaultActiveAnimation: animation.defaultActiveAnimation,
          }),
        );
      }
    })();

    return () => {
      dispatch(setEditorAnimationOptions({}));
    };
  }, [dispatch, dotLottie, animationId]);

  const update = useCallback(
    (key: string) => {
      return (value: unknown): void => {
        // Remove from defaultTheme, if assignedThemes doesn't have the selected theme. User must've removed it
        if (
          key === 'assignedThemes' &&
          !String(value)
            .split(',')
            .includes(animationOptions.defaultTheme || '')
        ) {
          dispatch(
            updateEditorAnimationOptions({
              defaultTheme: '',
            }),
          );
        }

        dispatch(
          updateEditorAnimationOptions({
            [key]: value,
          }),
        );
        dispatch(setEditorUpdated(true));
      };
    },
    [dispatch, animationOptions],
  );

  const handleSave = useCallback(() => {
    if (animationId) {
      setAnimationOptions(animationId, animationOptions);
      dispatch(setEditorUpdated(false));
      onUpdate();
    }
  }, [animationId, animationOptions, setAnimationOptions, dispatch, onUpdate]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-stretch pr-4 flex-shrink border-b border-gray-600">
        <span className="text-white text-sm border-b border-b-blue-500 border-r border-gray-600 px-4 flex items-center">
          Animation: {animationId}
        </span>
        <button
          title="Save"
          className="text-gray-400 py-1 hover:text-white disabled:text-gray-700"
          onClick={handleSave}
          disabled={!editorUpdated}
        >
          <BiSolidSave size={33} />
        </button>
      </div>
      <div className="p-8 flex-1 max-h-[calc(100vh-5.5rem)] overflow-y-auto custom-scrollbar">
        <div className="text-white">Playback options</div>
        <ul>
          {Object.keys(animationOptions).map((key): React.ReactNode => {
            if (['loop', 'autoplay', 'hover'].includes(key)) {
              return (
                <li key={key}>
                  <InputBoolean label={key} value={animationOptions[key]} onToggle={update(key)} />
                </li>
              );
            } else if (['playMode'].includes(key)) {
              return (
                <li key={key}>
                  <InputSelect
                    onChange={update(key)}
                    label={key}
                    value={animationOptions[key] as string}
                    options={[
                      { label: 'Normal', value: 'normal' },
                      { label: 'Bounce', value: 'bounce' },
                    ]}
                  />
                </li>
              );
            } else if (['direction'].includes(key)) {
              return (
                <li key={key}>
                  <InputSelect
                    onChange={update(key)}
                    label={key}
                    value={String(animationOptions[key])}
                    options={[
                      { label: 'Normal', value: '1' },
                      { label: 'Inverted', value: '-1' },
                    ]}
                  />
                </li>
              );
            } else if (['speed', 'intermission'].includes(key)) {
              return (
                <li key={key}>
                  <InputNumber label={key} value={animationOptions[key] as number} onChange={update(key)} />
                </li>
              );
            } else if (['defaultTheme'].includes(key)) {
              return (
                <li key={key}>
                  <InputSelect
                    onChange={update(key)}
                    label="defaultTheme"
                    options={assignedThemes || []}
                    value={animationOptions[key] || ''}
                  />
                </li>
              );
            } else {
              return undefined;
            }
          })}
        </ul>
        <div className="text-white mt-8">Other options</div>
        <div>
          <InputSelect
            multiple
            onChange={update('assignedThemes')}
            label="Assign Themes"
            value={animationOptions.assignedThemes}
            options={themeSelectorOptions}
          />
          <InputBoolean
            label="Default ActiveAnimation"
            value={animationOptions.defaultActiveAnimation}
            onToggle={update('defaultActiveAnimation')}
          />
        </div>
      </div>
    </div>
  );
};
