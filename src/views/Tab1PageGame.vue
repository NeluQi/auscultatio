<!-- eslint-disable vue/no-unused-components -->
<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Auscultatio Quiz</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-card>
        <ion-card-content>
          <div
            style="display: flex"
            class="flex-row justify-content-between mt-3"
            v-show="isStarted"
          >
            <ion-button id="click-trigger">
              <ion-icon name="settings-outline"></ion-icon>
            </ion-button>

            <ion-button @click="playPause">
              {{ isPlaying ? "Пауза" : "Слушать" }}
            </ion-button>

            <div class="flex justify-content-between">
              <ion-button @click="reStart">
                <ion-icon slot="start" :icon="playBackOutline"></ion-icon>
                Сначала
              </ion-button>
            </div>
          </div>
          <div v-show="!isStarted">
            <ion-button @click="startPlay" expand="full"> Начать </ion-button>
          </div>

          <ion-button
            v-show="isStarted"
            class="mt-3"
            id="open-modal"
            @click="pause"
            expand="block"
            >ОТВЕТ</ion-button
          >

          <ion-modal ref="modal" trigger="open-modal">
            <ion-header>
              <ion-toolbar>
                <ion-buttons slot="start">
                  <ion-button @click="cancelDialog()">Закрыть</ion-button>
                </ion-buttons>
              </ion-toolbar>
            </ion-header>
            <ion-content class="ion-padding">
              <ion-item>
                <ion-label class="m-3" position="stacked">{{ currSound.name }}</ion-label>

                <a :href="currSound.link">Ссылка</a>

                <iframe
                  style="overflow: hidden; display: block; height: 90vh; width: 90vw"
                  :src="currSound.link"
                  title="YouTube video player"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                ></iframe>
              </ion-item>
            </ion-content>
          </ion-modal>

          <ion-popover trigger="click-trigger" trigger-action="click">
            <ion-content class="ion-padding">
              <ion-range
                v-model:value="rate"
                @ionChange="rateChange"
                :min="50"
                :pin="true"
              >
                <ion-icon slot="start" name="play-skip-back-outline"></ion-icon>
                <ion-icon slot="end" name="play-skip-forward-outline"></ion-icon>
              </ion-range>

              <ion-range
                v-model:value="volumeBoost"
                @ionChange="volumeBoostChange"
                :pin="true"
                :ticks="true"
                :snaps="true"
                :min="1"
                :max="10"
              >
                <ion-icon slot="start" name="megaphone-outline"></ion-icon>
              </ion-range>

              <ion-range v-model:value="volume" @ionChange="volumeChange" :pin="true">
                <ion-icon slot="start" :icon="volumeMuteOutline"></ion-icon>
                <ion-icon slot="end" :icon="volumeHighOutline"></ion-icon> </ion-range
            ></ion-content>
          </ion-popover>

          <div
            class="ion-align-items-center mt-4 d-flex align-items-center align-self-center w-full"
            v-if="isAnswerSelect"
          >
            <div class="text-center w-full text-green-600 text-xl" v-if="isWin">
              <ion-icon name="checkmark-circle-outline" class="text-success"></ion-icon>
              Победа!
            </div>
            <div class="text-center w-full text-pink-500 text-xl" v-else>
              <ion-icon name="close-circle-outline" class="text-danger"></ion-icon>
              Попробуй еще :(
            </div>

            <div v-if="isWin" class="text-center flex flex-column w-full text-xl">
              {{ currSound.name }}

              <ion-button @click="next"> Дальше </ion-button>
            </div>
          </div>
        </ion-card-content>
      </ion-card>

      <div
        v-if="answers && answers.length > 0"
        style="position: absolute; margin: auto; left: 0; right: 0; bottom: 51px"
      >
        <ion-grid :fixed="true" class="h-full" v-if="answers.length">
          <ion-row
            class="ion-align-items-center d-flex align-items-center align-self-center"
            v-for="(answer, index) in answers"
            :key="index"
          >
            <ion-col>
              <div class="d-flex align-items-center align-self-center">
                <ion-button
                  :color="
                    answer.disabled ? (answer.isWin ? 'success' : 'danger') : 'primary'
                  "
                  :disabled="answer.disabled"
                  @click="selectAnswer(answer)"
                  expand="full"
                  class="white-space-normal"
                >
                  {{ answer.name }}
                </ion-button>
              </div>
            </ion-col>
          </ion-row>
        </ion-grid>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonPopover,
} from "@ionic/vue";
import { IonCol, IonGrid, IonRow } from "@ionic/vue";
import { IonButton } from "@ionic/vue";
import { IonRange } from "@ionic/vue";
import { IonIcon } from "@ionic/vue";
import { volumeMuteOutline, volumeHighOutline, playBackOutline } from "ionicons/icons";
import { Howl, Howler } from "howler";
import { IonCard, IonCardContent } from "@ionic/vue";
import { IonButtons, IonModal, IonItem, IonInput, IonLabel } from "@ionic/vue";
import { OverlayEventDetail } from "@ionic/core/components";

export default defineComponent({
  name: "GameMainPage",
  data() {
    return {
      volumeMuteOutline,
      volumeHighOutline,
      playBackOutline,
      sounder: null as Howl | null,
      audioSourceNode: null as AudioNode | any,
      gainNode: null as GainNode | any,
      volumeBoost: 1,
      volume: 50,
      rate: 100,
      currSound: null as any,
      answers: [] as any[],
      isWin: false,
      isAnswerSelect: false,
      isStarted: false,
      sounds: [
        {
          name: "Aortic Regurgitation",
          src: "sound/Aortic Regurgitation  - Heart Sounds.mp3",
          link: "https://www.youtube.com/watch?v=uZysrKXHJMM&t=0",
        },
        {
          name: "Aortic Stenosis",
          src: "sound/Aortic Stenosis - Heart Sounds.mp3",
          link: "https://www.youtube.com/watch?v=pgDWz1JybzE",
        },
        {
          name: "Atrial Septal Defect",
          src: "sound/Atrial Septal Defect - Heart Sounds.mp3",
          link: "https://www.youtube.com/watch?v=W8gg2S-mvSQ&t",
        },
        {
          name: "Fixed Split S2",
          src: "sound/Fixed Split S2 - Heart Sounds.mp3",
          link: "https://www.youtube.com/watch?v=98HM1fr3cq4&t",
        },
        {
          name: "Holosystolic Murmur",
          src: "sound/Holosystolic Murmur - Heart Sounds.mp3",
          link: "https://www.youtube.com/watch?v=MzORJbyHTT0&t",
        },
        {
          name: "Innocent Heart Murmur (and Physiologic Murmur)",
          src: "sound/Innocent Heart Murmur (and Physiologic Murmur) - Heart Sounds.mp3",
          link: "https://www.youtube.com/watch?v=uFyWHPfrRak&t",
        },
        {
          name: "Mitral Stenosis",
          src: "sound/Mitral Stenosis Heart Sound.mp3",
          link: "https://www.youtube.com/watch?v=5oCPtZo4pUY&t",
        },
        {
          name: "Mitral Valve Prolapse",
          src: "sound/Mitral Valve Prolapse - Heart Sounds.mp3",
          link: "https://www.youtube.com/watch?v=sH_KmHIHR70&t",
        },
        {
          name: "Normal Heart",
          src: "sound/Normal Heart Sounds.mp3",
          link: "https://www.youtube.com/watch?v=FtXNnmifbhE",
        },
        {
          name: "Pulmonary Stenosis (aka Pulmonic Stenosis)",
          src: "sound/Pulmonary Stenosis (aka Pulmonic Stenosis) - Heart Sounds.mp3",
          link: "https://www.youtube.com/watch?v=cyhre7Zy2FU&t",
        },
        {
          name: "S3 and S4 Gallop",
          src: "sound/S3 and S4 Gallop - Heart Sounds.mp3",
          link: "https://www.youtube.com/watch?v=o8eqYHCy7dw",
        },
        {
          name: "S3",
          src: "sound/S3 Heart Sound.mp3",
          link: "https://www.youtube.com/watch?v=_i2D1KZkN1w&t",
        },
        {
          name: "S4",
          src: "sound/S4 Heart Sound.mp3",
          link: "https://www.youtube.com/watch?v=KcMF8rJDTIk&t",
        },
        {
          name: "Sounds of Heart Failure",
          src: "sound/Sounds of Heart Failure.mp3",
          link: "https://www.youtube.com/watch?v=uHKdaDGIypY&t",
        },
        {
          name: "Sounds of Myocardial Infarction",
          src: "sound/Sounds of Myocardial Infarction.mp3",
          link: "https://www.youtube.com/watch?v=JZYGQTjDvLk&t",
        },
        {
          name: "Split S1",
          src: "sound/Split S1 - Heart Sounds.mp3",
          link: "https://www.youtube.com/watch?v=kvQ2IU3ILRo&t",
        },
        {
          name: "Transient Split S2",
          src: "sound/Transient Split S2 - Heart Sounds.mp3",
          link: "https://www.youtube.com/watch?v=ECrIdk8Fhb0&t",
        },
      ],
    };
  },
  computed: {
    isPlaying() {
      return this.sounder && this.sounder.playing();
    },
  },
  mounted() {
    // make sure we have the audio context
    this.isStarted = false;
  },
  methods: {
    cancelDialog() {
      (this.$refs as any)?.modal?.$el?.dismiss(null, "cancel");
    },
    next() {
      this.isAnswerSelect = false;
      this.isWin = false;

      this.startPlay();
    },
    init() {
      this.answers = [];
      this.currSound = this.arrayRandElement(this.sounds);
      this.isWin = false;
      this.isAnswerSelect = false;
      this.answers.push(this.currSound);

      while (this.answers.length < 4) {
        let randSound = this.arrayRandElement(this.sounds);
        if (this.answers.indexOf(randSound) === -1) {
          this.answers.push(randSound);
        }
      }

      this.answers = this.shuffle(this.answers);

      this.answers.forEach((element) => {
        element.disabled = false;
        element.isWin = false;
      });
    },
    selectAnswer(data: any) {
      data.disabled = true;

      this.isAnswerSelect = true;
      if (data.name == this.currSound.name) {
        this.isWin = true;
        data.isWin = true;
      } else {
        this.isWin = false;
        data.isWin = false;
      }
    },
    shuffle(array: any) {
      let currentIndex = array.length,
        randomIndex;

      // While there remain elements to shuffle.
      while (currentIndex != 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
          array[randomIndex],
          array[currentIndex],
        ];
      }

      return array;
    },
    arrayRandElement(arr: any[]) {
      var rand = Math.floor(Math.random() * arr.length);
      return arr[rand];
    },
    volumeChange({ detail }: any) {
      if (this.sounder) {
        this.sounder.volume(detail.value / 100);
      }
    },
    playPause() {
      if (this.sounder) {
        this.sounder.playing() ? this.sounder.pause() : this.sounder.play();
      }
    },
    pause() {
      if (this.sounder) {
        this.sounder.pause();
      }
    },
    startPlay() {
      this.init();
      this.isStarted = true;
      this.play(this.currSound.src);
    },
    rateChange({ detail }: any) {
      if (this.sounder && detail.value / 100 > 0.5) {
        this.sounder.rate(detail.value / 100);
      }
    },
    volumeBoostChange({ detail }: any) {
      if (this.gainNode?.gain) {
        this.gainNode.gain.value = detail.value;
      }
    },
    reStart() {
      if (this.sounder) {
        this.sounder.seek(0);
      }
    },
    play(url: string) {
      if (this.sounder) {
        this.sounder.stop();
        this.sounder.unload();
        this.sounder = null;
      }

      this.sounder = new Howl({
        src: url,
        html5: true,
      });

      this.sounder.volume(0.5);
      this.volume = 50;

      const audioCtx = Howler.ctx;

      if (!this.audioSourceNode) {
        this.audioSourceNode = audioCtx.createMediaElementSource(
          (this.sounder as any)._sounds[0]._node
        );

        this.gainNode = audioCtx.createGain();
        this.gainNode.gain.value = 1;
        this.audioSourceNode.connect(this.gainNode);

        // connect the gain node to an output destination
        this.gainNode.connect(audioCtx.destination);
      }
      if (this.sounder) {
        this.sounder.play();
      }
    },
  },
  components: {
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonPage,
    IonCol,
    IonGrid,
    IonRow,
    IonButton,
    IonRange,
    IonIcon,
    IonCard,
    IonCardContent,
    IonPopover,
    IonButtons,
    IonModal,
    IonItem,
    IonLabel,
  },
});
</script>

<style>
#canvas {
  /*   position: fixed;
  left: 0;
  top: 0; */
  width: 100%;
  height: 100%;
}
</style>
