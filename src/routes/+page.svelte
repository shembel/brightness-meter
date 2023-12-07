<script lang="ts">
    import LightMeter from '../light-meter.svelte';
</script>

<main>
    <LightMeter  />
</main>

<style>
    :global(html) {
        font-size: 16px; /* 1rem = 16px */
    }

    :global(body) {
        background-color: #333;
        height: 100vh;
        width: 100vw;
    }

    main {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        width: 100%;
    }
</style>