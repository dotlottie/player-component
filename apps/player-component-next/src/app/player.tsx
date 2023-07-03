'use client'

import '@dotlottie/player-component'
import { PlaybackOptions } from '@dotlottie/player-component'

export interface PlayerProps {
  src: string,
  playbackOptions?: PlaybackOptions,
  controls?: boolean
}

export default function Player(props: PlayerProps) {
  return (
    <div>
      <dotlottie-player
        src={props.src}
        autoplay={props.playbackOptions?.autoplay}
        defaultTheme={props.playbackOptions?.defaultTheme}
        direction={props.playbackOptions?.direction}
        hover={props.playbackOptions?.hover}
        intermission={props.playbackOptions?.intermission}
        loop={props.playbackOptions?.loop}
        playMode={props.playbackOptions?.playMode}
        speed={props.playbackOptions?.speed}
        controls={props.controls}>
      </dotlottie-player>
    </div>
  )
}
