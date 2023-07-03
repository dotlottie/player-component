import * as DotLottiePlayer from '@dotlottie/player-component'

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use(DotLottiePlayer)
})