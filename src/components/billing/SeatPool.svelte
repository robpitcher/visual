<script lang="ts">
  import { COST_CENTERS, PLANS, TOTAL_SEATS, credits, fmt, usd, type PlanId } from './data';

  interface Props {
    initialPlan?: PlanId;
    initialCostCenters?: boolean;
    initialCaps?: boolean;
  }

  let { initialPlan = 'business', initialCostCenters = false, initialCaps = false }: Props = $props();

  let planId = $state<PlanId>(initialPlan);
  let costCentersOn = $state(initialCostCenters);
  let capsOn = $state(initialCostCenters && initialCaps);

  const plan = $derived(PLANS[planId]);
  const totalCredits = $derived(credits(plan, TOTAL_SEATS));
  const includedUsageUsd = $derived(totalCredits * 0.01);
  const state = $derived(capsOn ? 'caps' : costCentersOn ? 'cost-centers' : 'pool');

  const costCenterViews = $derived(
    COST_CENTERS.map((center) => {
      const cap = credits(plan, center.seats);
      const used = Math.round((cap * center.usedShare) / 100) * 100;
      return {
        ...center,
        cap,
        used,
        share: cap / totalCredits,
        usedPercent: Math.round(center.usedShare * 100),
        capReached: center.usedShare >= 1,
        compact: center.seats <= 5,
      };
    })
  );

  const seats = $derived(
    COST_CENTERS.flatMap((center) =>
      Array.from({ length: center.seats }, (_, index) => ({
        key: `${center.id}-${index}`,
        color: center.color,
        label: center.name,
      }))
    )
  );

  const explainer = $derived(
    state === 'caps'
      ? {
          strong: 'Caps turn each team\'s share into a hard wall.',
          text: 'A capped cost center can only use the credits its own seats fund.',
        }
      : state === 'cost-centers'
        ? {
            strong: 'Cost centers attribute usage to teams.',
            text: 'By default it\'s still one pool — any team can draw beyond its own seats\' share.',
          }
        : {
            strong: 'One pool for everyone.',
            text: 'Heavy users can draw more; lighter users balance them out. No per-person buckets.',
          }
  );

  const ccVar = (index: 0 | 1 | 2) => `var(--cc-${index})`;

  function toggleCostCenters() {
    costCentersOn = !costCentersOn;
    if (!costCentersOn) capsOn = false;
  }

  function toggleCaps() {
    if (!costCentersOn) return;
    capsOn = !capsOn;
  }

  function setPlan(next: PlanId) {
    planId = next;
  }
</script>

{@html '<!-- THESIS: Seat licenses dissolve into one measurable AI-credit reservoir, refusing per-user-bucket diagrams. OWN-WORLD: Midnight glass, blue/cyan gradients, translucent operational controls, and colored team compartments. STORY: A buyer sees seats fund shared credits, then optionally attributes and hard-walls shares. FIRST VIEWPORT: Badge and headline lead a control bar, then seats, conversion math, and the pool in one left-to-right mechanism. FORM: Approved Visual A billing mockup translated into responsive, interactive components. -->'}
<section class="seat-pool" aria-labelledby="seat-pool-title">
  <div class="heading-row">
    <div class="badge" aria-hidden="true">1</div>
    <div>
      <h2 id="seat-pool-title">Seats become one shared pool of AI credits</h2>
      <p>Each seat's price converts 1:1 into AI credits, and every seat's credits land in the same pool.</p>
    </div>
  </div>

  <div class="controls" aria-label="Seat pool controls">
    <span class="show-label">Show</span>

    <button
      class="switch"
      class:active={costCentersOn}
      type="button"
      role="switch"
      aria-checked={costCentersOn}
      onclick={toggleCostCenters}
    >
      <span class="switch-track" aria-hidden="true"><span></span></span>
      <span>Split into cost centers</span>
    </button>

    <button
      class="switch"
      class:active={capsOn}
      class:disabled={!costCentersOn}
      type="button"
      role="switch"
      aria-checked={capsOn}
      aria-disabled={!costCentersOn}
      disabled={!costCentersOn}
      title={!costCentersOn ? 'Turn on cost centers first' : undefined}
      onclick={toggleCaps}
    >
      <span class="switch-track" aria-hidden="true"><span></span></span>
      <span>Apply included-usage caps</span>
    </button>

    <div class="plan-tabs" role="group" aria-label="Plan">
      <button
        type="button"
        class:active={planId === 'business'}
        aria-pressed={planId === 'business'}
        onclick={() => setPlan('business')}
      >Business</button>
      <button
        type="button"
        class:active={planId === 'enterprise'}
        aria-pressed={planId === 'enterprise'}
        onclick={() => setPlan('enterprise')}
      >Enterprise</button>
    </div>
  </div>

  <div class="mechanism" class:is-caps={capsOn}>
    <section class="panel seats-panel" aria-labelledby="seat-count-label">
      <h3 id="seat-count-label">{TOTAL_SEATS} seats</h3>
      <div class="people-grid" aria-label={`${TOTAL_SEATS} seats`}>
        {#each seats as seat (seat.key)}
          <span
            class="person"
            style:--seat-color={costCentersOn ? ccVar(seat.color) : 'var(--accent)'}
            title={costCentersOn ? seat.label : plan.name}
            aria-hidden="true"
          >
            <svg viewBox="0 0 16 26" focusable="false">
              <circle cx="8" cy="6" r="5"></circle>
              <path d="M0 25a8 8.5 0 0 1 16 0z"></path>
            </svg>
          </span>
        {/each}
      </div>

      {#if costCentersOn}
        <div class="legend" aria-label="Cost center seat counts">
          {#each costCenterViews as center (center.id)}
            <div class="legend-item" style:--center-color={ccVar(center.color)}>
              <span class="dot" aria-hidden="true"></span>
              <span>{center.name}</span>
              <strong>{center.seats} seats</strong>
            </div>
          {/each}
        </div>
      {:else}
        <p class="caption">{plan.name} · {usd(plan.seatUsd)} / seat / month</p>
      {/if}
    </section>

    <section class="panel conversion-panel" aria-labelledby="conversion-label">
      <h3 id="conversion-label">Each seat adds</h3>
      <div class="conversion-stack">
        <div class="math-card">
          <strong>1 seat</strong>
          <span>{plan.name}</span>
        </div>
        <svg class="down-arrow" viewBox="0 0 18 28" aria-hidden="true">
          <path d="M9 1v24m0 0 6-6m-6 6-6-6"></path>
        </svg>
        <div class="math-card">
          <strong>{usd(plan.seatUsd)}</strong>
          <span>per month</span>
        </div>
        <svg class="down-arrow" viewBox="0 0 18 28" aria-hidden="true">
          <path d="M9 1v24m0 0 6-6m-6 6-6-6"></path>
        </svg>
        <div class="math-card credit-card">
          <strong>{fmt(plan.creditsPerSeat)} credits</strong>
          <span>{usd(plan.seatUsd)} ÷ $0.01</span>
        </div>
      </div>
    </section>

    <div class="multiply" aria-hidden="true">
      <span>× {TOTAL_SEATS}</span>
      <svg viewBox="0 0 74 16">
        <path d="M1 8h68m0 0-7-6m7 6-7 6"></path>
      </svg>
    </div>

    <section class="panel pool-panel" aria-labelledby="pool-label">
      <h3 id="pool-label">Enterprise pool · this month</h3>

      {#if !costCentersOn}
        <div class="pool-box single-pool">
          <div>
            <strong>{fmt(totalCredits)}</strong>
            <span>AI credits shared by everyone</span>
            <em>= {usd(includedUsageUsd)} of usage included</em>
          </div>
        </div>
        <p class="caption">Resets on the 1st of each month · no rollover</p>
      {:else}
        <div class="pool-box split-pool" class:capped={capsOn}>
          {#each costCenterViews as center (center.id)}
            <article
              class="segment"
              class:cap-segment={capsOn}
              class:at-cap={capsOn && center.capReached}
              class:compact={capsOn && center.compact}
              style:--center-color={ccVar(center.color)}
            >
              {#if capsOn}
                <span class="used-fill" style:--used-scale={center.usedShare} aria-hidden="true"></span>
                <div class="segment-content">
                  <div class="segment-topline">
                    <strong>{center.name}</strong>
                    <span class="usage">{fmt(center.used)} / {fmt(center.cap)}</span>
                    <svg class="lock" viewBox="0 0 16 18" aria-hidden="true">
                      <path d="M3 8h10v8H3z"></path>
                      <path d="M5 8V5a3 3 0 0 1 6 0v3"></path>
                    </svg>
                  </div>
                  {#if !center.compact}
                    <p>{center.seats} seats × {fmt(plan.creditsPerSeat)} = cap of {fmt(center.cap)}</p>
                    {#if center.capReached}
                      <div class="cap-row">
                        <span class="pill">Cap reached</span>
                        <span>→ block, or allow paid overage</span>
                      </div>
                    {:else}
                      <p>{center.usedPercent}% used</p>
                    {/if}
                  {/if}
                </div>
              {:else}
                <div class="segment-content">
                  <div class="segment-topline">
                    <strong>{center.name}</strong>
                    <span>{fmt(center.cap)} credits</span>
                  </div>
                  {#if !center.compact}
                    <p>{center.seats} seats × {fmt(plan.creditsPerSeat)} = {fmt(center.cap)}</p>
                    <p>{Math.round(center.share * 100)}% of the pool</p>
                  {/if}
                </div>
              {/if}
            </article>
          {/each}
        </div>
        <p class="caption">Total {fmt(totalCredits)} credits · resets on the 1st · no rollover</p>
      {/if}
    </section>
  </div>

  <div class="explainer" aria-live="polite">
    <span class="info" aria-hidden="true">i</span>
    <p><strong>{explainer.strong}</strong> <span>{explainer.text}</span></p>
  </div>
</section>

<style>
  .seat-pool {
    container-type: inline-size;
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: calc(var(--radius) + 2px);
    background: var(--card-grad);
    box-shadow: var(--shadow);
    color: var(--text);
    font-family: var(--font-sans);
    padding: clamp(1.25rem, 3vw, 2.25rem);
  }

  .heading-row {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1rem;
    align-items: start;
  }

  .badge {
    display: grid;
    width: 2.125rem;
    height: 2.125rem;
    place-items: center;
    border-radius: var(--radius-pill);
    background: var(--accent-grad);
    color: var(--on-accent);
    font-weight: 800;
    line-height: 1;
  }

  h2,
  h3,
  p {
    margin: 0;
  }

  h2 {
    max-width: none;
    font-size: clamp(1.42rem, 2.35vw, 1.62rem);
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.16;
  }

  .heading-row p {
    margin-top: 0.9rem;
    max-width: 72ch;
    color: var(--muted);
    font-size: 0.94rem;
    line-height: 1.55;
  }

  .controls {
    display: flex;
    flex-wrap: wrap;
    gap: 0.9rem 1.45rem;
    align-items: center;
    margin-top: 1.7rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--surface-2);
    padding: 0.72rem clamp(0.85rem, 2vw, 1.4rem);
  }

  .show-label,
  h3 {
    color: var(--muted);
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  button {
    font: inherit;
  }

  .switch {
    display: inline-flex;
    min-height: 2rem;
    align-items: center;
    gap: 0.65rem;
    border: 0;
    background: transparent;
    color: var(--muted);
    cursor: pointer;
    font-size: 0.91rem;
    font-weight: 700;
    padding: 0;
    transition: color var(--dur) var(--ease), opacity var(--dur) var(--ease);
  }

  .switch.active {
    color: var(--text);
  }

  .switch.disabled {
    cursor: not-allowed;
    opacity: 0.58;
  }

  .switch-track {
    position: relative;
    display: inline-flex;
    width: 2.95rem;
    height: 1.55rem;
    flex: 0 0 auto;
    align-items: center;
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-pill);
    background: var(--faint);
    transition: background var(--dur) var(--ease), border-color var(--dur) var(--ease);
  }

  .switch-track span {
    position: absolute;
    left: 0.2rem;
    width: 1.08rem;
    height: 1.08rem;
    border-radius: var(--radius-pill);
    background: var(--muted);
    transition: transform var(--dur) var(--ease), background var(--dur) var(--ease);
  }

  .switch.active .switch-track {
    border-color: color-mix(in srgb, var(--accent) 75%, var(--border));
    background: var(--accent);
  }

  .switch.active .switch-track span {
    background: var(--on-accent);
    transform: translateX(1.38rem);
  }

  .switch:focus-visible,
  .plan-tabs button:focus-visible {
    outline: 2px solid var(--accent-2);
    outline-offset: 3px;
  }

  .plan-tabs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    min-width: min(100%, 16rem);
    margin-left: auto;
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);
    background: var(--bg);
    padding: 0.18rem;
  }

  .plan-tabs button {
    border: 0;
    border-radius: var(--radius-pill);
    background: transparent;
    color: var(--muted);
    cursor: pointer;
    font-weight: 800;
    padding: 0.43rem 1rem;
    transition: background var(--dur) var(--ease), color var(--dur) var(--ease), box-shadow var(--dur) var(--ease);
  }

  .plan-tabs button.active {
    background: var(--accent-grad);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--on-accent) 30%, transparent);
    color: var(--on-accent);
  }

  .mechanism {
    display: grid;
    grid-template-columns: minmax(13rem, 1fr) minmax(11rem, 0.72fr) minmax(3.8rem, 0.18fr) minmax(20rem, 1.75fr);
    gap: clamp(1rem, 2vw, 1.8rem);
    align-items: start;
    margin-top: 2rem;
  }

  .panel {
    min-width: 0;
  }

  .people-grid {
    display: grid;
    grid-template-columns: repeat(10, minmax(0, 1rem));
    gap: 0.48rem 0.66rem;
    margin-top: 1.1rem;
    max-width: 15.7rem;
  }

  .person {
    display: block;
    color: var(--seat-color);
    line-height: 0;
    transition: color var(--dur) var(--ease), transform var(--dur) var(--ease);
  }

  .person svg {
    display: block;
    width: 1rem;
    height: 1.625rem;
    fill: currentColor;
  }

  .legend {
    display: grid;
    gap: 0.55rem;
    margin-top: 1.05rem;
    max-width: 14rem;
  }

  .legend-item {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 0.62rem;
    align-items: center;
    color: var(--text);
    font-size: 0.86rem;
    font-weight: 700;
  }

  .legend-item strong {
    color: var(--muted);
    font-weight: 600;
  }

  .dot {
    width: 0.72rem;
    height: 0.72rem;
    border-radius: var(--radius-pill);
    background: var(--center-color);
  }

  .caption {
    margin-top: 1rem;
    color: var(--muted);
    font-size: 0.86rem;
    line-height: 1.35;
  }

  .conversion-panel {
    display: grid;
    justify-items: center;
  }

  .conversion-stack {
    display: grid;
    justify-items: center;
    margin-top: 1.05rem;
    width: min(100%, 11.8rem);
  }

  .math-card {
    display: grid;
    width: 100%;
    min-height: 3.7rem;
    place-items: center;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--surface-2);
    padding: 0.45rem 0.75rem;
    text-align: center;
  }

  .math-card strong {
    font-size: 1.04rem;
    line-height: 1.1;
  }

  .math-card span {
    color: var(--muted);
    font-size: 0.78rem;
  }

  .credit-card {
    border-color: color-mix(in srgb, var(--accent) 82%, var(--border));
    background: var(--accent-soft);
  }

  .down-arrow,
  .multiply svg {
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 2;
  }

  .down-arrow {
    width: 1.1rem;
    height: 1.75rem;
    color: var(--muted);
  }

  .multiply {
    display: grid;
    width: min(4.7rem, 100%);
    gap: 0.15rem;
    align-self: start;
    justify-self: center;
    margin-top: 9rem;
    color: var(--accent);
    font-weight: 900;
    text-align: center;
  }

  .multiply svg {
    width: 100%;
    height: 1rem;
  }

  .pool-panel h3 {
    margin-bottom: 1.05rem;
  }

  .pool-box {
    overflow: hidden;
    min-height: 19rem;
    border: 1px solid var(--border-strong);
    border-radius: var(--radius);
    background: var(--surface);
  }

  .single-pool {
    display: grid;
    place-items: center;
    border-color: var(--border-strong);
    padding: 0.4rem;
  }

  .single-pool > div {
    display: grid;
    width: 100%;
    height: 100%;
    min-height: 18.2rem;
    place-content: center;
    border-radius: calc(var(--radius) - 5px);
    background: var(--pool-grad);
    color: var(--on-accent);
    text-align: center;
  }

  .single-pool strong {
    font-size: clamp(3.3rem, 8vw, 4.7rem);
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.06em;
    line-height: 0.95;
  }

  .single-pool span {
    margin-top: 0.85rem;
    font-size: 1.04rem;
    font-weight: 700;
  }

  .single-pool em {
    margin-top: 0.42rem;
    color: color-mix(in srgb, var(--on-accent) 72%, transparent);
    font-size: 0.9rem;
    font-style: normal;
  }

  .split-pool {
    display: grid;
    grid-template-rows: 30fr 15fr 5fr;
    padding: 0.38rem;
    transition: grid-template-rows var(--dur) var(--ease);
  }

  .split-pool.capped {
    gap: 0.6rem;
    border-color: transparent;
    background: transparent;
    padding: 0;
  }

  .segment {
    position: relative;
    isolation: isolate;
    min-height: 2.35rem;
    overflow: hidden;
    background: linear-gradient(100deg, color-mix(in srgb, var(--center-color) 95%, transparent), color-mix(in srgb, var(--center-color) 55%, var(--surface-solid)));
    color: var(--on-accent);
    transition: opacity var(--dur) var(--ease), border-color var(--dur) var(--ease), background var(--dur) var(--ease);
  }

  .segment:first-child {
    border-top-left-radius: calc(var(--radius) - 5px);
    border-top-right-radius: calc(var(--radius) - 5px);
  }

  .segment:last-child {
    border-bottom-left-radius: calc(var(--radius) - 5px);
    border-bottom-right-radius: calc(var(--radius) - 5px);
  }

  .cap-segment {
    min-height: 2.55rem;
    border: 2px solid var(--center-color);
    border-radius: var(--radius-sm);
    background: var(--surface-2);
    color: var(--text);
  }

  .cap-segment:first-child,
  .cap-segment:last-child {
    border-radius: var(--radius-sm);
  }

  .cap-segment.at-cap {
    border-color: var(--bad);
  }

  .used-fill {
    position: absolute;
    inset: 0 auto 0 0;
    z-index: 0;
    width: 100%;
    border-radius: calc(var(--radius-sm) - 4px);
    background: linear-gradient(100deg, color-mix(in srgb, var(--center-color) 98%, transparent), color-mix(in srgb, var(--center-color) 62%, var(--surface-solid)));
    transform: scaleX(var(--used-scale));
    transform-origin: left center;
    transition: transform var(--dur) var(--ease);
  }

  .segment-content {
    position: relative;
    z-index: 1;
    display: grid;
    gap: 0.42rem;
    padding: clamp(0.72rem, 1.6vw, 1rem) clamp(0.8rem, 2vw, 1.2rem);
  }

  .segment-topline {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto auto;
    gap: 0.55rem;
    align-items: center;
    font-variant-numeric: tabular-nums;
  }

  .segment strong {
    min-width: 0;
    overflow: hidden;
    font-size: clamp(0.96rem, 2vw, 1.08rem);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .segment span,
  .segment p {
    font-size: 0.86rem;
    font-weight: 700;
    line-height: 1.24;
  }

  .segment p {
    color: color-mix(in srgb, currentColor 80%, transparent);
  }

  .usage {
    color: var(--text);
  }

  .lock {
    width: 1rem;
    height: 1.125rem;
    fill: var(--center-color);
    stroke: var(--center-color);
    stroke-linejoin: round;
    stroke-width: 1.7;
  }

  .at-cap .lock {
    fill: var(--bad);
    stroke: var(--bad);
  }

  .cap-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.42rem 0.75rem;
    align-items: center;
    font-size: 0.82rem;
    font-weight: 800;
  }

  .pill {
    border-radius: var(--radius-pill);
    background: var(--bad);
    color: var(--on-accent);
    padding: 0.22rem 0.72rem;
  }

  .compact .segment-content {
    height: 100%;
    align-content: center;
    padding-block: 0.38rem;
  }

  .compact .segment-topline {
    grid-template-columns: minmax(0, 1fr) auto auto;
  }

  .explainer {
    display: flex;
    gap: 0.8rem;
    align-items: flex-start;
    margin-top: 1.55rem;
    border-top: 1px solid var(--border);
    padding-top: 1.15rem;
  }

  .info {
    display: grid;
    width: 1.35rem;
    height: 1.35rem;
    flex: 0 0 auto;
    place-items: center;
    border: 2px solid var(--accent-2);
    border-radius: var(--radius-pill);
    color: var(--accent-2);
    font-size: 0.78rem;
    font-weight: 900;
    line-height: 1;
  }

  .explainer p {
    color: var(--muted);
    font-size: 0.95rem;
    line-height: 1.45;
  }

  .explainer strong {
    color: var(--text);
  }

  * {
    box-sizing: border-box;
  }

  @container (max-width: 900px) {
    .mechanism {
      grid-template-columns: 1fr;
    }

    .seats-panel,
    .conversion-panel,
    .pool-panel {
      width: 100%;
    }

    .conversion-stack {
      width: min(100%, 15rem);
    }

    .multiply {
      display: flex;
      width: auto;
      align-items: center;
      justify-content: center;
      gap: 0.55rem;
      margin-top: -0.25rem;
    }

    .multiply svg {
      width: 1rem;
      height: 3rem;
      transform: rotate(90deg);
    }

    .people-grid {
      max-width: 100%;
    }

    .pool-box {
      min-height: 17rem;
    }
  }

  @container (max-width: 620px) {
    .seat-pool {
      padding: 1rem;
    }

    .heading-row {
      gap: 0.75rem;
    }

    h2 {
      font-size: 1.35rem;
    }

    .controls {
      align-items: stretch;
      gap: 0.8rem;
    }

    .show-label {
      width: 100%;
    }

    .switch {
      width: 100%;
      justify-content: flex-start;
    }

    .plan-tabs {
      width: 100%;
      margin-left: 0;
    }

    .people-grid {
      grid-template-columns: repeat(10, minmax(0, 0.92rem));
      gap: 0.42rem 0.45rem;
    }

    .person svg {
      width: 0.92rem;
    }

    .legend-item {
      grid-template-columns: auto 1fr;
    }

    .legend-item strong {
      grid-column: 2;
    }

    .pool-box {
      min-height: 15.5rem;
    }

    .single-pool > div {
      min-height: 14.5rem;
    }

    .segment-topline {
      gap: 0.35rem;
    }

    .segment span,
    .segment p {
      font-size: 0.78rem;
    }

    .cap-segment:not(.compact) .segment-topline {
      grid-template-columns: minmax(0, 1fr) auto;
    }

    .cap-segment:not(.compact) .lock {
      display: none;
    }

    .explainer {
      gap: 0.6rem;
    }
  }

  @container (max-width: 390px) {
    .seat-pool {
      border-radius: var(--radius);
      padding: 0.9rem;
    }

    .badge {
      width: 1.85rem;
      height: 1.85rem;
    }

    .heading-row p,
    .caption,
    .explainer p {
      font-size: 0.82rem;
    }

    .controls {
      padding: 0.7rem;
    }

    .switch {
      font-size: 0.82rem;
    }

    .plan-tabs button {
      padding-inline: 0.45rem;
      font-size: 0.84rem;
    }

    .mechanism {
      gap: 1.35rem;
    }

    .people-grid {
      grid-template-columns: repeat(10, minmax(0, 0.78rem));
      gap: 0.34rem 0.32rem;
    }

    .person svg {
      width: 0.78rem;
      height: 1.27rem;
    }

    .pool-box {
      min-height: 14.5rem;
    }

    .single-pool strong {
      font-size: 2.85rem;
    }

    .single-pool span {
      font-size: 0.88rem;
    }

    .segment-content {
      padding-inline: 0.7rem;
    }

    .segment strong {
      font-size: 0.9rem;
    }

    .usage {
      max-width: 7.2rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
</style>
