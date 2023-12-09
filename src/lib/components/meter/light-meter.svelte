<!-- NB: this is not a "dumb" component with all this camera handling logic. -->
<!-- Proper next step is to move logic outside to utils/camera.ts for example -->
<!-- And keep the component solelyl for UI representation -->

<script lang="ts">
    import { onMount } from 'svelte';
    import { flip } from 'svelte/animate';
    import { quintOut } from 'svelte/easing';

    import type { CameraData } from '$lib/types/CameraData';

    import MoonIcon from '$lib/components/icons/MoonIcon.svelte';
    import SunIcon from '$lib/components/icons/SunIcon.svelte';
    import EyeIcon from '$lib/components/icons/EyeIcon.svelte';

    // possible to omit min though because it defaults to 0
    // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meter#high_and_low_range_example
    export let min = 0;
    export let max = 1;
    export let optimum = 0.65;
    export let useCamera = true;
    export let value = 0;

    $: activeSegment = calculateSegment(value);

    let hasAcceptedCameraUse = false;
    let video: CameraData['video'];
    let canvas: CameraData['canvas'];
    let canvasContext: CameraData['canvasContext'];

    /**
     * Marks that the user has accepted camera use and proceeds with accessing the camera data.
     * @function acceptCameraUse
     * @returns {void}
     */
    function acceptCameraUse() {
        hasAcceptedCameraUse = true;

        prepareCameraData()
            .then(({ video: videoEl, canvas: canvasEl, canvasContext: canvasContextEl }) => {
                video = videoEl;
                canvas = canvasEl;
                canvasContext = canvasContextEl;
                analyzeFrame();
            })
            .catch(() => {
                alert('Could not access camera. Please allow camera access.');
            });
    }

    // just checking if the values comply with the HTML <meter>, should implement actual UX constraints
    $: {
        if(min > max){
            console.error("'min' should always be less than 'max'");
        }
        if(optimum < min || optimum > max){
            console.error("'optimum' should be between 'min' and 'max'");
        }
    }


    /**
     * Initializes and prepares the video stream from the user's
     * media devices (camera). It creates a video and canvas elements and fetches
     * the context of the canvas.
     *
     * @async
     * @function
     * @returns {Promise<{video: HTMLVideoElement, canvas: HTMLCanvasElement, canvasContext: CanvasRenderingContext2D}>} Object containing the video element, canvas element and the canvas context.
     */
    async function prepareCameraData(): Promise<CameraData>{
        try {
            const videoStreamPromise = navigator.mediaDevices.getUserMedia({ video: true });

            video = document.createElement('video');
            video.srcObject = await videoStreamPromise;
            await video.play();

            const canvas = document.createElement('canvas');

            // https://html.spec.whatwg.org/multipage/canvas.html#concept-canvas-will-read-frequently
            const canvasContext = canvas.getContext('2d', { willReadFrequently: true });

            return { video, canvas, canvasContext };
        } catch(error) {
            console.error('Could not access camera. Please allow camera access.');
            return { video: null, canvas: null, canvasContext: null };
        }
    }

    /**
     * Analyzes the current video frame and updates the variable `value` to the average brightness of the frame.
     * Calls itself recursively after a delay to continuously analyze the video frames.
     */
    const analyzeFrame = () => {
        if (!video || !canvas || !canvasContext) {
            return;
        }

        canvasContext!.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvasContext!.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        let brightness = 0;
        for (let i = 0; i < data.length; i += 4) {
            // 3 * 255 is here to normalize brightness values (RGB 255) between 0 and 1
            brightness += (data[i] + data[i + 1] + data[i + 2]) / (3 * 255);
        }
        brightness /= (data.length / 4);

        // for testing purposes - adjusting brightness value to my room lighting
        brightness = brightness * 2;

        value = Number(brightness.toFixed(2));

        // throttle
        setTimeout(() => {
            requestAnimationFrame(analyzeFrame);
        }, 300);
    };

    onMount(async () => {
        if (!useCamera || hasAcceptedCameraUse) {
            return;
        }
    });

    /**
     * Given an input value, this function calculates active segment number in the meter
     *
     * @param {number} value - brightness value
     * @param {number} [numSegments=7] - total number of segments (default is 7)
     * @return {number} active segment number
     */
    function calculateSegment(value: number, numSegments: number = 7): number {
        const segmentSize = (max - min) / numSegments;
        const activeSegment = Math.min(Math.floor((value - min) / segmentSize) + 1, numSegments);

        return activeSegment;
    }
</script>

{#if !hasAcceptedCameraUse && useCamera}
    <div class="camera-prompt-container">
        <p>We need access to your camera to proceed.</p>
        <p>Please poke the eye below ;)</p>
        <button class="camera-btn" on:click={acceptCameraUse}>
             <svelte:component size="35" this={EyeIcon} />
        </button>
    </div>
{/if}

<div class="meter-container">
    <span class="icon moon {value >= optimum ? 'dimmed' : ''}">
        <svelte:component size="20" this={MoonIcon} />
    </span>
    <ul class="meter">
        {#each Array(7) as _, index (index)}
            <li
                    class="bar bar-{index}"
                    class:maximized={activeSegment === index + 1}
                    animate:flip={{ duration: 800, easing: quintOut }}
            />
        {/each}
    </ul>
    <span class="icon sun {value < optimum ? 'dimmed' : ''}">
        <svelte:component size="24" this={SunIcon} />
    </span>
</div>

<style lang="scss">
    .camera-prompt-container {
        position: absolute;
        top: 4rem;
        left: auto;
        display: flex;
        flex-direction: column;
        justify-items: center;
        align-items: center;
        color: white;
        text-align: center;
        line-height: 2rem;
        letter-spacing: 1px;
        gap: 0.25rem;

        .camera-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 4rem;
            height: 4rem;
            padding: 0.5rem;
            border: 0;
            border-radius: 15px;
            background: #333333;
            box-shadow:  6px 6px 13px #2a2a2a,
            -6px -6px 13px #3c3c3c;
            color: white;
            cursor: pointer;
            transition: all 0.2s ease-in-out;
            margin-top: 0.5rem;

            &:hover {
                color: darkorange;
            }
        }
    }

    .meter-container {
        width: 100%;
        max-width: 14.875rem;
        min-height: 3.625rem;
        padding: 0.5rem;
        display: flex;
        gap: 1.75rem;
        background-color: #333;
        align-items: center;
        justify-content: space-between;

        & .icon {
            width: fit-content;
            overflow: hidden;
            color: #FFFFFF;

            &.moon {
                height: 20px;
                padding: 0.375rem;
            }

            &.sun {
                height: 24px;
                padding: 0.25rem;
            }


            &.dimmed {
                color: #FFFFFF66;
            }
        }

        & .meter {
            width: 100%;
            max-width: 7.375rem;
            height: 100%;
            padding: 0;
            margin: 0;
            display: flex;
            gap: 0.625rem;
            align-items: center;
            justify-content: space-around;
            list-style: none;

            & .bar {
                min-height: 1.5rem;
                height: 100%;
                width: 0.5rem;
                border-radius: 0.1875rem;
                background-color: #FFFFFF66;

                &.maximized {
                    height: 2.625rem;
                    background-color: #FFFFFF;
                    box-shadow: 0px 0px 24px -2px #FFFFFF, 0px 0px 6px -1px #FFFFFF;
                }

                /* highlight all bars that come BEFORE maximized */
                &:not(.maximized ~ li) {
                    background-color: #FFFFFF;
                    box-shadow: 0px 0px 24px -2px #FFFFFF, 0px 0px 6px -1px #FFFFFF;
                }
            }
        }
    }

    @media screen and (max-width: 320px) {
        .meter-container {
            max-width: 13.375rem;
            min-height: 3.25rem;
            gap: 1.5rem;

            & .meter {
                max-width: 6.375rem;

                & .bar {
                    min-height: 1.25rem;
                    height: 100%;
                    width: 0.375rem;

                    &.maximized {
                        height: 2.25rem;
                    }
                }
            }
        }
    }
</style>