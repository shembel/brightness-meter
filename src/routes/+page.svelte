<script lang="ts">
    import LightMeter from '$lib/components/meter/light-meter.svelte';
</script>

<main>
    <LightMeter  />
</main>

<style>
    @import url('https://fonts.googleapis.com/css2?family=Orbitron&display=swap');

    :global(html) {
        font-size: 16px; /* 1rem = 16px */
        font-family: 'Orbitron', sans-serif;

    }

    :global(body) {
        background-color: #333;
        height: 100vh;
        width: 100vw;
    }

    :global(p,h1,h2,h3,h4,h5) {
        margin: 0;
        padding: 0;
    }

    main {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        width: 100%;
    }
</style>