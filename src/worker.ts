import { unzipSync, strFromU8 } from 'fflate';

self.addEventListener('message', message => {
  fetch(message.data, {
    method: 'GET',
    mode: 'cors',
    headers: {
      'Response-Type': 'arraybuffer',
    },
  })
    .then(buffer => {
      return buffer.arrayBuffer();
    })
    .then(buffer => {
      const animations: any[] = [];
      const animAndManifest: Record<string, any> = {};

      const data = unzipSync(new Uint8Array(buffer));
      if (data['manifest.json']) {
        const str = strFromU8(data['manifest.json']);
        const manifest = JSON.parse(str);

        if (!('animations' in manifest)) {
          throw new Error('Manifest not found');
        }

        if (manifest.animations.length === 0) {
          throw new Error('No animations listed in the manifest');
        }

        animAndManifest.manifest = manifest;

        let lottieJson;
        for (const animName of manifest.animations) {
          lottieJson = JSON.parse(strFromU8(data[`animations/${animName.id}.json`]));

          if ('assets' in lottieJson) {
            lottieJson.assets.map((asset: any) => {
              if (!asset.p) {
                return;
              }
              if (data[`images/${asset.p}`] === null) {
                return;
              }
              const base64Png = btoa(strFromU8(data[`images/${asset.p}`], true));
              asset.p = 'data:;base64,' + base64Png;
              asset.e = 1;
            });
          }
          animations.push(lottieJson);
        }
        animAndManifest.manifest = manifest;
        animAndManifest.animations = animations;
        postMessage(animAndManifest);
      } else {
        postMessage('[dotLottie] No manifest found in file.');
      }
    })
    .catch(error => {
      postMessage('[dotLottie] ' + error);
    });
});

self.addEventListener('error', errorMessage => {
  postMessage('[dotLottie] ' + errorMessage);
});
