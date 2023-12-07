<script lang="ts">
    import { onMount } from 'svelte';
    import { flip } from 'svelte/animate';
    import { quintOut } from 'svelte/easing';

    import MoonIcon from '$lib/components/icons/MoonIcon.svelte';
    import SunIcon from '$lib/components/icons/SunIcon.svelte';

    // possible to omit min though because it defaults to 0
    // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meter#high_and_low_range_example
    export let min = 0;
    export let max = 1;
    export let optimum = 0.65;
    export let useCamera = true;
    export let value = 0;

    $: activeSegment = calculateSegment(value);

    let video: HTMLVideoElement;


    /**
     * Initializes and prepares the video stream from the user's
     * media devices (camera). It creates a video and canvas elements and fetches
     * the context of the canvas.
     *
     * @async
     * @function
     * @returns {Promise<{video: HTMLVideoElement, canvas: HTMLCanvasElement, canvasContext: CanvasRenderingContext2D}>} Object containing the video element, canvas element and the canvas context.
     */
    async function prepareCameraData() {
        const videoStreamPromise = navigator.mediaDevices.getUserMedia({ video: true });

        video = document.createElement('video');
        video.srcObject = await videoStreamPromise;
        await video.play();

        const canvas = document.createElement('canvas');

        // https://html.spec.whatwg.org/multipage/canvas.html#concept-canvas-will-read-frequently
        const canvasContext = canvas.getContext('2d', { willReadFrequently: true });

        return { video, canvas, canvasContext };
    }

    onMount(async () => {
        if (!useCamera) {
            return;
        }

        const { video, canvas, canvasContext } = await prepareCameraData();

        /**
         * Analyzes the current video frame and updates the variable `value` to the average brightness of the frame.
         * Calls itself recursively after a delay to continuously analyze the video frames.
         */
        const analyzeFrame = () => {
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

        analyzeFrame();
    });

    /**
     * Given an input value, this function calculates active segment number in the meter
     *
     * @param {number} brightness - brightness value
     * @param {number} [numSegments=7] - total number of segments (default is 7)
     * @return {number} active segment number
     */
    function calculateSegment(value: number, numSegments: number = 7): number {
        const segmentSize = (max - min) / numSegments;
        const activeSegment = Math.min(Math.floor((value - min) / segmentSize) + 1, numSegments);

        return activeSegment;
    }
</script>

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

<style lang="postcss">
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
</style>