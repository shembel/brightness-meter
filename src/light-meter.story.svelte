<script>
    import LightMeter from './light-meter.svelte'
    export let Hst

    let min = 0
    let max = 1
    let optimum = 0.65
    let value = 0.5
    let withoutCamera = false;
    let withCamera = true;

    $: step = (max - min) / 10

    function formatValue(operation) {
        switch (operation) {
            case 'decrement':
                value = Number(Math.max(min, value - step).toFixed(2))
                break;
            case 'increment':
                value = Number(Math.min(max, value + step).toFixed(2))
                break;
        }
    }
</script>

<svelte:component this={Hst.Story}>
    <svelte:component this={Hst.Variant} title="Without Camera">
        <LightMeter {min} {max} {optimum} {value} useCamera={withoutCamera}/>

        <svelte:fragment slot="controls">
            <div class="histoire-controls">
                <div class="buttons">
                    <button on:click={() => formatValue('decrement')}>Value -{step}</button>
                    <button on:click={() => formatValue('increment')}>Value +{step}</button>
                </div>

                Min: <input type="number" bind:value={min} />
                Max: <input type="number" bind:value={max} />
                Optimum: <input type="number" bind:value={optimum} />
                Value: <input type="number" bind:value={value} />
            </div>

        </svelte:fragment>
    </svelte:component>

    <svelte:component this={Hst.Variant} title="With Camera">
        <LightMeter {min} {max} {optimum} {value} useCamera={withCamera}/>

        <svelte:fragment slot="controls">
            <h2>Please turn your camera on and allow browser to use it to see the effect.</h2>
        </svelte:fragment>
    </svelte:component>
</svelte:component>

<style>
    .histoire-controls {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        color: black;
    }

    h2 {
        padding: 1rem;
        color: coral;
    }
</style>